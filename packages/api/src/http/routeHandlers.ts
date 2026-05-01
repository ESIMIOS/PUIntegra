/**
 * @package api
 * @name routeHandlers.ts
 * @version 0.0.3
 * @description Fachada de handlers HTTP y tipos para mantener createApiApp estable mientras los handlers viven por dominio.
 * @author @codex
 * @changelog
 * - 0.0.3	(2026-05-01)	Convierte routeHandlers en fachada y delega implementación en módulos por responsabilidad.	@codex
 * - 0.0.2	(2026-05-01)	Agrega handler autenticado para actualización de perfil de cuenta.	@codex
 * - 0.0.1	(2026-04-23)	Extrae handlers de rutas y tipos de dependencias del API.	@codex
 */

export type {
  AuthLifecyclePolicyInput,
  CreateApiAppDependencies,
  RecordAuthEventInput,
  RecordAuthLifecycleEventInput,
  ResetUserMfaInput,
  VerifiedBearerToken,
} from './handlers/types.js';

export { readOriginTraceId } from './handlers/shared.js';

export {
  createAccountCreationPolicyHandler,
  createAuthEventHandler,
  createAuthLifecycleEventHandler,
  createMfaResetHandler,
  createPasswordRecoveryHandler,
} from './handlers/authHandlers.js';

export {
  createInstitutionOnboardingHandler,
  createInstitutionPlanUpdateHandler,
} from './handlers/adminHandlers.js';

export { createAccountProfileUpdateHandler } from './handlers/accountHandlers.js';
