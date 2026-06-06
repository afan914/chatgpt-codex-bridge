import { useCallback, useEffect, useState } from "react";
import type { ImportChatGPTContextPayload } from "@chatgpt-codex-bridge/shared";
import { sendMessageToTab } from "../utils/sendMessageToTab";

export type ExtractionSummary = {
  messageCount: number;
  codeBlockCount: number;
  linkCount: number;
  assetCount: number;
};

type ExtractConversationResponse =
  | {
      ok: true;
      payload: ImportChatGPTContextPayload;
      summary: ExtractionSummary;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

export type ConversationExtractionState =
  | { status: "idle" }
  | { status: "extracting" }
  | {
      status: "success";
      payload: ImportChatGPTContextPayload;
      summary: ExtractionSummary;
    }
  | {
      status: "error";
      code?: string;
      message: string;
      rawMessage?: string;
    };

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
        status: "error",
        code: "NO_TAB_ID",
        message: "Could not communicate with the content script"
      });
      return;
    }

    setExtractionStatus({ status: "extracting" });
    const messageResult = await sendMessageToTab<ExtractConversationResponse>(input.tabId, {
      type: "EXTRACT_CHATGPT_CONVERSATION"
    });

    if (!messageResult.ok) {
      setExtractionStatus({
        status: "error",
        code: isReceivingEndMissing(messageResult.rawMessage ?? messageResult.message)
          ? "CONTENT_SCRIPT_UNAVAILABLE"
          : "CONTENT_SCRIPT_CONNECTION_FAILED",
        message: messageResult.message,
        rawMessage: messageResult.rawMessage
      });
      return;
    }

    if (!messageResult.response.ok) {
      setExtractionStatus({
        status: "error",
        code: messageResult.response.error.code,
        message: messageResult.response.error.message
      });
      return;
    }

    setExtractionStatus({
      status: "success",
      payload: messageResult.response.payload,
      summary: messageResult.response.summary
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
