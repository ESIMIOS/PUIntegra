/**
 * @package web
 * @name mockAuthCredentials.ts
 * @version 0.0.1
 * @description Define credenciales mock para autenticación local sin modificar contratos de dominio.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-15)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { z } from 'zod';

export const MockAuthCredentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const mockAuthCredentials = [
  {
    email: 'admin@example.test',
    password: 'Puintegra123!'
  }
] as const satisfies ReadonlyArray<z.infer<typeof MockAuthCredentialSchema>>;
