import path from "node:path";
import type { ChatGPTMessage, ExtractedCodeBlock } from "@chatgpt-codex-bridge/shared";
import { ensureDirectory, writeTextFile } from "../utils/fileSystem.js";

const extensionByLanguage: Record<string, string> = {
  ts: "ts",
  typescript: "ts",
  js: "js",
  javascript: "js",
  json: "json",
  html: "html",
  md: "md",
  markdown: "md",
  css: "css",
  text: "txt",
  txt: "txt"
};

export async function writeAssetFiles(outputDir: string, messages: ChatGPTMessage[]): Promise<string[]> {
  const snippetsDir = path.join(outputDir, "assets", "snippets");
  await ensureDirectory(snippetsDir);
  await ensureDirectory(path.join(outputDir, "assets", "images"));
  await ensureDirectory(path.join(outputDir, "assets", "html"));
  await ensureDirectory(path.join(outputDir, "assets", "markdown"));
  await ensureDirectory(path.join(outputDir, "assets", "files"));

  const filesWritten: string[] = [];
  for (const message of messages) {
    const codeBlocks = message.codeBlocks ?? [];
    for (let snippetIndex = 0; snippetIndex < codeBlocks.length; snippetIndex += 1) {
      const block = codeBlocks[snippetIndex];
      const filename = buildSnippetFilename(message.index, snippetIndex + 1, block);
      await writeTextFile(path.join(snippetsDir, filename), block.content);
      filesWritten.push(path.join("assets", "snippets", filename));
    }
  }

  return filesWritten;
}

function buildSnippetFilename(messageIndex: number, snippetIndex: number, block: ExtractedCodeBlock): string {
  const messagePart = String(messageIndex).padStart(3, "0");
  const snippetPart = String(snippetIndex).padStart(3, "0");
  const extension = languageToExtension(block.language);
  return `message-${messagePart}-snippet-${snippetPart}.${extension}`;
}

function languageToExtension(language: string | undefined): string {
  if (!language) {
    return "txt";
  }

  return extensionByLanguage[language.toLowerCase()] ?? "txt";
}
