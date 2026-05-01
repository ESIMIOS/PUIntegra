/**
 * @package web
 * @name accountProfileGateway.ts
 * @version 0.0.1
 * @description Ejecuta lecturas/escrituras de perfil de cuenta autenticada usando el API HTTP.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-05-01)	Agrega gateway de actualización de perfil de cuenta para /account/settings.	@codex
 */

import { z } from 'zod';
import { executeHttpApi, resolveApiUrl } from '@/gateways/httpApiGateway';
import { getFirebaseRuntime } from '@/plugins/firebase';

export const AccountProfileUpdateInputSchema = z.object({
  name: z.string().trim().min(1),
  emojiIcon: z.string().trim().min(1),
  phone: z.string().trim().optional().nullable(),
});

export const AccountProfileUpdateResultSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  emojiIcon: z.string().min(1).nullable(),
  phone: z.string().min(1).nullable(),
  updatedAt: z.number().int().nonnegative(),
});

export type AccountProfileUpdateInput = z.infer<typeof AccountProfileUpdateInputSchema>;
export type AccountProfileUpdateResult = z.infer<typeof AccountProfileUpdateResultSchema>;

/**
 * @description Envía actualización de perfil autenticado y devuelve identidad normalizada.
 */
export async function updateAccountProfile(input: AccountProfileUpdateInput): Promise<AccountProfileUpdateResult> {
  const payload = AccountProfileUpdateInputSchema.parse(input);
  const token = await getFirebaseRuntime().auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Authenticated Firebase user token is required.');
  }
  return executeHttpApi({
    url: resolveApiUrl('/api/account/profile'),
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    parseData: AccountProfileUpdateResultSchema,
    transportMessage: 'Account profile update request failed.',
  });
}
