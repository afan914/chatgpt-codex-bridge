import type { ImportChatGPTContextPayload } from "@chatgpt-codex-bridge/shared";

type BuildMockPayloadInput = {
  title?: string;
  url?: string;
};

export function buildMockPayload(input: BuildMockPayloadInput): ImportChatGPTContextPayload {
  const exportedAt = new Date().toISOString();

  return {
    conversation: {
      title: input.title || "Mock ChatGPT Conversation",
      url: input.url || "https://chatgpt.com/c/mock-extension-payload",
      exportedAt
    },
    messages: [
      {
        index: 1,
        role: "user",
        content: "I want to verify that the browser extension popup can send context to Codex through the local Bridge.",
        links: [],
        codeBlocks: []
      },
      {
        index: 2,
        role: "assistant",
        content: "This mock payload proves the extension popup can reach the Bridge and the Bridge can write context files into the configured Codex project directory.",
        links: [
          {
            text: "Project repository",
            url: "https://github.com/afan914/chatgpt-codex-bridge"
          }
        ],
        codeBlocks: [
          {
            language: "ts",
            content: "export const extensionPopupSmokeTest = 'passed';\nconsole.log(extensionPopupSmokeTest);"
          },
          {
            language: "json",
            content: JSON.stringify({ source: "extension-popup", exportedAt }, null, 2)
          }
        ]
      }
    ],
    assets: [
      {
        id: "asset_mock_001",
        type: "image",
        status: "unresolved",
        sourceUrl: "mock://extension-popup/unresolved-image",
        sourceMessageIndex: 2,
        failureReason: "Milestone 2 sends a mock payload and does not extract real assets yet."
      }
    ]
  };
}
