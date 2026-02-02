/**
 * URLSearchParams polyfill for WeChat miniprogram
 * WeChat miniprogram doesn't support URLSearchParams API
 */

// Check if URLSearchParams is available globally
if (typeof URLSearchParams === 'undefined') {
    (global as any).URLSearchParams = class URLSearchParams {
        private params: Map<string, string[]>;

        constructor(init?: string | Record<string, string> | URLSearchParams) {
            this.params = new Map();

            if (typeof init === 'string') {
                // Parse query string
                if (init.startsWith('?')) {
                    init = init.slice(1);
                }
                init.split('&').forEach(part => {
                    if (part) {
                        const [key, value] = part.split('=');
                        this.append(
                            decodeURIComponent(key),
                            decodeURIComponent(value || '')
                        );
                    }
                });
            } else if (init && typeof init === 'object') {
                // Handle object or URLSearchParams
                const entries = init instanceof URLSearchParams
                    ? Array.from((init as any).params.entries())
                    : Object.entries(init);

                entries.forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach(v => this.append(key, v));
                    } else {
                        this.append(key, value as string);
                    }
                });
            }
        }

        append(name: string, value: string): void {
            const values = this.params.get(name) || [];
            values.push(value);
            this.params.set(name, values);
        }

        delete(name: string): void {
            this.params.delete(name);
        }

        get(name: string): string | null {
            const values = this.params.get(name);
            return values ? values[0] : null;
        }

        getAll(name: string): string[] {
            return this.params.get(name) || [];
        }

        has(name: string): boolean {
            return this.params.has(name);
        }

        set(name: string, value: string): void {
            this.params.set(name, [value]);
        }

        toString(): string {
            const parts: string[] = [];
            this.params.forEach((values, key) => {
                values.forEach(value => {
                    parts.push(
                        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
                    );
                });
            });
            return parts.join('&');
        }

        forEach(callback: (value: string, key: string, parent: URLSearchParams) => void): void {
            this.params.forEach((values, key) => {
                values.forEach(value => {
                    callback(value, key, this);
                });
            });
        }

        keys(): IterableIterator<string> {
            return this.params.keys();
        }

        values(): IterableIterator<string> {
            const allValues: string[] = [];
            this.params.forEach(values => {
                allValues.push(...values);
            });
            return allValues[Symbol.iterator]();
        }

        entries(): IterableIterator<[string, string]> {
            const allEntries: [string, string][] = [];
            this.params.forEach((values, key) => {
                values.forEach(value => {
                    allEntries.push([key, value]);
                });
            });
            return allEntries[Symbol.iterator]();
        }

        [Symbol.iterator](): IterableIterator<[string, string]> {
            return this.entries();
        }
    };

    // Always log polyfill loading for debugging purposes
    console.log('[Sentry Polyfill] URLSearchParams polyfill loaded');
}
