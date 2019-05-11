const HOST = {
  api: {
    getUrl: (path: string): string => (path === HOST.api.base ? path : (HOST.api.base + path)),
    // base: '//localhost:3001',
    base: 'http://ec2-13-229-247-9.ap-southeast-1.compute.amazonaws.com:3001',
    user: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      // signup_local: '/api/auth/signup-local',
      // reset_password: '/api/auth/reset-password',
      // verify_account: '/api/auth/verify-account',
      loadUser: '/api/user/load-user',
      loadUserBasic: '/api/user/load-user-basic',
      // support: '/api/auth/user-support-request',
      login_by_facebook: '/api/auth/login-by-facebook',
      connect_to_facebook: '/api/auth/connect-to-facebook',
      login_by_google: '/api/auth/login-by-google',
      connect_to_google: '/api/auth/connect-to-google',
    },
    // base: '//api.bibooki.com',
    word: {
      search: '/api/word/search',
      is_existing: '/api/word/is-word-existing/',
      is_url_existing: '/api/word/is-url-existing/',
      save: '/api/word/save/',
    },
    pron: {
      search: '/api/pron/search',
      save: '/api/pron/save',
      delete: '/api/pron/delete',
    },
    meaning: {
      search: '/api/mean/search',
      save: '/api/mean/save',
      delete: '/api/mean/delete',
    },
    meaning_usage: {
      search: '/api/mean-usage/search',
      save: '/api/mean-usage/save',
      delete: '/api/mean-usage/delete',
    },
    meaning_usage_example: {
      search: '/api/mean-example/search',
      save: '/api/mean-example/save',
      delete: '/api/mean-example/delete',
    },
    search: {
      word_has_pron: '/api/search/word-has-pronunciation',
      word_no_pron: '/api/search/word-has-no-pronunciation',
      word_no_mean_usage: '/api/search/word-has-no-mean-usage',
    },
    read_aloud: {
      fetch: (order: number) => `/api/read-aloud/${order}`,
    },
    oxford: '/o?w=',
  },
};

export { HOST };
