/**
 * @package web
 * @name mount.ts
 * @version 0.0.2
 * @description Provee helpers de montaje con Vuestic para pruebas unitarias de componentes Vue.
 * @author @antigravity
 * @changelog
 * - 0.0.2	(2026-04-23)	Ajusta tipado del helper para aceptar componentes Vue sin casts en pruebas.	@codex
 * - 0.0.1  (2026-04-12)  Helper inicial de montaje con Vuestic UI.  @antigravity
 */

import { mount } from '@vue/test-utils';
import type { ComponentMountingOptions } from '@vue/test-utils';
import type { Component } from 'vue';
import { createAppVuestic } from '@/plugins/vuestic';

export function mountWithVuestic(
  component: Component,
  options: ComponentMountingOptions<any> = {}
) {
  return mount(component, {
    ...options,
    global: {
      ...(options.global ?? {}),
      plugins: [createAppVuestic(), ...(options.global?.plugins ?? [])]
    }
  });
}
