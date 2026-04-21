import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideLucideIcons,
  LucideCar,
  LucideVan,
  LucideMotorbike,
  LucideCarFront,
  LucideTruck,
  LucideWrench,
  LucideLifeBuoy,
  LucideBatteryMedium,
  LucideDrill,
} from '@lucide/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideAnimationsAsync(),
    provideLucideIcons(
      LucideCar,
      LucideVan,
      LucideMotorbike,
      LucideCarFront,
      LucideTruck,
      LucideWrench,
      LucideLifeBuoy,
      LucideBatteryMedium,
      LucideDrill,
    ),
  ],
};
