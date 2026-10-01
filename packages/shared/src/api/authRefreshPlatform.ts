/**
 * Platform hooks for token refresh (B2b): cross-tab lock + visibility.
 * Default: no-op lock (in-process mutex remains in baseApi).
 */

export type AuthRefreshPlatform = {
    withRefreshLock<T>(fn: () => Promise<T>): Promise<T>;
    onAppVisible(callback: () => void): () => void;
};

const defaultPlatform: AuthRefreshPlatform = {
    withRefreshLock: (fn) => fn(),
    onAppVisible: () => () => {},
};

let authRefreshPlatform: AuthRefreshPlatform = defaultPlatform;

export function configureAuthRefreshPlatform(platform: AuthRefreshPlatform): void {
    authRefreshPlatform = platform;
}

export function getAuthRefreshPlatform(): AuthRefreshPlatform {
    return authRefreshPlatform;
}

export function resetAuthRefreshPlatformForTests(): void {
    authRefreshPlatform = defaultPlatform;
}
