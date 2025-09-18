export function logEvent(scope: string, message: string, metadata?: Record<string, unknown>) {
  if (metadata) {
    console.log(`[${scope}] ${message}`, metadata);
  } else {
    console.log(`[${scope}] ${message}`);
  }
}

export function logError(scope: string, message: string, metadata?: unknown) {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] [${scope}] ${message}`;
  
  if (metadata instanceof Error) {
    console.error(errorMessage, {
      error: metadata.message,
      stack: metadata.stack
    });
  } else if (metadata && typeof metadata === 'object') {
    console.error(errorMessage, metadata);
  } else if (metadata) {
    console.error(errorMessage, { data: metadata });
  } else {
    console.error(errorMessage);
  }
}
