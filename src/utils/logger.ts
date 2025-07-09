// Logger sécurisé pour la production mobile
export const logger = {
  log: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(message, ...args);
    }
  },
  
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      console.error(message, error);
    }
    // En production, logger vers un service de monitoring si nécessaire
  },
  
  warn: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn(message, ...args);
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.debug(message, ...args);
    }
  }
};