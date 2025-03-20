import { createI18n } from 'vue-i18n';
import zhCN from './zhCN.json'

const i18n = createI18n({
  locale: 'zhCN',
  fallbackLocale: 'zh',
  legacy: false,
  globalInjection: true,
  messages: {
    zhCN,
  }
});

export default i18n;


