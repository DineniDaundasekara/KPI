import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { createMsalInstance } from './app/auth-config';

const msalInstance = createMsalInstance();

(async () => {
  try {
    await msalInstance.initialize();

    // Ensure redirect responses are processed before Angular bootstraps to avoid guard-triggered loops
    const response = await msalInstance.handleRedirectPromise();
    
    if (response && response.account) {
      msalInstance.setActiveAccount(response.account);
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
        msalInstance.setActiveAccount(accounts[0]);
      }
    }
  } catch (e) {
    console.warn('MSAL initialization or handleRedirectPromise error', e);
    // Store error for debugging
    sessionStorage.setItem('msalError', JSON.stringify(e));
  } finally {
    bootstrapApplication(App, appConfig).catch((err) => console.error(err));
  }
})();