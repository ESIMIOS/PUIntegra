/**
 * @package api
 * @name index.ts
 * @version 0.0.4
 * @description Exporta las Cloud Functions del paquete API.
 * @author @antigravity
 * @changelog
 * - 0.0.4  (2026-04-19)  Delega implementaciones a módulos en src/functions.  @codex
 * - 0.0.3  (2026-04-19)  Agrega logging estructurado para fallos del trigger Auth.  @codex
 * - 0.0.2  (2026-04-19)  Agrega rutas Auth auditadas y trigger onCreate para perfil de usuario.  @codex
 * - 0.0.1  (2026-04-12)  Entrada mínima para permitir typecheck del paquete.  @antigravity
 */

export { api } from './functions/apiFunction.js';
export { createUserProfile } from './functions/createUserProfileFunction.js';
