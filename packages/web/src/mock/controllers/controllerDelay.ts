/**
 * @package web
 * @name controllerDelay.ts
 * @version 0.0.1
 * @description Aplica retardo controlado en controladores mock para simular latencia API.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { MOCK_MILLISECONDS_RESPONSE_DELAY, MOCK_FAILURE_PROBABILITY } from '../constants/mockConfig';
import { MockDataError, MOCK_DATA_ERROR_KIND } from '../errors/mockDataError';

export async function withMockControllerDelay<T>(
  task: () => Promise<T>,
  options: {
    ms?: number;
    simulateFailure?: boolean;
  } = {}
): Promise<T> {
  const {
    ms = MOCK_MILLISECONDS_RESPONSE_DELAY,
    simulateFailure = true
  } = options;
  const shouldSimulateFailure = simulateFailure && Math.random() < MOCK_FAILURE_PROBABILITY;

  const delayPromise = new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });

  // Simulate transport failure before invoking the task to avoid mixed/unhandled rejections.
  if (shouldSimulateFailure) {
    await delayPromise;
    throw new MockDataError(
      MOCK_DATA_ERROR_KIND.SERVER_ERROR,
      'Error de red simulado (Mock Failure Simulation)'
    );
  }

  const taskPromise = task();
  const [taskResult] = await Promise.allSettled([taskPromise, delayPromise]);
  if (taskResult.status === 'rejected') {
    throw taskResult.reason;
  }
  return taskResult.value;
}
