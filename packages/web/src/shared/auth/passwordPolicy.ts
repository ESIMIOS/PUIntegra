/**
 * @package web
 * @name passwordPolicy.ts
 * @version 0.0.1
 * @description Reglas de contraseña visibles en flujos Auth.
 * @author @codex
 * @changelog
 * - 0.0.1	(2026-04-28)	Agrega evaluación de política de contraseña para formularios Auth.	@codex
 */

export type PasswordPolicyStatus = {
  minLength: boolean;
  uppercase: boolean;
  number: boolean;
};

/**
 * @description Evalúa las reglas visibles de contraseña alineadas con la política Firebase configurada.
 */
export function evaluatePasswordPolicy(password: string): PasswordPolicyStatus {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
}

/**
 * @description Determina si todas las reglas visibles de contraseña están satisfechas.
 */
export function isPasswordPolicySatisfied(status: PasswordPolicyStatus) {
  return status.minLength && status.uppercase && status.number;
}
