import { z } from 'zod';

const uuid = () =>
  z
    .string({ required_error: 'UUID is required' })
    .uuid({ message: 'Invalid UUID' });

export const USER_ROLES = ['admin', 'clinician', 'family', 'viewer'] as const;
export const DOCUMENT_TYPES = [
  'lab_result',
  'imaging',
  'prescription',
  'medical_report',
  'other',
] as const;
export const TIMELINE_EVENT_TYPES = [
  'surgery',
  'procedure',
  'evaluation',
  'dialysis',
  'status',
  'medication',
  'lab_result',
  'imaging',
  'consultation',
  'transfer',
  'admission',
  'discharge',
] as const;
export const TIMELINE_SEVERITIES = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
] as const;
export const TIMELINE_STATUSES = [
  'completed',
  'ongoing',
  'pending',
  'cancelled',
] as const;

export const userRoleSchema = z.enum(USER_ROLES);

export const patientInsertSchema = z.object({
  full_name: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(1, 'El nombre es obligatorio'),
  external_id: z.string().optional().nullable(),
});

export const membershipInsertSchema = z.object({
  user_id: uuid(),
  patient_id: uuid(),
  role: userRoleSchema.default('viewer'),
});

export const updateInsertSchema = z.object({
  patient_id: uuid(),
  created_by: uuid().optional().nullable(),
  title: z
    .string({ required_error: 'Se requiere un título' })
    .min(1, 'Se requiere un título'),
  description: z.string().optional().nullable(),
  content_type: z.enum(['document', 'text']).default('document'),
  text_content: z.string().optional().nullable(),
});

export const documentInsertSchema = z.object({
  update_id: uuid(),
  document_type: z.enum(DOCUMENT_TYPES),
  file_name: z
    .string({ required_error: 'Se requiere un nombre de archivo' })
    .min(1, 'Se requiere un nombre de archivo'),
  file_path: z
    .string({ required_error: 'Se requiere la ruta del archivo' })
    .min(1, 'Se requiere la ruta del archivo'),
  file_size: z.number().int().nonnegative().optional().nullable(),
  mime_type: z.string().optional().nullable(),
});

export const labResultInsertSchema = z.object({
  patient_id: uuid(),
  update_id: uuid().optional().nullable(),
  document_id: uuid().optional().nullable(),
  test_code: z.string().optional().nullable(),
  test_name: z
    .string({ required_error: 'Se requiere el nombre de la prueba' })
    .min(1, 'Se requiere el nombre de la prueba'),
  value: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  reference_min: z.number().optional().nullable(),
  reference_max: z.number().optional().nullable(),
  is_critical: z.boolean().optional().default(false),
  test_date: z.coerce.date({ invalid_type_error: 'Fecha inválida' }),
});

export const medicationInsertSchema = z.object({
  patient_id: uuid(),
  update_id: uuid().optional().nullable(),
  name: z
    .string({ required_error: 'Se requiere el nombre del medicamento' })
    .min(1, 'Se requiere el nombre del medicamento'),
  dosage: z.string().optional().nullable(),
  frequency: z.string().optional().nullable(),
  route: z.string().optional().nullable(),
  start_date: z.coerce.date().optional().nullable(),
  end_date: z.coerce.date().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  notes: z.string().optional().nullable(),
});

export const timelineEventInsertSchema = z.object({
  patient_id: uuid(),
  event_date: z.coerce.date({ invalid_type_error: 'Fecha inválida' }),
  event_time: z.string().optional().nullable(),
  event_type: z.enum(TIMELINE_EVENT_TYPES),
  severity: z.enum(TIMELINE_SEVERITIES).default('medium'),
  status: z.enum(TIMELINE_STATUSES).default('completed'),
  title: z
    .string({ required_error: 'Se requiere un título' })
    .min(1, 'Se requiere un título'),
  description: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
  related_update_id: uuid().optional().nullable(),
  related_document_id: uuid().optional().nullable(),
  created_by: uuid().optional().nullable(),
});

export const activityLogInsertSchema = z.object({
  user_id: uuid(),
  patient_id: uuid(),
  action: z
    .string({ required_error: 'Se requiere la acción' })
    .min(1, 'Se requiere la acción'),
  entity_type: z.string().optional().nullable(),
  entity_id: uuid().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

export type PatientInsert = z.infer<typeof patientInsertSchema>;
export type MembershipInsert = z.infer<typeof membershipInsertSchema>;
export type UpdateInsert = z.infer<typeof updateInsertSchema>;
export type DocumentInsert = z.infer<typeof documentInsertSchema>;
export type LabResultInsert = z.infer<typeof labResultInsertSchema>;
export type MedicationInsert = z.infer<typeof medicationInsertSchema>;
export type TimelineEventInsert = z.infer<typeof timelineEventInsertSchema>;
export type ActivityLogInsert = z.infer<typeof activityLogInsertSchema>;
