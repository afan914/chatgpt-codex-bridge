import http from "node:http";

export type HealthCheckResult = {
  ok: boolean;
  statusCode?: number;
};

export async function checkHealth(port: number): Promise<boolean> {
  return (await requestJson<unknown>(port, "/health")).ok;
}

export async function fetchProjects(port: number): Promise<Array<{ id: string; name: string; path: string; isDefault: boolean }>> {
  const result = await requestJson<{ ok: true; projects: Array<{ id: string; name: string; path: string; isDefault: boolean }> }>(
    port,
    "/projects"
  );
  if (!result.ok || !result.body.ok) {
    return [];
  }
  return result.body.projects;
}

async function requestJson<T>(port: number, requestPath: string): Promise<{ ok: true; body: T } | { ok: false }> {
  return new Promise((resolve) => {
    const request = http.get(
      {
        host: "127.0.0.1",
        port,
        path: requestPath,
        timeout: 1000
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on("end", () => {
          if (response.statusCode !== 200) {
            resolve({ ok: false });
            return;
          }
          try {
            resolve({ ok: true, body: JSON.parse(Buffer.concat(chunks).toString("utf8")) as T });
          } catch {
            resolve({ ok: false });
          }
        });
      }
    );

    request.on("error", () => resolve({ ok: false }));
    request.on("timeout", () => {
      request.destroy();
      resolve({ ok: false });
    });
  });
}
