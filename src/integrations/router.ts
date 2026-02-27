import { defineIntegration } from '@sentry/core';
import type { Client, Event, Integration, IntegrationFn } from '@sentry/core';

declare const getCurrentPages: any;

const INTEGRATION_NAME = 'Router';

interface RouterOptions {
  enable?: boolean;
}

const _routerIntegration = ((options: RouterOptions = {}) => {
  const enable = options.enable !== false;

  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      // No setup needed
    },
    processEvent(event: Event, _hint: unknown, _client: Client): Event {
      if (!enable) {
        return event;
      }

      try {
        const routers = getCurrentPages().map((route: { route: string; options: object }) => ({
          route: route.route,
          options: route.options,
        }));

        return {
          ...event,
          contexts: {
            ...event.contexts,
            router: {
              routes: routers.map(route => JSON.stringify(route)),
              current: routers[routers.length - 1],
            },
          },
        };
      } catch (e) {
        // Silently fail if getCurrentPages is not available
      }

      return event;
    },
  } satisfies Integration;
}) satisfies IntegrationFn;

/**
 * Router integration - captures route information from the miniapp
 */
export const routerIntegration = defineIntegration(_routerIntegration);
