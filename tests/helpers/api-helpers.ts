/**
 * API Helper Functions
 * Phase 12: Integration Testing
 */

import { expect, APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

export async function apiRegister(
  request: APIRequestContext,
  userData: {
    username: string;
    email: string;
    password: string;
  }
) {
  const response = await request.post(`${BASE_URL}/api/auth/register`, {
    data: userData,
  });
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return data;
}

export async function apiLogin(
  request: APIRequestContext,
  credentials: {
    username: string;
    password: string;
  }
) {
  const response = await request.post(`${BASE_URL}/api/auth/login`, {
    data: credentials,
  });
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return data;
}

export async function apiCreateMemory(
  request: APIRequestContext,
  token: string,
  memoryData: {
    content: string;
    type?: string;
    visibility?: string;
  }
) {
  const response = await request.post(`${BASE_URL}/api/memories`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    data: memoryData,
  });
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return data;
}

export async function apiGetMemories(
  request: APIRequestContext,
  token: string
) {
  const response = await request.get(`${BASE_URL}/api/memories`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return data;
}

export async function apiDeleteMemory(
  request: APIRequestContext,
  token: string,
  memoryId: number
) {
  const response = await request.delete(`${BASE_URL}/api/memories/${memoryId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  expect(response.ok()).toBeTruthy();
}

export async function waitForAPI(url: string, timeout: number = 30000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Continue waiting
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return false;
}
