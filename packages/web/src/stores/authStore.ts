/**
 * @package web
 * @name authStore.ts
 * @version 0.0.3
 * @description Gestiona sesión autenticada mock, identidad visible y contextos seleccionables por permiso.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.3	(2026-04-15)	Se integra capa mock-auth para hidratar, establecer, cambiar y cerrar sesión persistida.	@tirsomartinezreyes
 * - 0.0.2	(2026-04-14)	Extracted anonymousState factory; resetToAnonymous delegates to $reset().	@tirsomartinezreyes
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { defineStore, AuthenticatedRoleSchema, RoleSchema, ROLE, z } from '@/bom';
import { createMockAuthService } from '@/mock/auth/mockAuthService';
import { withMockControllerDelay } from '@/mock/controllers/controllerDelay';

type Role = z.infer<typeof RoleSchema>;

export const SessionContextSchema = z.object({
  role: RoleSchema,
  rfc: z.string().min(1)
});

export const LoginResultSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  emojiIcon: z.string().min(1).nullable(),
  contexts: z.array(SessionContextSchema).min(1)
});

type SessionContext = z.infer<typeof SessionContextSchema>;
type LoginResult = z.infer<typeof LoginResultSchema>;

const mockAuthService = createMockAuthService();

/**
 * Single source of truth for the unauthenticated state shape.
 */
function anonymousState() {
  return {
    isAuthenticated: false,
    activeRole: ROLE.ANONYMOUS as Role,
    requiresSecuritySetup: false,
    allowedInstitutionRfcs: [] as string[],
    uid: null as string | null,
    email: null as string | null,
    name: null as string | null,
    emojiIcon: null as string | null,
    availableContexts: [] as SessionContext[],
    activeContext: null as SessionContext | null,
    pendingLogin: null as LoginResult | null,
    hasHydratedSession: false
  };
}

/**
 * @description Store de sesión mock para autenticación, rol activo y estado de bootstrap de seguridad.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...anonymousState()
  }),
  actions: {
    setAuthenticated(value: boolean) {
      this.isAuthenticated = value;
      if (!value) {
        this.activeRole = ROLE.ANONYMOUS;
      }
    },
    setRole(role: Role) {
      this.activeRole = role;
      this.isAuthenticated = role !== ROLE.ANONYMOUS;
    },
    setIdentity(identity: { uid: string | null; email: string | null; name?: string | null; emojiIcon?: string | null }) {
      this.uid = identity.uid;
      this.email = identity.email;
      this.name = identity.name ?? this.name;
      this.emojiIcon = identity.emojiIcon ?? this.emojiIcon;
    },
    setRequiresSecuritySetup(value: boolean) {
      this.requiresSecuritySetup = value;
    },
    setAllowedInstitutionRfcs(rfcs: string[]) {
      this.allowedInstitutionRfcs = rfcs;
    },
    ensureAuthenticatedRole() {
      const parsed = AuthenticatedRoleSchema.safeParse(this.activeRole);
      if (!parsed.success) {
        this.activeRole = ROLE.INSTITUTION_ADMIN;
      }
      this.isAuthenticated = true;
    },
    setPendingLogin(result: LoginResult | null) {
      this.pendingLogin = result;
    },
    async validateCredentials(email: string, password: string) {
      const login = await withMockControllerDelay(async () => {
        return mockAuthService.validateCredentials(email, password);
      });
      const validated = LoginResultSchema.parse(login);
      this.pendingLogin = validated;
      return validated;
    },
    applyEstablishedSession(session: {
      userId: string;
      name: string;
      email: string;
      emojiIcon: string | null;
      activeRole: Role;
      activeRfc: string;
      allowedInstitutionRfcs: string[];
      availableContexts: SessionContext[];
    }) {
      this.uid = session.userId;
      this.name = session.name;
      this.email = session.email;
      this.emojiIcon = session.emojiIcon;
      this.activeRole = session.activeRole;
      this.allowedInstitutionRfcs = session.allowedInstitutionRfcs;
      this.availableContexts = session.availableContexts;
      this.activeContext = {
        role: session.activeRole,
        rfc: session.activeRfc
      };
      this.pendingLogin = null;
      this.isAuthenticated = true;
      this.hasHydratedSession = true;
    },
    async establishSession(context: SessionContext) {
      if (!this.pendingLogin) {
        throw new Error('No pending login result to establish session.');
      }
      const session = await withMockControllerDelay(async () => {
        return mockAuthService.establishSession(this.pendingLogin!, context);
      });
      this.applyEstablishedSession(session);
      return session;
    },
    async hydrateSession() {
      const session = await withMockControllerDelay(async () => mockAuthService.hydrateSession(), { simulateFailure: false });
      if (!session) {
        this.hasHydratedSession = true;
        return null;
      }
      this.applyEstablishedSession(session);
      return session;
    },
    async switchContext(context: SessionContext) {
      const session = await withMockControllerDelay(async () => mockAuthService.switchContext(context));
      this.applyEstablishedSession(session);
      return session;
    },
    logout() {
      mockAuthService.logout();
      this.resetToAnonymous();
    },
    resetToAnonymous() {
      const nextAnonymousState = anonymousState();
      this.$patch(nextAnonymousState);
      this.hasHydratedSession = true;
    }
  }
});
