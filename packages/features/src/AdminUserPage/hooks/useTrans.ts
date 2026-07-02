import { createTranslation } from '../../utils';
import enUS from '../locales/en-US.json';
import zhTW from '../locales/zh-TW.json';

export const ns = '@full-stack-app/features/admin-user-page';

export const useTrans = createTranslation(ns, { 'zh-TW': zhTW, 'en-US': enUS });
