export async function sendMessageToTab<TResponse>(
  tabId: number,
  message: unknown
): Promise<
  | { ok: true; response: TResponse }
  | { ok: false; message: string; rawMessage?: string }
> {
  return new Promise((resolve) => {
    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        const lastError = chrome.runtime.lastError;

        if (lastError) {
          resolve({
            ok: false,
            message: lastError.message || "Could not read the ChatGPT page",
            rawMessage: lastError.message
          });
          return;
        }

        resolve({
          ok: true,
          response: response as TResponse
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not read the ChatGPT page";
      resolve({
        ok: false,
        message,
        rawMessage: message
      });
    }
  });
}
