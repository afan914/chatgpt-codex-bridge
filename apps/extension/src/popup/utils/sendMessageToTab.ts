export async function sendMessageToTab<TResponse>(
  tabId: number,
  message: unknown
): Promise<
  | { ok: true; response: TResponse }
  | { ok: false; message: string; rawMessage?: string }
> {
  const firstAttempt = await sendMessageOnce<TResponse>(tabId, message);
  if (firstAttempt.ok || !isReceivingEndMissing(firstAttempt.rawMessage ?? firstAttempt.message)) {
    return firstAttempt;
  }

  const injection = await injectContentScript(tabId);
  if (!injection.ok) {
    return {
      ok: false,
      message: injection.message,
      rawMessage: injection.rawMessage
    };
  }

  return sendMessageOnce<TResponse>(tabId, message);
}

function sendMessageOnce<TResponse>(
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

function injectContentScript(tabId: number): Promise<{ ok: true } | { ok: false; message: string; rawMessage?: string }> {
  return new Promise((resolve) => {
    try {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          files: ["content.js"]
        },
        () => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            resolve({
              ok: false,
              message: lastError.message || "Could not read the ChatGPT page",
              rawMessage: lastError.message
            });
            return;
          }

          resolve({ ok: true });
        }
      );
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

function isReceivingEndMissing(message: string): boolean {
  return message.toLowerCase().includes("receiving end does not exist");
}
