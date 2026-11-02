import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import {
  CloseOutline,
  DownOutline,
  UpOutline,
  SearchOutline,
  CheckCircleOutline,
  ExclamationCircleOutline,
  InfoCircleOutline,
  PlusOutline,
  PrinterOutline,
  DeleteOutline,
  EditOutline,
  EyeOutline
} from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';

registerLocaleData(en);

const icons = [
  CloseOutline,
  DownOutline,
  UpOutline,
  SearchOutline,
  CheckCircleOutline,
  ExclamationCircleOutline,
  InfoCircleOutline,
  PlusOutline,
  PrinterOutline,
  DeleteOutline,
  EditOutline,
  EyeOutline
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideNzIcons(icons),
    provideNzI18n(en_US)
  ]
};
