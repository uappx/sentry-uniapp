import {
  inboundFiltersIntegration,
  functionToStringIntegration,
  linkedErrorsIntegration,
  dedupeIntegration,
  getClient,
  getCurrentScope,
} from '@sentry/core';
import { createStackParser, nodeStackLineParser } from '@sentry/core';
import type { Integration, StackParser } from '@sentry/core';

// Import polyfills for WeChat miniprogram compatibility
import './polyfills';

import { UniappClient, UniappOptions, ReportDialogOptions } from './client';
import { makeUniappTransport } from './transport';
import {
  globalHandlersIntegration,
  systemIntegration,
  routerIntegration,
} from './integrations';
import { setDebugEnabled, debugLog } from './debug';
import { appName, sdk } from './crossPlatform';

/** Get the default integrations for the Uniapp SDK. */
function getDefaultIntegrations(options: UniappOptions): Integration[] {
  const integrations = [
    inboundFiltersIntegration(),
    functionToStringIntegration(),
    linkedErrorsIntegration(),
    dedupeIntegration(),
    globalHandlersIntegration(options.extraOptions),
    systemIntegration(),
    routerIntegration(),
  ];

  return integrations;
}

/**
 * Initialize the Sentry Uniapp SDK.
 */
export function init(options: Partial<UniappOptions> = {}): void {
  // Enable debug mode if requested
  if (options.debug) {
    setDebugEnabled(true);
  }

  debugLog('[Sentry SDK] init() called with options:', options);

  const finalOptions: UniappOptions = {
    stackParser: createStackParser(nodeStackLineParser()),
    transport: makeUniappTransport,
    integrations: [],
    ...options,
  };

  // Default dist to uniapp platform (or app name) to help match sourcemaps per platform.
  if (!finalOptions.dist) {
    try {
      const systemInfo = sdk.getSystemInfoSync && sdk.getSystemInfoSync();
      let platform =
        systemInfo?.uniPlatform ||
        systemInfo?.platform ||
        systemInfo?.app ||
        appName;
      if (!platform && typeof globalThis !== 'undefined' && (globalThis as any).window) {
        platform = 'h5';
      }
      if (typeof platform === 'string' && platform) {
        finalOptions.dist = platform;
      }
    } catch (e) {
      // ignore
    }
  }

  debugLog('[Sentry SDK] finalOptions.transport:', typeof finalOptions.transport);
  debugLog('[Sentry SDK] finalOptions.dsn:', finalOptions.dsn);

  // Set default integrations if not provided
  if (!options.integrations) {
    finalOptions.integrations = getDefaultIntegrations(finalOptions);
    debugLog('[Sentry SDK] Using default integrations, count:', finalOptions.integrations.length);
  }

  debugLog('[Sentry SDK] Creating UniappClient...');
  const client = new UniappClient(finalOptions);
  const scope = getCurrentScope();

  debugLog('[Sentry SDK] Setting client to scope...');
  scope.setClient(client);

  debugLog('[Sentry SDK] Initializing client...');
  client.init();

  debugLog('[Sentry SDK] Initialization complete!');
}

/**
 * Present the user with a report dialog.
 * Not supported in miniapp environment - this is a no-op.
 */
export function showReportDialog(options: ReportDialogOptions = {}): void {
  // Not supported in miniapp environment
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('sentry-uniapp: showReportDialog is not supported in miniapp environment');
  }
}

/**
 * Get the last event ID captured.
 */
export function lastEventId(): string | undefined {
  const scope = getCurrentScope();
  return scope.lastEventId();
}

/**
 * Flush all pending events.
 */
export async function flush(timeout?: number): Promise<boolean> {
  const client = getClient<UniappClient>();
  if (client) {
    return client.flush(timeout);
  }
  return Promise.resolve(false);
}

/**
 * Close the SDK and flush all pending events.
 */
export async function close(timeout?: number): Promise<boolean> {
  const client = getClient<UniappClient>();
  if (client) {
    return client.close(timeout);
  }
  return Promise.resolve(false);
}
