/**
 * @package web
 * @name smoke.test.ts
 * @version 0.0.1
 * @description Valida que la app inicializa correctamente con plugins principales.
 * @author @tirsomartinezreyes
 * @changelog
 * - 0.0.1	(2026-04-10)	Versión inicial del archivo.	@tirsomartinezreyes
 */

import { createWebApp } from '@/app/createWebApp';

describe('web app smoke', () => {
  it('bootstraps app, router, and vuestic without runtime errors', async () => {
    const { app, router } = createWebApp();
    const mountPoint = document.createElement('div');
    mountPoint.id = 'app';
    document.body.appendChild(mountPoint);

    await router.push('/site/home');
    await router.isReady();

    expect(() => app.mount(mountPoint)).not.toThrow();

    app.unmount();
  });
});
