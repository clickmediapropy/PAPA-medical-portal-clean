'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Calendar, Target, Activity } from 'lucide-react';
import type { Database } from '@/lib/supabase';

type CarePlan = Database['public']['Tables']['care_plans']['Row'] & {
  care_tasks: Array<Database['public']['Tables']['care_tasks']['Row'] & {
    care_task_logs: Array<Database['public']['Tables']['care_task_logs']['Row']>;
  }>;
};

type CareTask = Database['public']['Tables']['care_tasks']['Row'] & {
  care_plans: {
    patient_id: string;
    title: string;
  };
  care_task_logs: Array<Database['public']['Tables']['care_task_logs']['Row']>;
};

interface CarePlanDashboardProps {
  carePlans: CarePlan[];
  todaysTasks: CareTask[];
  patientId: string;
  todaysTasksError?: string;
}

export function CarePlanDashboard({ carePlans, todaysTasks, todaysTasksError }: CarePlanDashboardProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Calculate completion statistics
  const totalTasks = carePlans.reduce((sum, plan) => sum + plan.care_tasks.length, 0);
  const completedTasks = carePlans.reduce((sum, plan) => 
    sum + plan.care_tasks.reduce((taskSum, task) => 
      taskSum + task.care_task_logs.filter(log => log.status === 'completed').length, 0
    ), 0
  );

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Get priority color
  const getPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return 'text-gray-600 bg-gray-50';
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get task type icon
  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'medication': return '💊';
      case 'exercise': return '🏃';
      case 'diet': return '🍎';
      case 'monitoring': return '📊';
      case 'appointment': return '📅';
      case 'lifestyle': return '🌱';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-500">Planes Activos</p>
              <p className="text-2xl font-semibold text-slate-900">
                {carePlans.filter(plan => plan.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-500">Tareas Hoy</p>
              <p className="text-2xl font-semibold text-slate-900">{todaysTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-500">Completadas</p>
              <p className="text-2xl font-semibold text-slate-900">{completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-500">Progreso</p>
              <p className="text-2xl font-semibold text-slate-900">
                {Math.round(completionRate)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Priorities */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Prioridades de Hoy</h2>
          <p className="text-sm text-slate-600">Tareas que deben completarse hoy</p>
        </div>
        <div className="p-6">
          {todaysTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">¡Excelente trabajo!</h3>
              <p className="mt-1 text-sm text-slate-500">
                No hay tareas pendientes para hoy.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-md border border-slate-200 p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTaskTypeIcon(task.task_type)}</span>
                    <div>
                      <h3 className="font-medium text-slate-900">{task.title}</h3>
                      <p className="text-sm text-slate-500">{task.care_plans.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPriorityColor(task.priority || 'medium')}`}>
                          {task.priority || 'medium'}
                        </span>
                        <span className="text-xs text-slate-500">{task.frequency}</span>
                        {task.estimated_duration_minutes && (
                          <span className="text-xs text-slate-500">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {task.estimated_duration_minutes} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="rounded-md bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-500">
                      Completar
                    </button>
                    <button className="rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Posponer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tasks Section */}
      <section className="mb-12">
        {todaysTasksError && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al cargar las tareas de hoy</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>No se pudieron cargar las tareas de hoy. Por favor, inténtalo de nuevo más tarde.</p>
                  <p className="mt-1 text-xs opacity-75">Detalles: {todaysTasksError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="grid gap-4">
            {carePlans.map((plan) => (
              <div key={plan.id} className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-slate-900">{plan.title}</h3>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(plan.status || 'active')}`}>
                        {plan.status}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPriorityColor(plan.priority || 'medium')}`}>
                        {plan.priority || 'medium'}
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium text-slate-900">Objetivo:</p>
                      <p className="text-sm text-slate-600">{plan.goal}</p>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-4 text-sm text-slate-500">
                      <span>Inicio: {new Date(plan.start_date).toLocaleDateString('es-ES')}</span>
                      {plan.target_date && (
                        <span>Meta: {new Date(plan.target_date).toLocaleDateString('es-ES')}</span>
                      )}
                      <span>{plan.care_tasks.length} tareas</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
                    className="ml-4 rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {selectedPlan === plan.id ? 'Ocultar' : 'Ver'} Tareas
                  </button>
                </div>
                
                {/* Tasks List */}
                {selectedPlan === plan.id && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <h4 className="text-sm font-medium text-slate-900 mb-3">Tareas del Plan</h4>
                    <div className="space-y-2">
                      {plan.care_tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getTaskTypeIcon(task.task_type)}</span>
                            <div>
                              <h5 className="font-medium text-slate-900">{task.title}</h5>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPriorityColor(task.priority || 'medium')}`}>
                                  {task.priority || 'medium'}
                                </span>
                                <span className="text-xs text-slate-500">{task.frequency}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-slate-500">
                            {task.care_task_logs.filter((log: { status: string | null }) => log.status === 'completed').length} completadas
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

