/**
 * @package web
 * @name controllerDelay.ts
 * @version 0.0.1
 * @description Aplica retardo controlado en controladores mock para simular latencia API.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-14)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { MOCK_MILLISECONDS_RESPONSE_DELAY } from '../constants/mockConfig';

export async function withMockControllerDelay<T>(
  task: () => Promise<T>,
  milliseconds = MOCK_MILLISECONDS_RESPONSE_DELAY
): Promise<T> {
  await new Promise<void>((resolve) => {
    const timeoutRef = globalThis.setTimeout(resolve, milliseconds);
    if (typeof timeoutRef === 'number') {
      return;
    }
  });
  return task();
}
