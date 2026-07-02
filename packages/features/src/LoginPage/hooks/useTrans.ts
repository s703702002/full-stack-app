import enUS from '../locales/en-US.json';
import zhTW from '../locales/zh-TW.json';
import { createTranslation } from '../../utils';

export const ns = '@full-stack-app/features/login-page';

export const useTrans = createTranslation(ns, { 'zh-TW': zhTW, 'en-US': enUS });
