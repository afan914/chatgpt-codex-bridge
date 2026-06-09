export async function sendMessageToTab<TResponse>(
  tabId: number,
  message: unknown
): Promise<
  | { ok: true; response: TResponse }
  | { ok: false; message: string; rawMessage?: string }
> {
  if (isExtractConversationMessage(message)) {
    const directExtraction = await executeDirectExtraction<TResponse>(tabId);
    if (directExtraction.ok) {
      return directExtraction;
    }

    const contentScriptExtraction = await sendMessageWithInjection<TResponse>(tabId, message);
    if (contentScriptExtraction.ok) {
      return contentScriptExtraction;
    }

    return {
      ok: false,
      message: `Direct extraction failed: ${directExtraction.message}. Content script fallback failed: ${contentScriptExtraction.message}`,
      rawMessage: contentScriptExtraction.rawMessage ?? directExtraction.rawMessage
    };
  }

  return sendMessageWithInjection<TResponse>(tabId, message);
}

async function sendMessageWithInjection<TResponse>(
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

function executeDirectExtraction<TResponse>(
  tabId: number
): Promise<
  | { ok: true; response: TResponse }
  | { ok: false; message: string; rawMessage?: string }
> {
  return new Promise((resolve) => {
    try {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: extractConversationInPage
        },
        async (results) => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            const tabUrl = await getTabUrl(tabId);
            resolve({
              ok: false,
              message: `Direct page read failed on tab ${tabId}${tabUrl ? ` (${tabUrl})` : ""}: ${lastError.message || "unknown error"}`,
              rawMessage: lastError.message
            });
            return;
          }

          const response = results?.[0]?.result;
          if (!response) {
            resolve({
              ok: false,
              message: "Direct page read returned no result"
            });
            return;
          }

          resolve({
            ok: true,
            response: response as TResponse
          });
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

function extractConversationInPage() {
  const messageElements = collectMessageElementsInPage();
  if (messageElements.length === 0) {
    return {
      ok: false,
      error: {
        code: "NO_MESSAGES_DETECTED",
        message: "No ChatGPT messages were detected on the current page"
      }
    };
  }

  const messages = messageElements
    .map((element, index) => extractMessageInPage(element, index + 1))
    .filter((message) => message.content.trim().length > 0 || message.codeBlocks.length > 0);

  if (messages.length === 0) {
    return {
      ok: false,
      error: {
        code: "NO_MESSAGES_DETECTED",
        message: "No readable ChatGPT messages were detected on the current page"
      }
    };
  }

  const assets = messages.flatMap((message) => {
    const blockAssets = message.codeBlocks
      .map((block, blockIndex) => {
        const language = (block.language || "").toLowerCase();
        if (language !== "html" && language !== "md" && language !== "markdown") {
          return undefined;
        }

        const type = language === "html" ? "html" : "markdown";
        const extension = type === "html" ? "html" : "md";
        return {
          id: "",
          type,
          status: "saved",
          sourceLabel: `${language || type} code block`,
          sourceMessageIndex: message.index,
          filename: `message-${String(message.index).padStart(3, "0")}-artifact-${String(blockIndex + 1).padStart(3, "0")}.${extension}`,
          mimeType: type === "html" ? "text/html" : "text/markdown",
          content: block.content
        };
      })
      .filter((asset): asset is {
        id: string;
        type: string;
        status: string;
        sourceLabel: string;
        sourceMessageIndex: number;
        filename: string;
        mimeType: string;
        content: string;
      } => asset !== undefined);

    const imageAssets = Array.from(message.element.querySelectorAll<HTMLImageElement>("img[src]")).map((image, assetIndex) => {
      const sourceUrl = image.src;
      return {
        id: "",
        type: "image",
        status: sourceUrl.startsWith("data:") ? "saved" : "unresolved",
        sourceUrl,
        sourceLabel: image.alt || image.getAttribute("aria-label") || "image",
        sourceMessageIndex: message.index,
        filename: `message-${String(message.index).padStart(3, "0")}-asset-${String(assetIndex + 1).padStart(3, "0")}.png`,
        failureReason: sourceUrl.startsWith("blob:")
          ? "Blob URL cannot be saved by the Bridge because it is only valid in the browser page context"
          : sourceUrl.startsWith("data:")
            ? undefined
            : "Asset URL could not be saved automatically because it may be protected or inaccessible"
      };
    });

    return [...blockAssets, ...imageAssets];
  }).map((asset, index) => ({ ...asset, id: `asset-${String(index + 1).padStart(3, "0")}` }));

  const payloadMessages = messages.map(({ element, ...message }) => message);

  return {
    ok: true,
    payload: {
      conversation: {
        title: getConversationTitleInPage(),
        url: window.location.href,
        exportedAt: new Date().toISOString()
      },
      messages: payloadMessages,
      assets
    },
    summary: {
      messageCount: payloadMessages.length,
      codeBlockCount: payloadMessages.reduce((count, message) => count + message.codeBlocks.length, 0),
      linkCount: payloadMessages.reduce((count, message) => count + message.links.length, 0),
      assetCount: assets.length,
      savedAssetCount: assets.filter((asset) => asset.status === "saved").length,
      unresolvedAssetCount: assets.filter((asset) => asset.status === "unresolved").length,
      failedAssetCount: assets.filter((asset) => asset.status === "failed").length
    }
  };

  function collectMessageElementsInPage(): Element[] {
    const selectors = [
      "[data-message-author-role]",
      "[data-testid^='conversation-turn-']",
      "article"
    ];
    const seen = new Set<Element>();
    const elements: Element[] = [];
    for (const selector of selectors) {
      for (const element of Array.from(document.querySelectorAll(selector))) {
        const messageElement = element.matches("[data-message-author-role]")
          ? element
          : element.querySelector("[data-message-author-role]") ?? element;
        if (seen.has(messageElement)) {
          continue;
        }
        seen.add(messageElement);
        elements.push(messageElement);
      }
    }
    return elements.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1));
  }

  function extractMessageInPage(element: Element, index: number) {
    const codeBlocks = Array.from(element.querySelectorAll("pre code"))
      .map((codeElement) => ({
        language: inferLanguageInPage(codeElement),
        content: codeElement.textContent || ""
      }))
      .filter((block) => block.content.trim().length > 0);

    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a[href]")).map((anchor) => ({
      text: anchor.textContent?.trim() || undefined,
      url: anchor.href
    }));

    return {
      element,
      index,
      role: inferRoleInPage(element),
      content: extractReadableTextInPage(element),
      links,
      codeBlocks
    };
  }

  function extractReadableTextInPage(element: Element): string {
    const clone = element.cloneNode(true) as HTMLElement;
    for (const removable of Array.from(clone.querySelectorAll("button, svg, style, script, noscript"))) {
      removable.remove();
    }
    return (clone.innerText || clone.textContent || "")
      .split("\n")
      .map((line) => line.trimEnd())
      .filter((line) => line.trim().length > 0)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function inferRoleInPage(element: Element): "user" | "assistant" | "unknown" {
    const role = element.getAttribute("data-message-author-role") || element.querySelector("[data-message-author-role]")?.getAttribute("data-message-author-role");
    if (role === "user" || role === "assistant") {
      return role;
    }
    const label = (element.getAttribute("aria-label") || element.textContent || "").toLowerCase();
    if (label.includes("chatgpt")) {
      return "assistant";
    }
    return "unknown";
  }

  function inferLanguageInPage(codeElement: Element): string {
    for (const className of Array.from(codeElement.classList)) {
      if (className.startsWith("language-")) {
        return className.replace(/^language-/, "") || "text";
      }
    }
    const pre = codeElement.closest("pre");
    const label = pre?.parentElement?.querySelector("[data-language], .text-token-text-secondary")?.textContent?.trim();
    return label && /^[a-z0-9+#.-]{1,24}$/i.test(label) ? label : "text";
  }

  function getConversationTitleInPage(): string {
    return document.querySelector("main h1")?.textContent?.trim() || document.title.trim() || "ChatGPT Conversation";
  }
}

function ensureChatGPTHostPermission(tabId: number): Promise<{ ok: true } | { ok: false; message: string; rawMessage?: string }> {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      const tabError = chrome.runtime.lastError;
      if (tabError) {
        resolve({
          ok: false,
          message: `Could not inspect current tab: ${tabError.message || "unknown error"}`,
          rawMessage: tabError.message
        });
        return;
      }

      const originPattern = getChatGPTOriginPattern(tab.url);
      if (!originPattern) {
        resolve({ ok: true });
        return;
      }

      chrome.permissions.contains({ origins: [originPattern] }, (hasPermission) => {
        const containsError = chrome.runtime.lastError;
        if (containsError) {
          resolve({
            ok: false,
            message: `Could not check site access: ${containsError.message || "unknown error"}`,
            rawMessage: containsError.message
          });
          return;
        }

        if (hasPermission) {
          resolve({ ok: true });
          return;
        }

        chrome.permissions.request({ origins: [originPattern] }, (granted) => {
          const requestError = chrome.runtime.lastError;
          if (requestError) {
            resolve({
              ok: false,
              message: `Site access request failed: ${requestError.message || "unknown error"}`,
              rawMessage: requestError.message
            });
            return;
          }

          if (!granted) {
            resolve({
              ok: false,
              message: "Site access was not granted. Allow this extension to read chatgpt.com, then retry."
            });
            return;
          }

          resolve({ ok: true });
        });
      });
    });
  });
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
          func: () => window.location.href
        },
        async () => {
          const probeError = chrome.runtime.lastError;
          if (probeError) {
            const tabUrl = await getTabUrl(tabId);
            resolve({
              ok: false,
              message: `Page injection probe failed on tab ${tabId}${tabUrl ? ` (${tabUrl})` : ""}: ${probeError.message || "unknown error"}`,
              rawMessage: probeError.message
            });
            return;
          }

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
                  message: `Content script injection failed: ${lastError.message || "unknown error"}`,
                  rawMessage: lastError.message
                });
                return;
              }

              resolve({ ok: true });
            }
          );
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

function getTabUrl(tabId: number): Promise<string | undefined> {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      const tabError = chrome.runtime.lastError;
      if (tabError) {
        resolve(undefined);
        return;
      }
      resolve(tab.url);
    });
  });
}

function isReceivingEndMissing(message: string): boolean {
  return message.toLowerCase().includes("receiving end does not exist");
}

function isExtractConversationMessage(message: unknown): boolean {
  return typeof message === "object" && message !== null && "type" in message && message.type === "EXTRACT_CHATGPT_CONVERSATION";
}

function getChatGPTOriginPattern(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname === "chatgpt.com" || hostname.endsWith(".chatgpt.com")) {
      return "https://chatgpt.com/*";
    }
    if (hostname === "chat.openai.com" || hostname.endsWith(".chat.openai.com")) {
      return "https://chat.openai.com/*";
    }
  } catch {
    return undefined;
  }

  return undefined;
}
