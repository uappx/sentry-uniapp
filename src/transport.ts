import type { BaseTransportOptions, Transport, TransportMakeRequestResponse, TransportRequest } from '@sentry/core';
import { createTransport, rejectedSyncPromise } from '@sentry/core';

import { sdk } from './crossPlatform';
import { debugLog, debugError } from './debug';

/**
 * Creates a Transport that uses UniApp's request API
 */
export function makeUniappTransport(
    options: BaseTransportOptions
): Transport {
    debugLog('[Sentry Transport] makeUniappTransport factory called');
    debugLog('[Sentry Transport] options.url:', options.url);

    function makeRequest(request: TransportRequest): PromiseLike<TransportMakeRequestResponse> {
        debugLog('[Sentry Transport] makeRequest called');
        debugLog('[Sentry Transport] options.url:', options.url);
        debugLog('[Sentry Transport] request.body length:', request.body?.length);

        const requestFunc = sdk.request || sdk.httpRequest;
        debugLog('[Sentry Transport] requestFunc available:', !!requestFunc);
        debugLog('[Sentry Transport] sdk.request:', !!sdk.request, 'sdk.httpRequest:', !!sdk.httpRequest);

        if (!requestFunc) {
            debugError('[Sentry Transport] No request function available!');
            return rejectedSyncPromise(new Error('No request function available'));
        }

        // Convert string to ArrayBuffer for better compatibility with WeChat miniprogram
        // WeChat miniprogram doesn't handle string data well with non-standard Content-Types
        const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
        const bodyStr = request.body as string;
        const requestData = textEncoder ? textEncoder.encode(bodyStr).buffer : bodyStr;

        debugLog('[Sentry Transport] Using TextEncoder:', !!textEncoder);
        debugLog('[Sentry Transport] requestData type:', typeof requestData);
        debugLog('[Sentry Transport] requestData is ArrayBuffer:', requestData instanceof ArrayBuffer);

        debugLog('[Sentry Transport] Calling requestFunc with:', {
            url: options.url,
            method: 'POST',
            dataType: typeof requestData,
            hasHeader: true,
        });

        return new Promise<TransportMakeRequestResponse>((resolve, reject) => {
            requestFunc({
                url: options.url,
                method: 'POST',
                data: requestData,
                dataType: 'text', // Expect text response
                responseType: 'text', // Response should be text
                header: {
                    'Content-Type': 'application/x-sentry-envelope',
                },
                timeout: 30000, // 30 seconds timeout
                success(res: { statusCode: number; header?: Record<string, string> }) {
                    debugLog('[Sentry Transport] Request SUCCESS!', res.statusCode);
                    const status = res.statusCode;
                    const headers = res.header || {};

                    resolve({
                        statusCode: status,
                        headers: {
                            'x-sentry-rate-limits': headers['x-sentry-rate-limits'] || headers['X-Sentry-Rate-Limits'] || null,
                            'retry-after': headers['retry-after'] || headers['Retry-After'] || null,
                        },
                    });
                },
                fail(error: any) {
                    debugError('[Sentry Transport] Request FAILED:', error);
                    reject(error);
                },
            });
            debugLog('[Sentry Transport] requestFunc called, waiting for response...');
        });
    }

    return createTransport(options, makeRequest);
}

// Export as XHRTransport for backward compatibility
export const XHRTransport = makeUniappTransport;
