/**
 * Debug logger utility
 */
let debugEnabled = false;

export function setDebugEnabled(enabled: boolean): void {
    debugEnabled = enabled;
}

export function debugLog(...args: any[]): void {
    if (debugEnabled) {
        console.log(...args);
    }
}

export function debugError(...args: any[]): void {
    if (debugEnabled) {
        console.error(...args);
    }
}
