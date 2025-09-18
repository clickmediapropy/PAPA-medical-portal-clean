'use client';

import { FormEvent, useState, useTransition } from 'react';

import { createSignedUpload, finalizeUpload } from '@/app/(dashboard)/upload/actions';
import { DOCUMENT_TYPES } from '@/lib/validation';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

export function UploadDocumentForm({ patientId }: { patientId: string }) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('file') as File | null;

    if (!file) {
      setErrorMessage('Selecciona un archivo para continuar');
      return;
    }

    const documentType = formData.get('documentType');
    const title = (formData.get('title') as string | null)?.trim();
    const description = (formData.get('description') as string | null)?.trim();

    if (!documentType || typeof documentType !== 'string') {
      setErrorMessage('Selecciona un tipo de documento');
      return;
    }

    if (!title) {
      setErrorMessage('Ingresa un título descriptivo');
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      setStatusMessage('Generando URL de subida...');

      const signedUpload = await createSignedUpload({
        patientId,
        fileName: file.name,
        fileType: file.type || DEFAULT_CONTENT_TYPE,
        fileSize: file.size,
      });

      if (!signedUpload.success) {
        setErrorMessage(signedUpload.error);
        setStatusMessage(null);
        return;
      }

      setStatusMessage('Subiendo archivo seguro...');

      const uploadResponse = await fetch(signedUpload.data.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || DEFAULT_CONTENT_TYPE,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        setErrorMessage('No se pudo subir el archivo al almacenamiento');
        setStatusMessage(null);
        return;
      }

      setStatusMessage('Registrando documento en la base de datos...');

      const finalize = await finalizeUpload({
        patientId,
        documentId: signedUpload.data.documentId,
        filePath: signedUpload.data.filePath,
        fileName: file.name,
        fileType: file.type || DEFAULT_CONTENT_TYPE,
        fileSize: file.size,
        title,
        description: description ?? undefined,
        documentType: documentType as (typeof DOCUMENT_TYPES)[number],
      });

      if (!finalize.success) {
        setErrorMessage(finalize.error);
        setStatusMessage(null);
        return;
      }

      setStatusMessage('Documento subido correctamente. El procesamiento comenzará en breve.');
      setErrorMessage(null);
      form.reset();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="file" className="text-sm font-medium text-slate-700">
            Archivo
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <p className="text-xs text-slate-500">
            Se admiten archivos PDF, imágenes y texto plano hasta 50MB.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="documentType" className="text-sm font-medium text-slate-700">
            Tipo de documento
          </label>
          <select
            id="documentType"
            name="documentType"
            required
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ej. Hemograma completo 15/09/2025"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Notas adicionales (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Contexto clínico, instrucciones o comentarios relevantes"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {errorMessage ? (
        <p className="rounded-md bg-red-50 p-2 text-sm text-red-600">{errorMessage}</p>
      ) : null}
      {statusMessage ? (
        <p className="rounded-md bg-slate-50 p-2 text-sm text-slate-600">{statusMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Procesando...' : 'Subir documento'}
      </button>
    </form>
  );
}
