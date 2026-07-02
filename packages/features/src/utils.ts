import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

interface ResourceBundle {
  'zh-TW': Record<string, unknown>;
  'en-US': Record<string, unknown>;
}

/**
 * 傳入命名空間與語系檔，自動搞定所有安全檢查、Module 級動態注入，並吐出對應的 useTrans Hook。
 */
export function createTranslation(ns: string, locales: ResourceBundle) {
  try {
    if (
      i18n &&
      typeof i18n.hasResourceBundle === 'function' &&
      i18n.isInitialized
    ) {
      if (!i18n.hasResourceBundle('zh-TW', ns)) {
        i18n.addResourceBundle('zh-TW', ns, locales['zh-TW'], true, true);
      }
      if (!i18n.hasResourceBundle('en-US', ns)) {
        i18n.addResourceBundle('en-US', ns, locales['en-US'], true, true);
      }
    }
  } catch (e) {
    console.warn(
      `[i18n-factory] Failed to pre-inject resources for namespace: ${ns}`,
      e,
    );
  }

  return function useTrans() {
    return useTranslation(ns);
  };
}
