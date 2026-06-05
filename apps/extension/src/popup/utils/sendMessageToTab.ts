export async function sendMessageToTab<TResponse>(
  tabId: number,
  message: unknown
): Promise<
  | { ok: true; response: TResponse }
  | { ok: false; message: string }
> {
  return new Promise((resolve) => {
    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        const lastError = chrome.runtime.lastError;

        if (lastError) {
          resolve({
            ok: false,
            message: lastError.message || "Could not communicate with the content script"
          });
          return;
        }

        resolve({
          ok: true,
          response: response as TResponse
        });
      });
    } catch (error) {
      resolve({
        ok: false,
        message: error instanceof Error ? error.message : "Could not communicate with the content script"
      });
    }
  });
}
