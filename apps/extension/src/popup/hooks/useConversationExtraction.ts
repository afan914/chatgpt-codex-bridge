import { useCallback, useEffect, useState } from "react";
import type { TranslationKey } from "@chatgpt-codex-bridge/shared";
import { sendMessageToTab } from "../utils/sendMessageToTab";

type ContentScriptPingResponse = {
  ok: boolean;
};

export type ConversationExtractionState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ready" }
  | { status: "failed"; messageKey: TranslationKey; hintKey?: TranslationKey };

type UseConversationExtractionInput = {
  tabId?: number;
  isChatGPTPage: boolean;
};

type UseConversationExtractionResult = {
  extractionStatus: ConversationExtractionState;
  retry: () => Promise<void>;
};

export function useConversationExtraction(input: UseConversationExtractionInput): UseConversationExtractionResult {
  const [extractionStatus, setExtractionStatus] = useState<ConversationExtractionState>({ status: "idle" });

  const retry = useCallback(async () => {
    if (!input.isChatGPTPage) {
      setExtractionStatus({ status: "idle" });
      return;
    }

    if (input.tabId === undefined) {
      setExtractionStatus({
        status: "failed",
        messageKey: "contentScriptConnectionFailed",
        hintKey: "refreshChatGPTPageHint"
      });
      return;
    }

    setExtractionStatus({ status: "checking" });
    const result = await sendMessageToTab<ContentScriptPingResponse>(input.tabId, {
      type: "CHATGPT_CODEX_BRIDGE_PING"
    });

    if (result.ok && result.response.ok) {
      setExtractionStatus({ status: "ready" });
      return;
    }

    setExtractionStatus({
      status: "failed",
      messageKey: isReceivingEndMissing(result.ok ? "" : result.message)
        ? "contentScriptUnavailable"
        : "contentScriptConnectionFailed",
      hintKey: "refreshChatGPTPageHint"
    });
  }, [input.isChatGPTPage, input.tabId]);

  useEffect(() => {
    void retry();
  }, [retry]);

  return { extractionStatus, retry };
}

function isReceivingEndMissing(message: string): boolean {
  return message.toLowerCase().includes("receiving end does not exist");
}
