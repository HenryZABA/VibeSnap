const SUPABASE_URL = "https://mxqjggxmlguqbtqmybze.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cWpnZ3htbGd1cWJ0cW15YnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzMzMDQsImV4cCI6MjA4ODM0OTMwNH0.hF901RjGE59_ZUFG-YnpmVSP0i-nMWJILzwE6bPNCH8";

/**
 * Directly call a Supabase Edge Function via native fetch,
 * bypassing supabase-js SDK limitations on large payloads.
 */
export async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Edge Function error: ${response.status}`);
  }

  return data as T;
}
