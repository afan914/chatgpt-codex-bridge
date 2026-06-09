import { useEffect, useState } from "react";
import { isChatGPTPage } from "../../utils/isChatGPTPage";

export type CurrentTabState =
  | { status: "loading" }
  | {
      status: "ready";
      tabId?: number;
      url?: string;
      title?: string;
      isChatGPTPage: boolean;
    }
  | {
      status: "error";
      message: string;
    };

export function useCurrentTab(): CurrentTabState {
  const [state, setState] = useState<CurrentTabState>({ status: "loading" });

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const runtimeError = chrome.runtime.lastError;
      if (runtimeError) {
        setState({ status: "error", message: runtimeError.message || "Unable to read current tab" });
        return;
      }

      const tab = tabs[0];
      if (tab?.url && isChatGPTPage(tab.url)) {
        setReadyState(setState, tab);
        return;
      }

      chrome.tabs.query({}, (allTabs) => {
        const allTabsError = chrome.runtime.lastError;
        if (allTabsError) {
          if (tab) {
            setReadyState(setState, tab);
            return;
          }

          setState({ status: "error", message: allTabsError.message || "Unable to read browser tabs" });
          return;
        }

        const chatGPTTab = findBestChatGPTTab(allTabs);
        if (chatGPTTab) {
          focusTab(chatGPTTab, (focusedTab) => setReadyState(setState, focusedTab ?? chatGPTTab));
          return;
        }

        if (tab) {
          setReadyState(setState, tab);
          return;
        }

        setState({ status: "error", message: "No active tab found" });
      });
    });
  }, []);

  return state;
}

function findBestChatGPTTab(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab | undefined {
  const chatGPTTabs = tabs.filter((tab) => tab.url && isChatGPTPage(tab.url));
  return (
    chatGPTTabs.find((tab) => tab.active && isConversationUrl(tab.url)) ??
    chatGPTTabs.find((tab) => isConversationUrl(tab.url)) ??
    chatGPTTabs.find((tab) => tab.active) ??
    chatGPTTabs[0]
  );
}

function isConversationUrl(url: string | undefined): boolean {
  return url ? /\/c\/[^/?#]+/.test(url) : false;
}

function setReadyState(setState: (state: CurrentTabState) => void, tab: chrome.tabs.Tab): void {
  if (!tab.url) {
    setState({ status: "error", message: "Current tab URL is not available" });
    return;
  }

  setState({
    status: "ready",
    tabId: tab.id,
    url: tab.url,
    title: tab.title,
    isChatGPTPage: isChatGPTPage(tab.url)
  });
}

function focusTab(tab: chrome.tabs.Tab, callback: (tab?: chrome.tabs.Tab) => void): void {
  if (!tab.id) {
    callback(tab);
    return;
  }

  if (tab.windowId) {
    chrome.windows.update(tab.windowId, { focused: true }, () => {
      chrome.runtime.lastError;
      activateTab(tab.id!, callback, tab);
    });
    return;
  }

  activateTab(tab.id, callback, tab);
}

function activateTab(tabId: number, callback: (tab?: chrome.tabs.Tab) => void, fallbackTab: chrome.tabs.Tab): void {
  chrome.tabs.update(tabId, { active: true }, (updatedTab) => {
    const updateError = chrome.runtime.lastError;
    if (updateError) {
      callback(fallbackTab);
      return;
    }

    callback(updatedTab ?? fallbackTab);
  });
}
