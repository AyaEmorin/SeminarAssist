import { supabase } from './supabase';

export async function apiGet<T>(url: string): Promise<T> {
  console.log(`[API] GET ${url}`);
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    console.error(`[API] GET ${url} failed:`, response.status, response.statusText);
    throw new Error(`GET ${url} failed with ${response.status}`);
  }
  const data = (await response.json()) as T;
  console.log(`[API] GET ${url} success`);
  return data;
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  console.log(`[API] POST ${url}`, body);
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[API] POST ${url} failed:`, response.status, text);
    throw new Error(text || `POST ${url} failed with ${response.status}`);
  }

  const data = (await response.json()) as T;
  console.log(`[API] POST ${url} success`);
  return data;
}
