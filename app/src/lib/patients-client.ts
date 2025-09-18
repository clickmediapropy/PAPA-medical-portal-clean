'use client';

import { z } from 'zod';

const createPatientSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es requerido'),
  externalId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
});

export async function createPatientClient(data: z.infer<typeof createPatientSchema>) {
  try {
    const validatedData = createPatientSchema.parse(data);

    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating patient');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating patient:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create patient' 
    };
  }
}

