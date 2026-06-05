import { useMemo, useState } from "react";
import { t } from "@chatgpt-codex-bridge/shared";
import type { SendToBridgeResult } from "../bridge/bridgeClient";
import { sendPayloadToBridge } from "../bridge/bridgeClient";
import { ErrorMessage } from "./components/ErrorMessage";
import { LanguageToggle } from "./components/LanguageToggle";
import { SendButton } from "./components/SendButton";
import { StatusBadge } from "./components/StatusBadge";
import { useBridgeStatus } from "./hooks/useBridgeStatus";
import { useCurrentTab } from "./hooks/useCurrentTab";
import { useLocale } from "./hooks/useLocale";
import { buildMockPayload } from "./mockPayload";

export function Popup(): JSX.Element {
  const { locale, setLocale } = useLocale();
  const currentTab = useCurrentTab();
  const { bridgeStatus, refresh } = useBridgeStatus();
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [sendResult, setSendResult] = useState<SendToBridgeResult | undefined>();

  const currentTabTitle = currentTab.status === "ready" ? currentTab.title : undefined;
  const currentTabUrl = currentTab.status === "ready" ? currentTab.url : undefined;
  const isCurrentTabChatGPT = currentTab.status === "ready" && currentTab.isChatGPTPage;

  const mockPayloadPreview = useMemo(
    () => buildMockPayload({ title: currentTabTitle, url: currentTabUrl }),
    [currentTabTitle, currentTabUrl]
  );

  const messageCount = mockPayloadPreview.messages.length;
  const codeBlockCount = mockPayloadPreview.messages.reduce(
    (count, message) => count + (message.codeBlocks?.length ?? 0),
    0
  );
  const assetCount = mockPayloadPreview.assets?.length ?? 0;

  const disabledReason = getDisabledReason({
    bridgeStatus: bridgeStatus.status,
    currentTabStatus: currentTab.status,
    isCurrentTabChatGPT,
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

    setIsSending(true);
    const freshPayload = buildMockPayload({
      title: currentTab.title,
      url: currentTab.url
    });
    const result = await sendPayloadToBridge(freshPayload);
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
          <p>{t(locale, "mockPayloadNotice")}</p>
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
          <StatusBadge status={currentTab.isChatGPTPage ? "success" : "warning"}>
            {currentTab.isChatGPTPage ? t(locale, "chatgptDetected") : t(locale, "notChatgptPage")}
          </StatusBadge>
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
        <h2>{t(locale, "mockExtractionSummary")}</h2>
        <dl className="summary-grid">
          <div>
            <dt>{t(locale, "messageCount")}</dt>
            <dd>{messageCount}</dd>
          </div>
          <div>
            <dt>{t(locale, "codeBlockCount")}</dt>
            <dd>{codeBlockCount}</dd>
          </div>
          <div>
            <dt>{t(locale, "assetCount")}</dt>
            <dd>{assetCount}</dd>
          </div>
        </dl>
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
        label={t(locale, "sendToCodex")}
        sendingLabel={t(locale, "sending")}
      />
    </main>
  );
}

type DisabledReasonInput = {
  bridgeStatus: "checking" | "connected" | "disconnected";
  currentTabStatus: "loading" | "ready" | "error";
  isCurrentTabChatGPT: boolean;
  isSending: boolean;
};

type DisabledReason =
  | "buttonDisabledBridgeDisconnected"
  | "buttonDisabledChecking"
  | "buttonDisabledNotChatGPT"
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

  return undefined;
}
