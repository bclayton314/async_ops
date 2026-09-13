import type { HealthResponse } from '../types/health';

export const getHealth = async (): Promise<HealthResponse> => {
  const response = await fetch('/api/health');

  if (!response.ok) {
    throw new Error('Unable to connect to AsyncOps API.');
  }

  return response.json() as Promise<HealthResponse>;
};