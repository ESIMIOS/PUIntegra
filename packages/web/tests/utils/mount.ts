/**
 * @package web
 * @name mount.ts
 * @version 0.0.1
 * @description Provee helpers de montaje con Vuestic para pruebas unitarias de componentes Vue.
 * @author @antigravity
 * @changelog
 * - 0.0.1  (2026-04-12)  Helper inicial de montaje con Vuestic UI.  @antigravity
 */

import { mount } from '@vue/test-utils';
import type { ComponentMountingOptions } from '@vue/test-utils';
import type { DefineComponent } from 'vue';
import { createAppVuestic } from '@/plugins/vuestic';

export function mountWithVuestic<Component extends DefineComponent>(
  component: Component,
  options: ComponentMountingOptions<Component> = {}
) {
  return mount(component, {
    ...options,
    global: {
      ...(options.global ?? {}),
      plugins: [createAppVuestic(), ...(options.global?.plugins ?? [])]
    }
  });
}
