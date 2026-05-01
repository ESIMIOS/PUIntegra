/**
 * @package api
 * @name apiDependencies.ts
 * @version 0.0.3
 * @description Compone dependencias runtime del API delegando responsabilidades en módulos especializados.
 * @author @codex
 * @changelog
 * - 0.0.3	(2026-05-01)	Refactoriza a composición modular para reducir complejidad y evitar God file.	@codex
 * - 0.0.2	(2026-05-01)	Agrega actualización autenticada de perfil de cuenta con bitácora y rollback de displayName.	@codex
 * - 0.0.1	(2026-04-23)	Extrae verificación de token, persistencia de logs y onboarding institucional.	@codex
 */

import {
  checkAccountCreationPolicy,
  recordAuthEvent,
  recordAuthLifecycleEvent,
  requestPasswordRecovery,
  resetUserMfa,
  verifyBearerToken,
} from './dependencies/authDependencies.js';
import { createInstitutionOnboarding, updateInstitutionPlan } from './dependencies/institutionDependencies.js';
import { updateAccountProfile } from './dependencies/accountProfileDependencies.js';

export function createApiDependencies() {
  return {
    verifyBearerToken,
    recordAuthEvent,
    checkAccountCreationPolicy,
    createInstitutionOnboarding,
    requestPasswordRecovery,
    recordAuthLifecycleEvent,
    resetUserMfa,
    updateInstitutionPlan,
    updateAccountProfile,
  };
}
