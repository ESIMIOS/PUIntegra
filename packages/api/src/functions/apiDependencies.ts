/**
 * @package api
 * @name apiDependencies.ts
 * @version 0.0.4
 * @description Compone dependencias runtime del API delegando responsabilidades en módulos especializados.
 * @author @codex
 * @changelog
 * - 0.0.4	(2026-05-05)	Agrega JSDoc de composición para createApiDependencies.	@codex
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
import { enforceApiThrottle as enforceThrottle } from './dependencies/throttleDependencies.js';
import {
  createInstitutionOnboarding,
  createInstitutionPermission,
  updateInstitutionPermission,
  updateInstitutionPlan,
  updateInstitutionSharedSecret,
  upsertInstitutionContact,
} from './dependencies/institutionDependencies.js';
import { updateAccountProfile } from './dependencies/accountProfileDependencies.js';

/**
 * @description Compone el contenedor de dependencias runtime inyectado en el enrutador HTTP.
 */
export function createApiDependencies() {
  return {
    verifyBearerToken,
    enforceThrottle,
    recordAuthEvent,
    checkAccountCreationPolicy,
    createInstitutionOnboarding,
    upsertInstitutionContact,
    updateInstitutionSharedSecret,
    createInstitutionPermission,
    updateInstitutionPermission,
    requestPasswordRecovery,
    recordAuthLifecycleEvent,
    resetUserMfa,
    updateInstitutionPlan,
    updateAccountProfile,
  };
}
