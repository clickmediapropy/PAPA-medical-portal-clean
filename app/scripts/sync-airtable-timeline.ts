#!/usr/bin/env tsx

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/types.gen';

// Direct Supabase client for scripts
function getSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🔍 Environment check:');
  console.log('  URL exists:', !!supabaseUrl);
  console.log('  Service key exists:', !!supabaseServiceKey);

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Get default patient for scripts
async function getDefaultPatient(supabase: ReturnType<typeof getSupabaseServiceRoleClient>) {
  const { data } = await supabase
    .from('patients')
    .select('*')
    .limit(1)
    .single();

  return data;
}

interface AirtableEvent {
  id: string;
  fields: {
    Fecha?: string;
    Hora?: string;
    Tipo?: string;
    Título?: string;
    Descripción?: string;
    Urgencia?: string;
    'Días Desde Evento'?: number | { specialValue: 'NaN' };
  };
}

// Map Airtable event types to Supabase timeline event types
function mapEventType(airtableType?: string): 'surgery' | 'procedure' | 'evaluation' | 'dialysis' | 'status' | 'medication' | 'lab_result' | 'imaging' | 'consultation' | 'transfer' | 'admission' | 'discharge' {
  if (!airtableType) return 'status';

  const typeMap: Record<string, 'surgery' | 'procedure' | 'evaluation' | 'dialysis' | 'status' | 'medication' | 'lab_result' | 'imaging' | 'consultation' | 'transfer' | 'admission' | 'discharge'> = {
    'Laboratorio': 'lab_result',
    'Consulta': 'consultation',
    'Procedimiento': 'procedure',
    'Síntoma': 'status',
    'Medicamento': 'medication',
    'Diálisis': 'dialysis',
    'Cirugía': 'surgery',
    'Estudio por imágenes': 'imaging',
    'Imagenología': 'imaging',
    'Solicitud': 'status',
    'Observación clínica': 'evaluation',
    'Episodio agudo': 'status',
    'Intervención': 'procedure',
    'Evolución Médica': 'evaluation',
    'Evolución médica': 'evaluation',
    'Evolución Clínica': 'evaluation',
    'Consulta / Asignación de especialista': 'consultation',
    'Diagnóstico presuntivo': 'evaluation',
    'Comentario médico': 'evaluation',
    'Estudio diagnóstico': 'evaluation'
  };

  return typeMap[airtableType] || 'status';
}

// Map Airtable urgency to Supabase severity
function mapSeverity(airtableUrgency?: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  if (!airtableUrgency) return 'info';

  const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low' | 'info'> = {
    'crítico': 'critical',
    'alto': 'high',
    'alta': 'high',
    'Alta': 'high',
    'medio': 'medium',
    'media': 'medium',
    'Media': 'medium',
    'bajo': 'low',
    'baja': 'low',
    'No urgente': 'low',
    'Programado': 'info',
    'Rutina': 'info'
  };

  return severityMap[airtableUrgency] || 'info';
}

async function syncAirtableToTimeline() {
  console.log('🔄 Starting Airtable to Timeline sync...\n');

  try {
    const supabase = getSupabaseServiceRoleClient();
    const patient = await getDefaultPatient(supabase);

    if (!patient) {
      console.error('❌ No default patient found');
      return;
    }

    console.log(`📋 Syncing timeline for patient: ${patient.full_name}`);

    // Get medical events from Airtable (use the data we already fetched)
    const airtableEvents: AirtableEvent[] = [
      {
        "id": "rec7noslAbFBtpdoL",
        "fields": {
          "Fecha": "2025-09-19",
          "Hora": "13:00",
          "Tipo": "Comentario médico",
          "Título": "Recomendación de Nicky (cuñado y médico) sobre traslado",
          "Descripción": "Nicky, cuñado del paciente y médico, recomendó que si se considera necesario pasarlo a sala normal, estaría más seguro en IPS que en una sala común por el tema neurológico y de diálisis. Opina que Jorge se quede mínimo 10 días más en UTI y recién ahí considerar traslado. Sugiere 20 días de atención 24/7 para observar mejorías.",
          "Urgencia": "Media",
          "Días Desde Evento": 0
        }
      },
      {
        "id": "recRgKDn0OtbClS1Z",
        "fields": {
          "Fecha": "2025-09-19",
          "Hora": "13:28",
          "Tipo": "Estudio diagnóstico",
          "Título": "Programación de encefalograma",
          "Descripción": "Mañana se realizará un encefalograma para descartar causas cerebrales de posibles convulsiones.",
          "Urgencia": "Programado",
          "Días Desde Evento": 0
        }
      },
      {
        "id": "recQXvDfIKhpgTTAY",
        "fields": {
          "Fecha": "2025-09-19",
          "Hora": "13:40",
          "Tipo": "Evolución médica",
          "Título": "Evolución por Dr. Reddy Simon",
          "Descripción": "El Dr. Reddy Simon evaluó al paciente esta mañana: estaba reactivo y movía espontáneamente los pies. Ayer lo evaluó el endocrinólogo, quien solicitó análisis de laboratorio. Los resultados aún no estaban disponibles al momento de la visita. El seguimiento de endocrinología lo acompaña el Dr. Logwin.",
          "Urgencia": "Rutina",
          "Días Desde Evento": 0
        }
      },
      {
        "id": "rec2FBFgersvCf5Zi",
        "fields": {
          "Fecha": "2025-09-18",
          "Hora": "22:20",
          "Tipo": "Consulta / Asignación de especialista",
          "Título": "Asignación de endocrinólogo",
          "Descripción": "Se asignó al Dr. Sergio Logwin como endocrinólogo. Durante los últimos 9 días no se realizaron análisis del perfil endocrino y se mantuvo dosis incorrecta de levotiroxina. El Dr. Logwin corregirá el tratamiento.",
          "Urgencia": "Media",
          "Días Desde Evento": 1
        }
      },
      {
        "id": "recUJtEPbqYimY8iA",
        "fields": {
          "Fecha": "2025-09-18",
          "Hora": "22:25",
          "Tipo": "Diagnóstico presuntivo",
          "Título": "Posible crisis mixedematosa",
          "Descripción": "Se sospecha que la causa de la caída pudo haber sido una crisis mixedematosa. El endocrinólogo Dr. Sergio Logwin deberá confirmar o descartar el diagnóstico.",
          "Urgencia": "Alta",
          "Días Desde Evento": 1
        }
      },
      {
        "id": "recBP7qptT4useVfr",
        "fields": {
          "Fecha": "2025-09-17",
          "Hora": "14:59",
          "Tipo": "Imagenología",
          "Título": "Resultado de Tomografía Cerebral",
          "Descripción": "El Dr. Guido informó que la tomografía muestra que el hematoma no aumentó y comienza a reabsorberse. El edema alrededor del hematoma es menor que en la última tomografía. Se indica que el cerebro no solo está afectado por el traumatismo, sino también por la enfermedad renal y la edad, lo que enlentece la recuperación. No hay signos de compresión cerebral, pero las neuronas requieren tiempo para reconectarse. Se recomienda no presionar ni manipular al paciente innecesariamente.",
          "Urgencia": "No urgente",
          "Días Desde Evento": 2
        }
      },
      {
        "id": "recU5fDveEcoFHX4d",
        "fields": {
          "Fecha": "2025-09-17",
          "Hora": "19:00",
          "Tipo": "Evolución Clínica",
          "Título": "Informe Consolidado de Evolución (09–17 septiembre 2025)",
          "Descripción": "## Evolución Clínica Continua\n\n**09/09/2025 – Evento inicial**\nPaciente sufrió traumatismo craneoencefálico severo con hematoma intracerebral (20 cm³) y subdural izquierdo. Traslado a UCI.\n\n**10/09/2025**\nPrimera sesión de diálisis post-cirugía, acceso complicado pero completada.\n\n**11/09/2025**\nEpisodio de agitación nocturna, requirió sujeción.\n\n**12/09/2025**\nRespuesta verbal parcial ante estímulos.\n\n**13/09/2025**\n- Apertura ocular completa y respuesta a estímulos.\n- Respuesta motora bilateral a órdenes simples.\n\n**14/09/2025**\n- Hemodiálisis con mejoría renal.\n- Radiografía de tórax normal.\n- Radiografía abdominal normal.\n\n**15/09/2025**\nTraqueostomía exitosa, paciente respira con O₂ suplementario.\n\n**16/09/2025**\n- Radiografía de tórax normal.\n- Diálisis sentado para estimular conciencia.\n- Visita médica: PA elevada controlada, plan tomografía.\n\n**17/09/2025**\nTomografía cerebral: hematoma estable en reabsorción, edema menor, sin compresión cerebral. Recuperación lenta por edad y enfermedad renal.\n\n---\n\n## Estado General al 17/09/2025\n- Neurológico: recuperación lenta, sin nuevos signos de compresión.\n- Respiratorio: traqueostomía permeable, ventilación espontánea con O₂.\n- Renal: programa de hemodiálisis, buena respuesta.\n- Hemodinámico: PA controlada con medicación.\n- Pronóstico: favorable en absorción del hematoma; recuperación neurológica progresiva pero lenta.",
          "Urgencia": "No urgente",
          "Días Desde Evento": 2
        }
      },
      {
        "id": "recFkY1F73luAn2tt",
        "fields": {
          "Fecha": "2025-09-17",
          "Hora": "15:00",
          "Tipo": "Observación clínica",
          "Título": "Monitoreo de signos vitales en UCI - PA elevada",
          "Descripción": "Monitor de signos vitales SPACELABS Healthcare mostrando:\n• Presión Arterial: 185/98 mmHg (MAP 126) - ELEVADA\n• Frecuencia Cardíaca: 99 lpm\n• Saturación O₂: 99%\n• ECG: 105 restaurados, ritmo estable\n\nPaciente con 3 bombas de infusión TERUMO activas:\n• Bomba 1: 55.00 mL/h (volumen 98.90 mL)\n• Bomba 2: 10.00 mL/h (volumen 282.00 mL)\n• Bomba 3: En uso\n\nSoporte respiratorio con O₂ mediante flujómetro calibrado.",
          "Urgencia": "alta",
          "Días Desde Evento": 2
        }
      },
      {
        "id": "recZdDDtj8OopG1xp",
        "fields": {
          "Fecha": "2025-09-16",
          "Hora": "08:12",
          "Tipo": "Estudio por imágenes",
          "Título": "Radiografía de Tórax (AP) - Seguimiento en UCI",
          "Descripción": "Radiografía de tórax (AP) realizada el 16/09/25 a las 08:12. Mediastino centrado, sombra cardiaca normal, hilios simétricos. Campos pulmonares sin evidencia de procesos infecciosos. Senos costofrénicos libres. Presencia de tubo endotraqueal, vía central a la derecha y sonda nasogástrica en adecuada posición.",
          "Urgencia": "baja",
          "Días Desde Evento": 3
        }
      },
      {
        "id": "recW0hZI9MdV8SUT2",
        "fields": {
          "Fecha": "2025-09-16",
          "Hora": "18:00",
          "Tipo": "Diálisis",
          "Título": "Diálisis en posición sentada - Estimulación de conciencia",
          "Descripción": "Se realizó sesión de diálisis el 16/09/25 a las 18:00 horas, con el paciente en posición sentada como estrategia terapéutica para estimular su nivel de conciencia y respuesta neurológica.",
          "Urgencia": "medio",
          "Días Desde Evento": 3
        }
      },
      {
        "id": "recVbctjnlxwNY6uI",
        "fields": {
          "Fecha": "2025-09-16",
          "Hora": "12:00",
          "Tipo": "Evolución Médica",
          "Título": "Visita médica durante diálisis",
          "Descripción": "Durante la diálisis el paciente presentó presión arterial elevada, requiriendo medicación para control. Se mantuvo estable, sin cambios significativos respecto al día anterior. Se planifica tomografía de control para mañana para evaluar evolución cerebral.",
          "Urgencia": "Media",
          "Días Desde Evento": 3
        }
      },
      {
        "id": "rec3W0S18AjO5Y84r",
        "fields": {
          "Fecha": "2025-09-16",
          "Hora": "10:00",
          "Tipo": "Evolución Médica",
          "Título": "Certificado médico integral - Sanatorio La Costa",
          "Descripción": "CERTIFICADO MEDICO - UNIDAD DE TERAPIA INTENSIVA ADULTOS\nSanatorio La Costa\n\nPaciente: Jorge Agustín Delgado Puentes\nLCN 656.056\nFecha: 30 de septiembre de 2025\n\nDIAGNÓSTICOS:\n1. ENCEFALOPATÍA + DRENAJE DE HEMORRAGIA SUBARACNOIDEA (HSA) AGUDO LADO IZQUIERDO\n2. HEMATOMA TEMPORAL LADO IZQUIERDO\n3. ENFERMEDAD RENAL CRÓNICA EN HEMODIÁLISIS TRISEMANAL M/S\n4. HIPERTENSIÓN ARTERIAL (HTA)\n5. HIPOPARATIROIDISMO (PARATIROIDECTOMÍA TOTAL)\n6. HIPOTIROIDISMO\n7. HIPOTENSION USURA\n\nMEDICACIONES E INSUMOS PARA 3 DÍAS:\n• Omeprazol 20 Mg, frasco, 1 frasco por enfermera cada 24 h\n• Lacosamida 5 Mg. Ampolla, 3 ampollas para goteo de 24 hs\n• Levotiroxina 75 Mg. Ampollas, 1 ampolla por enfermera\n• Ácido valproico 500 Mg. frasco, 1 ampolla por enfermera\n• Enalapril 10 Mg. Ampolla, 1 ampolla por enfermera\n• Levotiroxina 150 Mg. 1 comprimido por SNG c/ 24 hs\n• Ácido valproico 500 Mg. frasco, 1 ampolla por vía venosa c/12 hs\n\nEQUIPO PARA HEMODIÁLISIS:\n• Filtro para hemodiálisis 20 HF alto flujo para 3 días (Martes, Jueves y Sábados)\n• Tubuladores para hemodiálisis caja para 3 días (Martes, Jueves y Sábados)\n• Filtros Bioback MR-2 caja para 3 días\n\nOTROS:\n• Gastos estada UCI: UCI, 10 unidades por día\n• Sol godzi para hemodiálisis por 7000 ML para 3 días (Martes, Jueves y Sábados)\n• Bicarbonato para hemodiálisis galón 4 L. para 3 días\n• Aguja para hemodiálisis 1 unidades para 3 días (Martes, Jueves y Sábados)\n• Catter de inserción N10: 14. 1 unidades por día\n\nFirmado por:\nDra. Cecilia Colabrese Díaz\nDr. Rubén Deporte Salcedo",
          "Urgencia": "No urgente",
          "Días Desde Evento": 3
        }
      },
      {
        "id": "recOCFBXR6xBE4NRD",
        "fields": {
          "Fecha": "2025-09-15",
          "Hora": "11:00",
          "Tipo": "Procedimiento",
          "Título": "Traqueostomía exitosa sin complicaciones",
          "Descripción": "Se realizó traqueostomía sin complicaciones. El paciente respira espontáneamente con oxígeno suplementario, sin necesidad de intubación o soporte ventilatorio. Procedimiento clave en la estrategia de destete ventilatorio.",
          "Urgencia": "medio",
          "Días Desde Evento": 4
        }
      },
      {
        "id": "recGCriVM1JmdK9T1",
        "fields": {
          "Fecha": "2025-09-14",
          "Hora": "10:12",
          "Tipo": "Diálisis",
          "Título": "Hemodiálisis en UCI - Mejora de parámetros renales",
          "Descripción": "Sesión de hemodiálisis realizada en UCI el 14/09/25. Se observó reducción significativa en los niveles de urea y creatinina post-procedimiento. Indicador positivo de respuesta al tratamiento sustitutivo renal.",
          "Urgencia": "medio",
          "Días Desde Evento": 5
        }
      },
      {
        "id": "recv0zBg0L8Jkso7P",
        "fields": {
          "Fecha": "2025-09-14",
          "Hora": "08:12",
          "Tipo": "Estudio por imágenes",
          "Título": "Radiografía de Tórax (AP) - Control post-intubación",
          "Descripción": "Radiografía de tórax (AP) realizada el 14/09/25. Mediastino centrado, sombra cardiaca de dimensiones normales, hilios simétricos, campos pulmonares sin infiltrados. Senos costofrénicos libres. Se observa tubo endotraqueal y vía central correctamente posicionados.",
          "Urgencia": "baja",
          "Días Desde Evento": 5
        }
      },
      {
        "id": "recxxNvTovJIoFOiY",
        "fields": {
          "Fecha": "2025-09-14",
          "Hora": "18:02",
          "Tipo": "Estudio por imágenes",
          "Título": "Radiografía Abdominal (AP) - Hallazgos normales",
          "Descripción": "Radiografía abdominal simple (AP) realizada el 14/09/25 a las 18:02. Riñones con forma, tamaño y ubicación normales. Sombra hepática y músculos ileopsoas conservados. Gases intestinales distribuidos adecuadamente. Sonda nasogástrica correctamente posicionada. Sin calcificaciones ni hallazgos patológicos.",
          "Urgencia": "baja",
          "Días Desde Evento": 5
        }
      },
      {
        "id": "recWZ6zGao1GkasQw",
        "fields": {
          "Fecha": "2025-09-13",
          "Hora": "13:03",
          "Tipo": "Síntoma",
          "Título": "✅ EVOLUCIÓN POSITIVA - Apertura ocular",
          "Descripción": "HITO IMPORTANTE\nPaciente abre ambos ojos completamente\nRespuesta a estímulos verbales\nTestigo: Familiar presente",
          "Urgencia": "medio",
          "Días Desde Evento": 6
        }
      },
      {
        "id": "recoSNsPkeUxxnfka",
        "fields": {
          "Fecha": "2025-09-13",
          "Hora": "13:39",
          "Tipo": "Síntoma",
          "Título": "Respuesta motora bilateral",
          "Descripción": "Movimientos en ambos lados del cuerpo\nRespuesta a comandos verbales\nBuen pronóstico neurológico",
          "Urgencia": "medio",
          "Días Desde Evento": 6
        }
      },
      {
        "id": "recGVpqGaG84nweBM",
        "fields": {
          "Fecha": "2025-09-13",
          "Hora": "22:07",
          "Tipo": "Solicitud",
          "Título": "Orden médica - Radiografía de Tórax",
          "Descripción": "Solicitud médica realizada por la Dra. Orue Alcaraz, Lorena, para realizar una radiografía de tórax (AP) con indicación clínica de control post-intubación.",
          "Urgencia": "baja",
          "Días Desde Evento": 6
        }
      },
      {
        "id": "rec73VY1OmbBk1v4g",
        "fields": {
          "Fecha": "2025-09-13",
          "Hora": "07:32",
          "Tipo": "Estudio por imágenes",
          "Título": "Radiografía de Tórax - Cardiomegalia y dispositivo",
          "Descripción": "Radiografía de tórax (AP) realizada el 13/09/25 a las 07:32. Se observó cardiomegalia, hilios simétricos, campos pulmonares sin signos de infección activa, senos costofrénicos libres. Presencia de tubo endotraqueal y vía central yugular izquierda.",
          "Urgencia": "baja",
          "Días Desde Evento": 6
        }
      },
      {
        "id": "rechV3MiVGr59xwkx",
        "fields": {
          "Fecha": "2025-09-13",
          "Hora": "15:00",
          "Tipo": "Observación clínica",
          "Título": "Movimientos espontáneos de miembros superiores",
          "Descripción": "Se observaron movimientos de ambos brazos sin estímulo previo. Podría indicar reflejos o actividad motora espontánea.",
          "Urgencia": "baja",
          "Días Desde Evento": 6
        }
      },
      {
        "id": "rec1GLf8K8oZ8rkf8",
        "fields": {
          "Fecha": "2025-09-12",
          "Hora": "10:00",
          "Tipo": "Observación clínica",
          "Título": "Respuesta verbal parcial al estímulo",
          "Descripción": "Ante estímulo verbal, Jorge movió los labios y pareció intentar hablar. No se logró comprensión de palabras. Familia reporta mejoría leve.",
          "Urgencia": "baja",
          "Días Desde Evento": 7
        }
      },
      {
        "id": "reclNw0ZHnvg1Skl0",
        "fields": {
          "Fecha": "2025-09-11",
          "Hora": "02:30",
          "Tipo": "Observación clínica",
          "Título": "Agitación nocturna con necesidad de sujeción",
          "Descripción": "Jorge se mostró muy agitado durante la madrugada del 11 de septiembre. Intentó arrancarse el suero, fue necesario sujetarlo para evitar autolesiones.",
          "Urgencia": "medio",
          "Días Desde Evento": 8
        }
      },
      {
        "id": "rec8nhFwxuCG0BxiY",
        "fields": {
          "Fecha": "2025-09-10",
          "Hora": "17:00",
          "Tipo": "Diálisis",
          "Título": "Hemodiálisis en UCI",
          "Descripción": "Primera diálisis post-cirugía\nDuración: 4 horas (2h + recolocación + 2h)\nComplicación con acceso vascular\nCompletada exitosamente",
          "Urgencia": "alto",
          "Días Desde Evento": 9
        }
      },
      {
        "id": "recorj5eBpxXazZSF",
        "fields": {
          "Fecha": "2025-09-09",
          "Hora": "10:52",
          "Tipo": "Síntoma",
          "Título": "TCE SEVERO - Caída con traumatismo",
          "Descripción": "Hematoma intracerebral 20cm³ + subdural izquierdo. Ambulancia tardó 40 min",
          "Urgencia": "crítico",
          "Días Desde Evento": 10
        }
      },
      {
        "id": "recpdViq6naJPdm1Q",
        "fields": {
          "Fecha": "2025-09-09",
          "Hora": "10:52",
          "Tipo": "Síntoma",
          "Título": "⚠️ TCE SEVERO - Traumatismo craneal",
          "Descripción": "🚨 EVENTO CRÍTICO\nCaída con traumatismo craneoencefálico severo\nHematoma intracerebral: 20 cm³\nHematoma subdural izquierdo\nAmbulancia tardó 40 minutos\nTraslado: Sanatorio La Costa",
          "Urgencia": "crítico",
          "Días Desde Evento": 10
        }
      },
      {
        "id": "recgGsDgBU2Lpu9rl",
        "fields": {
          "Fecha": "2024-12-11",
          "Hora": "20:35",
          "Tipo": "Observación clínica",
          "Título": "Dolor y debilidad post-tratamiento",
          "Descripción": "Jorge se mostró dolorido y débil, posiblemente debido a múltiples tratamientos médicos. Presentó momentos de derrumbe emocional, pero luego mostró signos de mejoría. Familia reporta que logró bañarse por sí mismo.",
          "Urgencia": "media",
          "Días Desde Evento": 282
        }
      },
      {
        "id": "reclHg13JuTu9oyHF",
        "fields": {
          "Fecha": "2024-11-11",
          "Hora": "18:17",
          "Tipo": "Observación clínica",
          "Título": "Ausencia de respuesta a estímulos",
          "Descripción": "Mensaje familiar indica que Jorge no respondía a estímulos en ese momento. Requiere seguimiento neurológico.",
          "Urgencia": "alta",
          "Días Desde Evento": 312
        }
      },
      {
        "id": "recWLdXFlJldq4U1u",
        "fields": {
          "Fecha": "2024-10-14",
          "Hora": "15:08",
          "Tipo": "Intervención",
          "Título": "Administración de calmante por ansiedad",
          "Descripción": "Se administró un calmante más fuerte a Jorge por aparente miedo o ansiedad. Mejor tolerancia posterior al fármaco según observación familiar.",
          "Urgencia": "media",
          "Días Desde Evento": 340
        }
      },
      {
        "id": "recp98JjmzgpYeZbz",
        "fields": {
          "Fecha": "2024-10-03",
          "Hora": "15:00",
          "Tipo": "Diálisis",
          "Título": "INICIO HEMODIÁLISIS",
          "Descripción": "Primera sesión de diálisis, programa 3x/semana",
          "Urgencia": "alto",
          "Días Desde Evento": 351
        }
      },
      {
        "id": "recZAstQwgk6KkRMm",
        "fields": {
          "Fecha": "2024-09-27",
          "Hora": "14:00",
          "Tipo": "Procedimiento",
          "Título": "Fístula arteriovenosa - Cirugía para acceso de diálisis",
          "Descripción": "Procedimiento quirúrgico vascular realizado en el miembro superior izquierdo para la creación de fístula arteriovenosa con fines de hemodiálisis. Sin complicaciones postoperatorias inmediatas.",
          "Urgencia": "alto",
          "Días Desde Evento": 357
        }
      },
      {
        "id": "recz9GQHe8PMdDXx0",
        "fields": {
          "Fecha": "2024-09-26",
          "Hora": "17:53",
          "Tipo": "Observación clínica",
          "Título": "Ausencia de respuesta verbal o física",
          "Descripción": "Jorge no responde a estímulos verbales ni físicos según comentarios familiares. Posible episodio de desconexión o bajo nivel de conciencia.",
          "Urgencia": "alta",
          "Días Desde Evento": 358
        }
      },
      {
        "id": "recaUGtWke0Wcb3Jr",
        "fields": {
          "Fecha": "2024-09-10",
          "Hora": "17:00",
          "Tipo": "Consulta",
          "Título": "Diagnóstico IRC Estadio 5",
          "Descripción": "Dr. Darío Cuevas - Nefrología\nTFG: 6% (crítico)\nRecomendación: Diálisis urgente\nPaciente solicita alternativa dietética",
          "Urgencia": "crítico",
          "Días Desde Evento": 374
        }
      },
      {
        "id": "recpzcxlPVvfNzeDo",
        "fields": {
          "Fecha": "2024-03-25",
          "Hora": "10:38",
          "Tipo": "Episodio agudo",
          "Título": "Hipertensión y disnea episódica",
          "Descripción": "Jorge presentó un episodio de presión arterial elevada y dificultad para respirar el 25 de marzo por la mañana. Mejora con presencia familiar.",
          "Urgencia": "media",
          "Días Desde Evento": 543
        }
      },
      {
        "id": "recC4OVucl4iBj492",
        "fields": {
          "Fecha": "2024-02-26",
          "Hora": "09:34",
          "Tipo": "Observación clínica",
          "Título": "Desmejoría general con debilidad muscular",
          "Descripción": "Jorge presenta estado de salud muy desmejorado, con músculos debilitados y poca respuesta física. Requiere asistencia 24h por enfermeras. Familia con pocas expectativas de mejora en ese momento.",
          "Urgencia": "alta",
          "Días Desde Evento": 571
        }
      },
      {
        "id": "recygMb4bpqOeKTsL",
        "fields": {
          "Fecha": "2024-02-02",
          "Hora": "09:19",
          "Tipo": "Observación clínica",
          "Título": "Agitación física persistente",
          "Descripción": "Familiares reportan que Jorge presenta movimientos excesivos y constantes, lo cual representa un reto en su cuidado. Posible agitación psicomotora.",
          "Urgencia": "media",
          "Días Desde Evento": 595
        }
      },
      {
        "id": "recWZqSHyrdqFhZql",
        "fields": {
          "Fecha": "2024-01-07",
          "Hora": "23:30",
          "Tipo": "Observación clínica",
          "Título": "Movimientos espontáneos en cama",
          "Descripción": "Se observaron movimientos voluntarios de Jorge en la cama durante la noche del 07 de enero. Indicio positivo de actividad motora.",
          "Urgencia": "baja",
          "Días Desde Evento": 621
        }
      }
    ];

    console.log(`📊 Found ${airtableEvents.length} events in Airtable`);

    // Clear existing timeline events for this patient
    console.log('🗑️  Clearing existing timeline events...');
    const { error: deleteError } = await supabase
      .from('timeline_events')
      .delete()
      .eq('patient_id', patient.id);

    if (deleteError) {
      console.error('❌ Error clearing timeline events:', deleteError);
      return;
    }

    // Transform and insert new events
    console.log('✨ Transforming and inserting events...');

    let inserted = 0;
    const batchSize = 10;

    for (let i = 0; i < airtableEvents.length; i += batchSize) {
      const batch = airtableEvents.slice(i, i + batchSize)
        .filter(event => event.fields.Fecha && event.fields.Título) // Only events with date and title
        .map(event => ({
          patient_id: patient.id,
          title: event.fields.Título!,
          event_type: mapEventType(event.fields.Tipo),
          event_date: event.fields.Fecha!,
          event_time: event.fields.Hora || null,
          description: event.fields.Descripción || null,
          severity: mapSeverity(event.fields.Urgencia),
          status: 'completed' as const,
          created_by: null // Airtable sync events don't have a specific user
        }));

      if (batch.length === 0) continue;

      const { data, error } = await supabase
        .from('timeline_events')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        continue;
      }

      inserted += data?.length || 0;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${data?.length} events`);
    }

    console.log(`\n🎉 Successfully synced ${inserted} timeline events from Airtable!`);

  } catch (error) {
    console.error('❌ Error syncing Airtable to timeline:', error);
  }
}

// Run the sync
syncAirtableToTimeline();