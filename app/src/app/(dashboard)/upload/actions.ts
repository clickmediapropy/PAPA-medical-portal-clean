'use server';

import { createHash, randomUUID } from 'crypto';
import { z } from 'zod';

import { getSupabaseServiceRoleClient } from '@/lib/supabase';
import { logError, logEvent } from '@/lib/logging';
import { DOCUMENT_TYPES } from '@/lib/validation';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const prepareUploadSchema = z.object({
  patientId: z.string().uuid(),
  fileName: z
    .string({ required_error: 'El nombre del archivo es obligatorio' })
    .min(1, 'Archivo inválido'),
  fileType: z.string().min(1, 'Tipo de archivo requerido'),
  fileSize: z
    .number({ required_error: 'El tamaño del archivo es obligatorio' })
    .positive('El archivo debe tener contenido')
    .max(MAX_FILE_SIZE, 'El archivo excede el tamaño máximo de 50MB'),
});

const finalizeUploadSchema = prepareUploadSchema.extend({
  documentId: z.string().uuid(),
  filePath: z.string().min(1, 'La ruta del archivo es obligatoria'),
  title: z
    .string({ required_error: 'El título es obligatorio' })
    .min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  documentType: z.enum(DOCUMENT_TYPES),
});

type PrepareUploadInput = z.infer<typeof prepareUploadSchema>;
type FinalizeUploadInput = z.infer<typeof finalizeUploadSchema>;

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\.]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

export async function createSignedUpload(
  input: PrepareUploadInput,
): Promise<
  ActionResult<{ signedUrl: string; filePath: string; documentId: string }>
> {
  const parsed = prepareUploadSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = getSupabaseServiceRoleClient();
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('id', parsed.data.patientId)
    .maybeSingle();

  if (!patient) {
    return { success: false, error: 'Paciente no encontrado o sin permisos' };
  }

  const documentId = randomUUID();
  const extension = parsed.data.fileName.includes('.')
    ? parsed.data.fileName.substring(parsed.data.fileName.lastIndexOf('.'))
    : '';
  const baseName = slugify(parsed.data.fileName.replace(extension, ''));
  const checksum = createHash('sha1')
    .update(`${parsed.data.fileName}-${Date.now()}`)
    .digest('hex')
    .slice(0, 8);
  const filePath = `${parsed.data.patientId}/${documentId}/${baseName}-${checksum}${extension}`;

  const admin = getSupabaseServiceRoleClient();
  const { data: signedUrlData, error: signedUrlError } = await admin
    .storage
    .from('medical-documents')
    .createSignedUploadUrl(filePath, { upsert: false });

  if (signedUrlError || !signedUrlData) {
    logError('upload', 'Error creating signed upload url', {
      error: signedUrlError?.message,
      patientId: parsed.data.patientId,
    });
    return { success: false, error: 'No se pudo generar la URL de subida' };
  }

  return {
    success: true,
    data: {
      signedUrl: signedUrlData.signedUrl,
      filePath,
      documentId,
    },
  };
}

export async function finalizeUpload(
  input: FinalizeUploadInput,
): Promise<ActionResult<{ updateId: string; documentId: string }>> {
  const parsed = finalizeUploadSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = getSupabaseServiceRoleClient();

  const updateInsert = {
    patient_id: parsed.data.patientId,
    created_by: null,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    status: 'pending' as const,
    content_type: 'document' as const,
  };

  const { data: update, error: updateError } = await supabase
    .from('updates')
    .insert(updateInsert)
    .select('id')
    .single();

  if (updateError || !update) {
    logError('upload', 'Error creating update', {
      error: updateError?.message,
      patientId: parsed.data.patientId,
    });
    return { success: false, error: 'No se pudo registrar la actualización' };
  }

  const { error: documentError } = await supabase
    .from('documents')
    .insert({
      id: parsed.data.documentId,
      update_id: update.id,
      document_type: parsed.data.documentType,
      file_name: parsed.data.fileName,
      file_path: parsed.data.filePath,
      file_size: parsed.data.fileSize,
      mime_type: parsed.data.fileType,
    });

  if (documentError) {
    logError('upload', 'Error creating document', {
      error: documentError.message,
      documentId: parsed.data.documentId,
    });
    return { success: false, error: 'No se pudo registrar el documento' };
  }

  const { error: activityError } = await supabase.from('activity_log').insert({
    user_id: null,
    patient_id: parsed.data.patientId,
    action: 'document_uploaded',
    entity_type: 'document',
    entity_id: parsed.data.documentId,
    metadata: {
      file_name: parsed.data.fileName,
      file_path: parsed.data.filePath,
      document_type: parsed.data.documentType,
    },
  });

  if (activityError) {
    logError('upload', 'Error registering activity', {
      error: activityError.message,
      documentId: parsed.data.documentId,
    });
  }

  const { error: functionError } = await supabase.functions.invoke('process-document', {
    body: {
      document_id: parsed.data.documentId,
      update_id: update.id,
      patient_id: parsed.data.patientId,
    },
  });

  if (functionError) {
    logError('upload', 'Error invoking process-document', {
      error: functionError.message,
      documentId: parsed.data.documentId,
    });
  }

  logEvent('upload', 'Document queued for processing', {
    updateId: update.id,
    documentId: parsed.data.documentId,
  });

  return { success: true, data: { updateId: update.id, documentId: parsed.data.documentId } };
}
