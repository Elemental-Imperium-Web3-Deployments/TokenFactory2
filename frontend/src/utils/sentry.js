import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      tracesSampleRate: 1.0,
      
      // Set sampleRate to 1.0 to capture 100%
      // of transactions for error monitoring.
      sampleRate: 1.0,
      
      // Configure environment
      environment: process.env.NODE_ENV,
      
      // Configure release version
      release: process.env.REACT_APP_VERSION || '1.0.0',
      
      // Before Send callback
      beforeSend(event) {
        // Don't send user's sensitive information
        if (event.user) {
          delete event.user.ip_address;
          delete event.user.email;
        }
        return event;
      },
      
      // Configure allowed URLs
      allowUrls: [
        /https?:\/\/([a-z0-9]+[.])*your-domain\.com/,
      ],
    });
  }
};

// Custom error boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Custom performance monitoring
export const startTransaction = (name, op) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

// Custom error logging
export const logError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Custom message logging
export const logMessage = (message, level = 'info') => {
  Sentry.captureMessage(message, level);
};

// Set user context
export const setUserContext = (user) => {
  Sentry.setUser({
    id: user.address,
    username: user.address.slice(0, 8),
  });
};

// Clear user context
export const clearUserContext = () => {
  Sentry.setUser(null);
}; 