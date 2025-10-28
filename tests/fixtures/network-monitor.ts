/**
 * Playwright Fixture: Network Monitor
 * 
 * Tracks all HTTP requests and responses
 * Provides utilities for asserting network behavior
 */

import { test as base, Page } from '@playwright/test';

export type NetworkRequest = {
  timestamp: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  postData: any;
};

export type NetworkResponse = {
  timestamp: number;
  url: string;
  status: number;
  headers: Record<string, string>;
  body: any;
};

type NetworkMonitorFixture = {
  networkMonitor: {
    requests: NetworkRequest[];
    responses: NetworkResponse[];
    waitForRequest: (urlPattern: string | RegExp, timeout?: number) => Promise<NetworkRequest>;
    waitForResponse: (urlPattern: string | RegExp, timeout?: number) => Promise<NetworkResponse>;
    clearHistory: () => void;
  };
};

export const test = base.extend<NetworkMonitorFixture>({
  networkMonitor: async ({ page }, use) => {
    const requests: NetworkRequest[] = [];
    const responses: NetworkResponse[] = [];

    // Capture requests
    page.on('request', request => {
      requests.push({
        timestamp: Date.now(),
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postDataJSON?.() || null,
      });
    });

    // Capture responses
    page.on('response', async response => {
      responses.push({
        timestamp: Date.now(),
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
        body: await response.json().catch(() => null),
      });
    });

    const monitor = {
      requests,
      responses,
      
      waitForRequest: async (urlPattern: string | RegExp, timeout = 10000) => {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
          const found = requests.find(req => {
            if (typeof urlPattern === 'string') {
              return req.url.includes(urlPattern);
            }
            return urlPattern.test(req.url);
          });
          
          if (found) return found;
          await page.waitForTimeout(100);
        }
        
        throw new Error(`Request matching ${urlPattern} not found within ${timeout}ms`);
      },
      
      waitForResponse: async (urlPattern: string | RegExp, timeout = 10000) => {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
          const found = responses.find(res => {
            if (typeof urlPattern === 'string') {
              return res.url.includes(urlPattern);
            }
            return urlPattern.test(res.url);
          });
          
          if (found) return found;
          await page.waitForTimeout(100);
        }
        
        throw new Error(`Response matching ${urlPattern} not found within ${timeout}ms`);
      },
      
      clearHistory: () => {
        requests.length = 0;
        responses.length = 0;
      },
    };

    await use(monitor);
  },
});

export { expect } from '@playwright/test';
