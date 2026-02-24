import { InteractionType, PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
    auth: {
        clientId: '2fd0bd33-873a-4744-8762-e8ae70c8b395',
        authority: 'https://login.microsoftonline.com/534253fc-dfb6-462f-b5ca-cbe81939f5ee',
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true
    }
};

export const loginRequest = {
    // Temporarily remove API scope causing AADSTS500011 (resource not found).
    // For production, restore the API scope to the correct App ID URI and ensure admin consent.
    scopes: ['openid', 'profile', 'offline_access']
};

// Create a single MSAL instance
let msalInstance: PublicClientApplication | null = null;
let msalInitialized = false;

export function createMsalInstance(): PublicClientApplication {
    if (!msalInstance) {
        msalInstance = new PublicClientApplication(msalConfig as any);
    }
    // If already initialized in main.ts, return the same instance
    return msalInstance;
}

export function markMsalInitialized(): void {
    msalInitialized = true;
}

export function isMsalInitialized(): boolean {
    return msalInitialized;
}

export function getMsalInstance(): PublicClientApplication | null {
    return msalInstance;
}
