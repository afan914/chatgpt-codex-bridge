import { useEffect, useState } from "react";
import { isChatGPTPage } from "../../utils/isChatGPTPage";

export type CurrentTabState =
  | { status: "loading" }
  | {
      status: "ready";
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
      if (!tab) {
        setState({ status: "error", message: "No active tab found" });
        return;
      }

      if (!tab.url) {
        setState({ status: "error", message: "Current tab URL is not available" });
        return;
      }

      setState({
        status: "ready",
        url: tab.url,
        title: tab.title,
        isChatGPTPage: isChatGPTPage(tab.url)
      });
    });
  }, []);

  return state;
}
