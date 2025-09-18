import { getSupabaseServiceRoleClient } from './supabase';

export interface CarePlanTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  frequency: string;
  estimated_duration_minutes?: number;
  care_plan_id: string;
  care_plans: {
    id: string;
    title: string;
    patient_id: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CarePlan {
  id: string;
  title: string;
  description?: string;
  goal: string;
  patient_id: string;
  professional_id?: string;
  status: 'active' | 'inactive' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export async function getTodaysTasks(patientId?: string) {
  const supabase = getSupabaseServiceRoleClient();

  try {
    let query = supabase
      .from('care_tasks')
      .select(`
        *,
        care_plans!inner(
          id,
          title,
          patient_id,
          status
        )
      `)
      .eq('care_plans.status', 'active');

    if (patientId) {
      query = query.eq('care_plans.patient_id', patientId);
    }

    const { data, error } = await query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching today\'s tasks:', error);
      throw error;
    }

    return data as CarePlanTask[];
  } catch (error) {
    console.error('Error in getTodaysTasks:', error);
    throw error;
  }
}

export async function getCarePlans(patientId?: string) {
  const supabase = getSupabaseServiceRoleClient();

  try {
    let query = supabase
      .from('care_plans')
      .select('*');

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching care plans:', error);
      throw error;
    }

    return data as CarePlan[];
  } catch (error) {
    console.error('Error in getCarePlans:', error);
    throw error;
  }
}

export async function createCarePlan(carePlan: Omit<CarePlan, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseServiceRoleClient();

  try {
    const { data, error } = await supabase
      .from('care_plans')
      .insert(carePlan)
      .select()
      .single();

    if (error) {
      console.error('Error creating care plan:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createCarePlan:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateCarePlan(id: string, updates: Partial<CarePlan>) {
  const supabase = getSupabaseServiceRoleClient();

  try {
    const { data, error } = await supabase
      .from('care_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating care plan:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateCarePlan:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}