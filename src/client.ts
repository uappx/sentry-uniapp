// logger is not exported from core in v8, stays in utils or needs check
// But based on user request, let's check other files. 
// Actually, logger IS internal in v8 usually. Let's keep it if not deprecated or check specifically.
// User specifically mentioned extractExceptionKeysForMessage, isEvent, normalizeToSize.
// Let's stick to those for now, and check if logger is deprecated.
import { BaseClient } from '@sentry/core';
import type { ClientOptions, Event, EventHint, Scope, SeverityLevel } from '@sentry/core';

import { eventFromException, eventFromMessage } from './eventbuilder';
import { makeUniappTransport } from './transport';
import { SDK_NAME, SDK_VERSION } from './version';
import { debugLog, debugError } from './debug';

/**
 * Configuration options for the Uniapp SDK.
 */
export interface UniappOptions extends ClientOptions {
  /**
   * List of URLs to allow for error tracking.
   */
  allowUrls?: Array<string | RegExp>;

  /**
   * List of URLs to deny for error tracking.
   */
  denyUrls?: Array<string | RegExp>;

  /**
   * Extra options for global handlers integration
   */
  extraOptions?: {
    onerror?: boolean;
    onunhandledrejection?: boolean;
    onpagenotfound?: boolean;
    onmemorywarning?: boolean;
  };

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

/**
 * The Sentry Uniapp SDK Client.
 */
export class UniappClient extends BaseClient<UniappOptions> {
  /**
   * Creates a new Uniapp SDK instance.
   */
  public constructor(options: UniappOptions) {
    debugLog('[Sentry Client] Constructor called');
    debugLog('[Sentry Client] options.dsn:', options.dsn);
    debugLog('[Sentry Client] options.transport:', typeof options.transport);

    // Set default transport if not provided
    const clientOptions: UniappOptions = {
      transport: makeUniappTransport,
      ...options,
    };

    debugLog('[Sentry Client] Calling super(options)...');
    try {
      super(clientOptions);
      debugLog('[Sentry Client] super() completed successfully!');
    } catch (error) {
      debugError('[Sentry Client] super() threw error:', error);
      throw error;
    }
    debugLog('[Sentry Client] Constructor complete');
  }

  /**
   * @inheritDoc
   */
  protected _prepareEvent(
    event: Event,
    hint: EventHint,
    scope?: Scope
  ): PromiseLike<Event | null> {
    debugLog('[Sentry Client] _prepareEvent called for event:', event.event_id);
    debugLog('[Sentry Client] Event type:', event.type);
    debugLog('[Sentry Client] Event message:', event.message);

    // Set SDK info
    event.sdk = {
      name: SDK_NAME,
      packages: [
        {
          name: 'npm:sentry-uniapp',
          version: SDK_VERSION,
        },
      ],
      version: SDK_VERSION,
    };

    // Ensure JavaScript platform for proper sourcemap processing
    if (!event.platform) {
      event.platform = 'javascript';
    }

    return super._prepareEvent(event, hint, scope);
  }

  /**
   * Create an event from an exception.
   */
  public eventFromException(exception: any, hint?: EventHint): PromiseLike<Event> {
    return Promise.resolve(eventFromException(exception, hint));
  }

  /**
   * Create an event from a message.
   */
  public eventFromMessage(
    message: string,
    level: SeverityLevel = 'info',
    hint?: EventHint
  ): PromiseLike<Event> {
    return Promise.resolve(eventFromMessage(message, level, hint));
  }
}

/**
 * Options for showing the report dialog (not supported in miniapp environment)
 */
export interface ReportDialogOptions {
  eventId?: string;
  [key: string]: any;
}
