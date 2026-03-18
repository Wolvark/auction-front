// Polyfill for sockjs-client which requires Node.js 'global'
(window as unknown as { global: typeof window }).global = window;

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
