import type { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServiceRoleClient } from './supabase';
import { logError } from './logging';
import type { Database } from './supabase';
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

export async function getDefaultPatient(
  client?: SupabaseClient<Database>,
) {
  const supabase = client ?? getSupabaseServiceRoleClient();
  const {
    data: patient,
    error,
  } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching patient', error.message);
  }

  return patient;
}

export async function getAllPatients() {
  try {
    const supabase = getSupabaseServiceRoleClient();
    
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logError('patients', 'Error fetching patients', { error: error.message });
      return { success: false, error: error.message };
    }

    return { success: true, data: patients };
  } catch (error) {
    logError('patients', 'Error fetching patients', { error });
    return { success: false, error: 'Failed to fetch patients' };
  }
}

export async function createPatient(data: z.infer<typeof createPatientSchema>) {
  try {
    const validatedData = createPatientSchema.parse(data);
    const supabase = getSupabaseServiceRoleClient();

    const { data: patient, error } = await supabase
      .from('patients')
      .insert({
        full_name: validatedData.fullName,
        external_id: validatedData.externalId || null,
        date_of_birth: validatedData.dateOfBirth || null,
        gender: validatedData.gender || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        address: validatedData.address || null,
        emergency_contact: validatedData.emergencyContact || null,
        medical_conditions: validatedData.medicalConditions || null,
        allergies: validatedData.allergies || null,
        medications: validatedData.medications || null,
      })
      .select()
      .single();

    if (error) {
      logError('patients', 'Error creating patient', { error: error.message, data: validatedData });
      return { success: false, error: error.message };
    }

    return { success: true, data: patient };
  } catch (error) {
    logError('patients', 'Error creating patient', { error });
    return { success: false, error: 'Invalid data provided' };
  }
}

interface PatientUpdateData {
  full_name?: string;
  external_id?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  medical_conditions?: string;
  allergies?: string;
  medications?: string;
}

export async function updatePatient(patientId: string, data: Partial<z.infer<typeof createPatientSchema>>) {
  try {
    const supabase = getSupabaseServiceRoleClient();

    const updateData: PatientUpdateData = {};
    if (data.fullName) updateData.full_name = data.fullName;
    if (data.externalId !== undefined) updateData.external_id = data.externalId;
    if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.emergencyContact !== undefined) updateData.emergency_contact = data.emergencyContact;
    if (data.medicalConditions !== undefined) updateData.medical_conditions = data.medicalConditions;
    if (data.allergies !== undefined) updateData.allergies = data.allergies;
    if (data.medications !== undefined) updateData.medications = data.medications;

    const { data: patient, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', patientId)
      .select()
      .single();

    if (error) {
      logError('patients', 'Error updating patient', { error: error.message, patientId, data });
      return { success: false, error: error.message };
    }

    return { success: true, data: patient };
  } catch (error) {
    logError('patients', 'Error updating patient', { error });
    return { success: false, error: 'Failed to update patient' };
  }
}

export async function deletePatient(patientId: string) {
  try {
    const supabase = getSupabaseServiceRoleClient();

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);

    if (error) {
      logError('patients', 'Error deleting patient', { error: error.message, patientId });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logError('patients', 'Error deleting patient', { error });
    return { success: false, error: 'Failed to delete patient' };
  }
}