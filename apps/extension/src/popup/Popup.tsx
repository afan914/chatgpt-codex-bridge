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
import { useProjects } from "./hooks/useProjects";

export function Popup(): JSX.Element {
  const { locale, setLocale } = useLocale();
  const currentTab = useCurrentTab();
  const { bridgeStatus, refresh } = useBridgeStatus();
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [sendResult, setSendResult] = useState<SendToBridgeResult | undefined>();
  const [destination, setDestination] = useState<"codex_project" | "package">("codex_project");

  const isCurrentTabChatGPT = currentTab.status === "ready" && currentTab.isChatGPTPage;
  const currentTabId = currentTab.status === "ready" ? currentTab.tabId : undefined;
  const { extractionStatus, retry: retryExtraction } = useConversationExtraction({
    tabId: currentTabId,
    isChatGPTPage: isCurrentTabChatGPT
  });
  const { projectsState, selectProject, refreshProjects } = useProjects(bridgeStatus.status === "connected");

  const extractionSummary =
    extractionStatus.status === "success"
      ? extractionStatus.summary
      : {
          messageCount: 0,
          codeBlockCount: 0,
          linkCount: 0,
          assetCount: 0,
          savedAssetCount: 0,
          unresolvedAssetCount: 0,
          failedAssetCount: 0
        };

  const effectiveDestination =
    destination === "codex_project" && projectsState.status === "ready" && projectsState.projects.length === 0 ? "package" : destination;

  const disabledReason = getDisabledReason({
    bridgeStatus: bridgeStatus.status,
    currentTabStatus: currentTab.status,
    isCurrentTabChatGPT,
    extractionStatus: extractionStatus.status,
    extractedMessageCount: extractionSummary.messageCount,
    isSending,
    destination: effectiveDestination,
    projectCount: projectsState.projects.length,
    projectsStatus: projectsState.status
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
      setErrorMessage(`${t(locale, "readFailed")} ${t(locale, "refreshPageAndRetry")}`);
      return;
    }

    setIsSending(true);
    const result = await sendPayloadToBridge({
      ...extractionStatus.payload,
      conversation: {
        ...extractionStatus.payload.conversation,
        exportedAt: new Date().toISOString()
      },
      destination:
        effectiveDestination === "package"
          ? { type: "package" }
          : { type: "codex_project", projectId: projectsState.selectedProjectId }
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
          <p>{t(locale, "fullFlowReady")}</p>
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
              {currentTab.isChatGPTPage ? t(locale, "chatgptConversationDetected") : t(locale, "notChatgptConversationPage")}
            </StatusBadge>
            {currentTab.url && <span className="meta">{t(locale, "currentPage")}: {currentTab.url}</span>}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>{t(locale, "localService")}</h2>
          <button className="text-button" type="button" onClick={() => void refresh()}>
            {t(locale, "refresh")}
          </button>
        </div>
        {bridgeStatus.status === "checking" && <StatusBadge status="neutral">{t(locale, "checkingBridge")}</StatusBadge>}
        {bridgeStatus.status === "connected" && (
          <div className="stack">
            <StatusBadge status="success">{t(locale, "bridgeConnected")}</StatusBadge>
            {bridgeStatus.version && <span className="meta">{t(locale, "serviceVersion")}: {bridgeStatus.version}</span>}
          </div>
        )}
        {bridgeStatus.status === "disconnected" && (
          <div className="stack">
            <StatusBadge status="error">{t(locale, "bridgeDisconnected")}</StatusBadge>
            <span className="meta">{bridgeStatus.message ?? t(locale, "startLocalServiceHint")}</span>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>{t(locale, "conversation")}</h2>
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
          <div>
            <dt>{t(locale, "savedAssetCount")}</dt>
            <dd>{extractionSummary.savedAssetCount}</dd>
          </div>
          <div>
            <dt>{t(locale, "unresolvedAssetCount")}</dt>
            <dd>{extractionSummary.unresolvedAssetCount}</dd>
          </div>
          <div>
            <dt>{t(locale, "failedAssetCount")}</dt>
            <dd>{extractionSummary.failedAssetCount}</dd>
          </div>
        </dl>
        {(extractionSummary.unresolvedAssetCount > 0 || extractionSummary.failedAssetCount > 0) && (
          <p className="meta">{t(locale, "assetWarning")}</p>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>{t(locale, "conversation")}</h2>
          {isCurrentTabChatGPT && (
            <button className="text-button" type="button" onClick={() => void retryExtraction()}>
              {t(locale, "retry")}
            </button>
          )}
        </div>
        {!isCurrentTabChatGPT && <StatusBadge status="neutral">{t(locale, "openChatGPTConversationFirst")}</StatusBadge>}
        {isCurrentTabChatGPT && extractionStatus.status === "idle" && (
          <StatusBadge status="neutral">{t(locale, "readingConversation")}</StatusBadge>
        )}
        {isCurrentTabChatGPT && extractionStatus.status === "extracting" && (
          <StatusBadge status="neutral">{t(locale, "readingConversation")}</StatusBadge>
        )}
        {isCurrentTabChatGPT && extractionStatus.status === "success" && (
          <StatusBadge status="success">{t(locale, "conversationReady")}</StatusBadge>
        )}
        {isCurrentTabChatGPT && extractionStatus.status === "error" && (
          <div className="stack">
            <StatusBadge status="error">{t(locale, "readFailed")}</StatusBadge>
            <span className="meta">{getExtractionErrorMessage(locale, extractionStatus.code, extractionStatus.message)}</span>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>{t(locale, "destination")}</h2>
          {bridgeStatus.status === "connected" && (
            <button className="text-button" type="button" onClick={() => void refreshProjects()}>
              {t(locale, "refresh")}
            </button>
          )}
        </div>
        <div className="segmented">
          <button
            className={effectiveDestination === "codex_project" ? "segmented__button segmented__button--active" : "segmented__button"}
            type="button"
            disabled={projectsState.projects.length === 0}
            onClick={() => setDestination("codex_project")}
          >
            {t(locale, "importToCodexProject")}
          </button>
          <button
            className={effectiveDestination === "package" ? "segmented__button segmented__button--active" : "segmented__button"}
            type="button"
            onClick={() => setDestination("package")}
          >
            {t(locale, "exportAsPackage")}
          </button>
        </div>
        {projectsState.status === "error" && <p className="meta">{t(locale, "loadProjectsFailed")}: {projectsState.message}</p>}
        {projectsState.status === "ready" && projectsState.projects.length === 0 && (
          <p className="meta">{t(locale, "noProjectConfigured")} {t(locale, "projectSetupHint")}</p>
        )}
        {effectiveDestination === "codex_project" && projectsState.projects.length > 0 && (
          <label className="field">
            <span>{t(locale, "project")}</span>
            <select
              value={projectsState.selectedProjectId ?? ""}
              onChange={(event) => void selectProject(event.target.value)}
            >
              {projectsState.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.path}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      {disabledReason && <div className="message message--hint">{t(locale, disabledReason)}</div>}
      <ErrorMessage message={errorMessage} />

      {sendResult?.ok && (
        <div className="message message--success">
          <strong>{sendResult.mode === "package" ? t(locale, "packageExported") : t(locale, "codexImportSuccess")}</strong>
          <span>{t(locale, "conversationSlug")}: {sendResult.conversationSlug}</span>
          {sendResult.outputDir && <span>{t(locale, "outputDirectoryLabel")}: {sendResult.outputDir}</span>}
          {sendResult.packagePath && <span>{t(locale, "packagePath")}: {sendResult.packagePath}</span>}
          <span>{t(locale, "filesWrittenLabel")}: {sendResult.filesWritten.length}</span>
          <span>{t(locale, "assetManifestHint")}</span>
        </div>
      )}

      <SendButton
        disabled={isSendDisabled}
        isSending={isSending}
        onClick={() => void handleSend()}
        label={effectiveDestination === "package" ? t(locale, "exportPackage") : t(locale, "importToCodex")}
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
  destination: "codex_project" | "package";
  projectCount: number;
  projectsStatus: "loading" | "ready" | "error";
};

type DisabledReason =
  | "buttonDisabledBridgeDisconnected"
  | "buttonDisabledChecking"
  | "buttonDisabledNotChatGPT"
  | "buttonDisabledContentScriptUnavailable"
  | "buttonDisabledExtracting"
  | "buttonDisabledExtractionFailed"
  | "buttonDisabledNoMessages"
  | "buttonDisabledNoProject"
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

  if (input.destination === "codex_project" && input.projectCount === 0) {
    return input.projectsStatus === "loading" ? "buttonDisabledChecking" : "buttonDisabledNoProject";
  }

  return undefined;
}

function getExtractionErrorMessage(locale: Parameters<typeof t>[0], code: string | undefined, message: string): string {
  if (code === "CONTENT_SCRIPT_UNAVAILABLE") {
    return t(locale, "refreshPageAndRetry");
  }

  if (code === "CONTENT_SCRIPT_CONNECTION_FAILED" || code === "NO_TAB_ID") {
    return t(locale, "refreshPageAndRetry");
  }

  if (code === "NO_MESSAGES_DETECTED") {
    return t(locale, "noExtractedMessages");
  }

  return message || t(locale, "conversationExtractionFailed");
}
