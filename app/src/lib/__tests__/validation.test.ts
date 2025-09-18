import { describe, expect, it } from 'vitest';

import {
  DOCUMENT_TYPES,
  documentInsertSchema,
  labResultInsertSchema,
} from '@/lib/validation';

describe('validation schemas', () => {
  it('accepts valid document payload', () => {
    const payload = {
      update_id: crypto.randomUUID(),
      document_type: DOCUMENT_TYPES[0],
      file_name: 'results.pdf',
      file_path: 'patient/document/results.pdf',
      file_size: 1024,
      mime_type: 'application/pdf',
    };

    expect(() => documentInsertSchema.parse(payload)).not.toThrow();
  });

  it('rejects invalid lab result without test name', () => {
    const payload = {
      patient_id: crypto.randomUUID(),
      test_date: new Date().toISOString(),
    };

    expect(() => labResultInsertSchema.parse(payload)).toThrow();
  });
});
