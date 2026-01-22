/**
 * Internationalization (i18n) Setup
 * Simple implementation ready for react-i18next integration
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

export interface Translation {
  [key: string]: string | Translation;
}

export const translations: Record<Language, Translation> = {
  en: {
    common: {
      welcome: 'Welcome',
      login: 'Login',
      logout: 'Logout',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
    },
    nav: {
      dashboard: 'Dashboard',
      hosts: 'Hosts',
      problems: 'Problems',
      traps: 'Traps',
      insights: 'Insights',
      reports: 'Reports',
      settings: 'Settings',
    },
    dashboard: {
      title: 'Dashboard',
      totalHosts: 'Total Hosts',
      activeProblems: 'Active Problems',
      systemHealth: 'System Health',
      aiConfidence: 'AI Confidence',
    },
    admin: {
      orgAdmin: 'Organization Admin',
      superAdmin: 'Super Admin',
      userManagement: 'User Management',
      billing: 'Billing',
      organizations: 'Organizations',
      securityLogs: 'Security Logs',
    },
  },
  es: {
    common: {
      welcome: 'Bienvenido',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      signup: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      submit: 'Enviar',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      search: 'Buscar',
    },
    nav: {
      dashboard: 'Panel',
      hosts: 'Hosts',
      problems: 'Problemas',
      traps: 'Trampas',
      insights: 'Perspectivas',
      reports: 'Informes',
      settings: 'Configuración',
    },
    dashboard: {
      title: 'Panel',
      totalHosts: 'Total de Hosts',
      activeProblems: 'Problemas Activos',
      systemHealth: 'Salud del Sistema',
      aiConfidence: 'Confianza IA',
    },
    admin: {
      orgAdmin: 'Administrador de Organización',
      superAdmin: 'Super Administrador',
      userManagement: 'Gestión de Usuarios',
      billing: 'Facturación',
      organizations: 'Organizaciones',
      securityLogs: 'Registros de Seguridad',
    },
  },
  fr: {
    common: {
      welcome: 'Bienvenue',
      login: 'Connexion',
      logout: 'Déconnexion',
      signup: 'S\'inscrire',
      email: 'Email',
      password: 'Mot de passe',
      submit: 'Soumettre',
      cancel: 'Annuler',
      save: 'Sauvegarder',
      delete: 'Supprimer',
      edit: 'Modifier',
      search: 'Rechercher',
    },
    nav: {
      dashboard: 'Tableau de bord',
      hosts: 'Hôtes',
      problems: 'Problèmes',
      traps: 'Pièges',
      insights: 'Informations',
      reports: 'Rapports',
      settings: 'Paramètres',
    },
    dashboard: {
      title: 'Tableau de bord',
      totalHosts: 'Total des hôtes',
      activeProblems: 'Problèmes actifs',
      systemHealth: 'Santé du système',
      aiConfidence: 'Confiance IA',
    },
    admin: {
      orgAdmin: 'Administrateur d\'organisation',
      superAdmin: 'Super administrateur',
      userManagement: 'Gestion des utilisateurs',
      billing: 'Facturation',
      organizations: 'Organisations',
      securityLogs: 'Journaux de sécurité',
    },
  },
  de: {
    common: {
      welcome: 'Willkommen',
      login: 'Anmelden',
      logout: 'Abmelden',
      signup: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
      submit: 'Absenden',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      search: 'Suchen',
    },
    nav: {
      dashboard: 'Dashboard',
      hosts: 'Hosts',
      problems: 'Probleme',
      traps: 'Fallen',
      insights: 'Einblicke',
      reports: 'Berichte',
      settings: 'Einstellungen',
    },
    dashboard: {
      title: 'Dashboard',
      totalHosts: 'Gesamte Hosts',
      activeProblems: 'Aktive Probleme',
      systemHealth: 'Systemzustand',
      aiConfidence: 'KI-Vertrauen',
    },
    admin: {
      orgAdmin: 'Organisationsadministrator',
      superAdmin: 'Super Administrator',
      userManagement: 'Benutzerverwaltung',
      billing: 'Abrechnung',
      organizations: 'Organisationen',
      securityLogs: 'Sicherheitsprotokolle',
    },
  },
  ja: {
    common: {
      welcome: 'ようこそ',
      login: 'ログイン',
      logout: 'ログアウト',
      signup: 'サインアップ',
      email: 'メール',
      password: 'パスワード',
      submit: '送信',
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      edit: '編集',
      search: '検索',
    },
    nav: {
      dashboard: 'ダッシュボード',
      hosts: 'ホスト',
      problems: '問題',
      traps: 'トラップ',
      insights: 'インサイト',
      reports: 'レポート',
      settings: '設定',
    },
    dashboard: {
      title: 'ダッシュボード',
      totalHosts: '総ホスト数',
      activeProblems: 'アクティブな問題',
      systemHealth: 'システムヘルス',
      aiConfidence: 'AI信頼度',
    },
    admin: {
      orgAdmin: '組織管理者',
      superAdmin: 'スーパー管理者',
      userManagement: 'ユーザー管理',
      billing: '請求',
      organizations: '組織',
      securityLogs: 'セキュリティログ',
    },
  },
  zh: {
    common: {
      welcome: '欢迎',
      login: '登录',
      logout: '登出',
      signup: '注册',
      email: '电子邮件',
      password: '密码',
      submit: '提交',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      search: '搜索',
    },
    nav: {
      dashboard: '仪表板',
      hosts: '主机',
      problems: '问题',
      traps: '陷阱',
      insights: '洞察',
      reports: '报告',
      settings: '设置',
    },
    dashboard: {
      title: '仪表板',
      totalHosts: '总主机数',
      activeProblems: '活跃问题',
      systemHealth: '系统健康',
      aiConfidence: 'AI置信度',
    },
    admin: {
      orgAdmin: '组织管理员',
      superAdmin: '超级管理员',
      userManagement: '用户管理',
      billing: '账单',
      organizations: '组织',
      securityLogs: '安全日志',
    },
  },
};

/**
 * Get translation by key path
 * Example: t('common.welcome') -> 'Welcome'
 */
export const t = (key: string, lang: Language = 'en'): string => {
  const keys = key.split('.');
  let value: any = translations[lang];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
};

/**
 * Get current browser language
 */
export const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0] as Language;
  return Object.keys(translations).includes(browserLang) ? browserLang : 'en';
};
