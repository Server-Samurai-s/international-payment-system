declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_API_URL: string;
    REACT_APP_MIN_PASSWORD_LENGTH: string;
    REACT_APP_ENV: 'development' | 'production' | 'test';
    REACT_APP_ENCRYPTION_KEY: string;
    REACT_APP_ACCOUNT_REQUIRED_MESSAGE: string;
    REACT_APP_PASSWORD_REQUIRED_MESSAGE: string;
  }
}

export {}; 