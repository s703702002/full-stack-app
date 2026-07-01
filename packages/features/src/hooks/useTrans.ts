import { useTranslation } from 'react-i18next';
import enUS from '../locales/en-US.json';
import zhTW from '../locales/zh-TW.json';
import { useEffect, useState } from 'react';

const ns = '@full-stack-app/features';

export function useTrans() {
  const [isI18nReady, setIsI18nReady] = useState(false);
  const { t, i18n } = useTranslation(ns);

  useEffect(() => {
    if (!i18n.hasResourceBundle('zh-TW', ns)) {
      i18n.addResourceBundle('zh-TW', ns, zhTW, true, true);
    }
    if (!i18n.hasResourceBundle('en-US', ns)) {
      i18n.addResourceBundle('en-US', ns, enUS, true, true);
    }

    setIsI18nReady(true);
  }, [i18n]);

  return { t, i18n, isI18nReady };
}
