import { useState } from "react";
import { t } from "@chatgpt-codex-bridge/shared";
import type { SendToBridgeResult } from "../bridge/bridgeClient";
import { sendPayloadToBridge } from "../bridge/bridgeClient";
import { ErrorMessage } from "./components/ErrorMessage";
import { LanguageToggle } from "./components/LanguageToggle";
import { SendButton } from "./components/SendButton";
import { StatusBadge } from "./components/StatusBadge";
import { useBridgeStatus } from "./hooks/useBridgeStatus";
import { useConversationExtraction } from "./hooks/useConversationExtraction";
import { useCurrentTab } from "./hooks/useCurrentTab";
import { useLocale } from "./hooks/useLocale";

export function Popup(): JSX.Element {
  const { locale, setLocale } = useLocale();
  const currentTab = useCurrentTab();
  const { bridgeStatus, refresh } = useBridgeStatus();
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [sendResult, setSendResult] = useState<SendToBridgeResult | undefined>();

  const isCurrentTabChatGPT = currentTab.status === "ready" && currentTab.isChatGPTPage;
  const currentTabId = currentTab.status === "ready" ? currentTab.tabId : undefined;
  const { extractionStatus, retry: retryExtraction } = useConversationExtraction({
    tabId: currentTabId,
    isChatGPTPage: isCurrentTabChatGPT
  });

  const extractionSummary =
    extractionStatus.status === "success"
      ? extractionStatus.summary
      : { messageCount: 0, codeBlockCount: 0, linkCount: 0, assetCount: 0 };

  const disabledReason = getDisabledReason({
    bridgeStatus: bridgeStatus.status,
    currentTabStatus: currentTab.status,
    isCurrentTabChatGPT,
    extractionStatus: extractionStatus.status,
    extractedMessageCount: extractionSummary.messageCount,
    isSending
  });
  const isSendDisabled = disabledReason !== undefined;

  async function handleSend(): Promise<void> {
    setErrorMessage(undefined);
    setSendResult(undefined);

    if (currentTab.status !== "ready" || !currentTab.isChatGPTPage) {
      setErrorMessage(t(locale, "currentPageNotChatGPT"));
      return;
    }

    if (bridgeStatus.status !== "connected") {
      setErrorMessage(t(locale, "bridgeDisconnectedHint"));
      return;
    }

    if (extractionStatus.status !== "success") {
      setErrorMessage(`${t(locale, "contentScriptUnavailable")} ${t(locale, "refreshChatGPTPageHint")}`);
      return;
    }

    setIsSending(true);
    const result = await sendPayloadToBridge({
      ...extractionStatus.payload,
      conversation: {
        ...extractionStatus.payload.conversation,
        exportedAt: new Date().toISOString()
      }
    });
    setIsSending(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    setSendResult(result);
  }

  return (
    <main className="popup">
      <header className="popup__header">
        <div>
          <h1>{t(locale, "extensionTitle")}</h1>
          <p>{t(locale, "realExtractionNotice")}</p>
        </div>
        <LanguageToggle
          locale={locale}
          onChange={(nextLocale) => {
            void setLocale(nextLocale);
          }}
          englishLabel={t(locale, "english")}
          chineseLabel={t(locale, "chinese")}
        />
      </header>

      <section className="panel">
        <div className="section-heading">
          <h2>{t(locale, "pageStatus")}</h2>
        </div>
        {currentTab.status === "loading" && <StatusBadge status="neutral">{t(locale, "loadingCurrentTab")}</StatusBadge>}
        {currentTab.status === "error" && <StatusBadge status="error">{currentTab.message}</StatusBadge>}
        {currentTab.status === "ready" && (
          <div className="stack">
            <StatusBadge status={currentTab.isChatGPTPage ? "success" : "warning"}>
              {currentTab.isChatGPTPage ? t(locale, "chatgptDetected") : t(locale, "notChatgptPage")}
            </StatusBadge>
            {currentTab.url && <span className="meta">{t(locale, "currentTabUrl")}: {currentTab.url}</span>}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>{t(locale, "bridgeStatus")}</h2>
          <button className="text-button" type="button" onClick={() => void refresh()}>
            {t(locale, "refresh")}
          </button>
        </div>
        {bridgeStatus.status === "checking" && <StatusBadge status="neutral">{t(locale, "checkingBridge")}</StatusBadge>}
        {bridgeStatus.status === "connected" && (
          <div className="stack">
            <StatusBadge status="success">{t(locale, "bridgeConnected")}</StatusBadge>
            {bridgeStatus.version && <span className="meta">{t(locale, "bridgeVersion")}: {bridgeStatus.version}</span>}
          </div>
        )}
        {bridgeStatus.status === "disconnected" && (
          <div className="stack">
            <StatusBadge status="error">{t(locale, "bridgeDisconnected")}</StatusBadge>
            <span className="meta">{bridgeStatus.message ?? t(locale, "bridgeDisconnectedHint")}</span>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>{t(locale, "extractionSummary")}</h2>
        <dl className="summary-grid">
          <div>
            <dt>{t(locale, "messageCount")}</dt>
            <dd>{extractionSummary.messageCount}</dd>
          </div>
          <div>
            <dt>{t(locale, "codeBlockCount")}</dt>
            <dd>{extractionSummary.codeBlockCount}</dd>
          </div>
          <div>
            <dt>{t(locale, "linkCount")}</dt>
            <dd>{extractionSummary.linkCount}</dd>
          </div>
          <div>
            <dt>{t(locale, "assetCount")}</dt>
            <dd>{extractionSummary.assetCount}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>{t(locale, "extractionStatus")}</h2>
          {isCurrentTabChatGPT && (
            <button className="text-button" type="button" onClick={() => void retryExtraction()}>
              {t(locale, "retryExtraction")}
            </button>
          )}
        </div>
        {!isCurrentTabChatGPT && <StatusBadge status="neutral">{t(locale, "currentPageNotChatGPT")}</StatusBadge>}
        {isCurrentTabChatGPT && extractionStatus.status === "idle" && (
          <StatusBadge status="neutral">{t(locale, "extractingConversation")}</StatusBadge>
        )}
        {isCurrentTabChatGPT && extractionStatus.status === "extracting" && (
          <StatusBadge status="neutral">{t(locale, "extractingConversation")}</StatusBadge>
        )}
        {isCurrentTabChatGPT && extractionStatus.status === "success" && (
          <StatusBadge status="success">{t(locale, "conversationExtracted")}</StatusBadge>
        )}
        {isCurrentTabChatGPT && extractionStatus.status === "error" && (
          <div className="stack">
            <StatusBadge status="error">{t(locale, "conversationExtractionFailed")}</StatusBadge>
            <span className="meta">{getExtractionErrorMessage(locale, extractionStatus.code, extractionStatus.message)}</span>
          </div>
        )}
      </section>

      {disabledReason && <div className="message message--hint">{t(locale, disabledReason)}</div>}
      <ErrorMessage message={errorMessage} />

      {sendResult?.ok && (
        <div className="message message--success">
          <strong>{t(locale, "sendSuccess")}</strong>
          <span>{t(locale, "conversationSlug")}: {sendResult.conversationSlug}</span>
          <span>{t(locale, "outputDirectoryLabel")}: {sendResult.outputDir}</span>
          <span>{t(locale, "filesWrittenLabel")}: {sendResult.filesWritten.length}</span>
        </div>
      )}

      <SendButton
        disabled={isSendDisabled}
        isSending={isSending}
        onClick={() => void handleSend()}
        label={t(locale, "sendRealConversation")}
        sendingLabel={t(locale, "sending")}
      />
    </main>
  );
}

type DisabledReasonInput = {
  bridgeStatus: "checking" | "connected" | "disconnected";
  currentTabStatus: "loading" | "ready" | "error";
  isCurrentTabChatGPT: boolean;
  extractionStatus: "idle" | "extracting" | "success" | "error";
  extractedMessageCount: number;
  isSending: boolean;
};

type DisabledReason =
  | "buttonDisabledBridgeDisconnected"
  | "buttonDisabledChecking"
  | "buttonDisabledNotChatGPT"
  | "buttonDisabledContentScriptUnavailable"
  | "buttonDisabledExtracting"
  | "buttonDisabledExtractionFailed"
  | "buttonDisabledNoMessages"
  | "sending";

function getDisabledReason(input: DisabledReasonInput): DisabledReason | undefined {
  if (input.isSending) {
    return "sending";
  }

  if (input.bridgeStatus === "checking" || input.currentTabStatus === "loading") {
    return "buttonDisabledChecking";
  }

  if (input.bridgeStatus === "disconnected") {
    return "buttonDisabledBridgeDisconnected";
  }

  if (!input.isCurrentTabChatGPT) {
    return "buttonDisabledNotChatGPT";
  }

  if (input.extractionStatus === "extracting" || input.extractionStatus === "idle") {
    return "buttonDisabledExtracting";
  }

  if (input.extractionStatus === "error") {
    return "buttonDisabledExtractionFailed";
  }

  if (input.extractedMessageCount === 0) {
    return "buttonDisabledNoMessages";
  }

  return undefined;
}

function getExtractionErrorMessage(locale: Parameters<typeof t>[0], code: string | undefined, message: string): string {
  if (code === "CONTENT_SCRIPT_UNAVAILABLE") {
    return `${t(locale, "contentScriptUnavailable")} ${t(locale, "refreshChatGPTPageHint")}`;
  }

  if (code === "CONTENT_SCRIPT_CONNECTION_FAILED" || code === "NO_TAB_ID") {
    return t(locale, "contentScriptConnectionFailed");
  }

  if (code === "NO_MESSAGES_DETECTED") {
    return t(locale, "noExtractedMessages");
  }

  return message || t(locale, "conversationExtractionFailed");
}
