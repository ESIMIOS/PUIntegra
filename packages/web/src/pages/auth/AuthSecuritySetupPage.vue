<script setup lang="ts">
/**
 * @package web
 * @name AuthSecuritySetupPage.vue
 * @version 0.0.1
 * @description Vista placeholder de bootstrap de seguridad previo a operación plena.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */
import { onMounted, ref } from 'vue';
import { formatUiErrorString } from '@shared';
import { getTotpSetupState, type TotpSetupState } from '@/gateways/firebaseAuthGateway';

const state = ref<TotpSetupState | null>(null);
const errorMessage = ref<string | null>(null);

onMounted(async () => {
  try {
    state.value = await getTotpSetupState();
  } catch (error) {
    errorMessage.value = formatUiErrorString(error);
  }
});
</script>

<template>
  <VaCard class="w-full">
    <VaCardContent>
      <VaCardTitle>Configura tu autenticador</VaCardTitle>
      <div class="grid gap-3 text-left mt-4">
        <p class="text-sm opacity-80">
          PUIntegra usa MFA(Múltiple factor de autenticación), por o que es necesario contar con un app de autenticación
          en tu dispositivo móvil para proteger el acceso operativo.
          <br>
          <br>
          Conserva acceso a esa app; si pierdes el dispositivo, contacta a un administrador para restablecer el factor
          de seguridad.
        </p>
        <VaAlert v-if="state?.reason === 'already-enrolled'" color="info" icon="verified_user" dense>
          Ya tienes una app de autenticación configurada. Para cambiarla, solicita un restablecimiento administrativo.
        </VaAlert>
        <VaAlert v-else color="warning" icon="lock" dense>
          La configuración TOTP requiere habilitación de Firebase MFA. Cuando esté disponible, podrás escanear un QR,
          guardar la clave manual y confirmar el código actual de tu app.
        </VaAlert>
        <VaAlert v-if="errorMessage" color="danger" icon="warning" dense>
          {{ errorMessage }}
        </VaAlert>
        <p class="text-sm opacity-80">
          Si no puedes usar tu autenticador, contacta a un administrador. El restablecimiento requiere verificación
          fuera de banda y quedará auditado.
        </p>
      </div>
    </VaCardContent>
  </VaCard>
</template>
