import path from "node:path";
import {
  ASSET_FAILURE_REASONS,
  sanitizeFilename,
  type AssetReference,
  type ChatGPTMessage,
  type ExtractedCodeBlock,
  type ImportChatGPTContextPayload
} from "@chatgpt-codex-bridge/shared";
import { resolveInside } from "../security/pathSafety.js";
import { ensureDirectory, writeBinaryFile, writeTextFile } from "../utils/fileSystem.js";

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

const imageDataUrlExtensions: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg"
};

export interface AssetWriteResult {
  filesWritten: string[];
  assets: AssetReference[];
}

export async function writeAssetFiles(outputDir: string, payload: ImportChatGPTContextPayload): Promise<AssetWriteResult> {
  await ensureAssetDirectories(outputDir);

  const filesWritten: string[] = [];
  const assets = cloneAssets(payload.assets ?? []);
  filesWritten.push(...(await writeSnippetFiles(outputDir, payload.messages)));
  filesWritten.push(...(await writeContentAssets(outputDir, assets)));

  return {
    filesWritten,
    assets
  };
}

async function ensureAssetDirectories(outputDir: string): Promise<void> {
  await ensureDirectory(resolveInside(outputDir, "assets", "snippets"));
  await ensureDirectory(resolveInside(outputDir, "assets", "images"));
  await ensureDirectory(resolveInside(outputDir, "assets", "html"));
  await ensureDirectory(resolveInside(outputDir, "assets", "markdown"));
  await ensureDirectory(resolveInside(outputDir, "assets", "files"));
}

async function writeSnippetFiles(outputDir: string, messages: ChatGPTMessage[]): Promise<string[]> {
  const filesWritten: string[] = [];
  for (const message of messages) {
    const codeBlocks = message.codeBlocks ?? [];
    for (let snippetIndex = 0; snippetIndex < codeBlocks.length; snippetIndex += 1) {
      const block = codeBlocks[snippetIndex];
      const relativePath = path.join("assets", "snippets", buildSnippetFilename(message.index, snippetIndex + 1, block));
      await writeTextFile(resolveInside(outputDir, relativePath), block.content);
      filesWritten.push(relativePath);
    }
  }

  return filesWritten;
}

async function writeContentAssets(outputDir: string, assets: AssetReference[]): Promise<string[]> {
  const filesWritten: string[] = [];
  for (const asset of assets) {
    try {
      const relativePath = await resolveAssetOutputPath(outputDir, asset);
      if (!relativePath) {
        continue;
      }

      if (asset.content !== undefined && asset.type !== "image") {
        await writeTextFile(resolveInside(outputDir, relativePath), asset.content);
        markSaved(asset, relativePath, Buffer.byteLength(asset.content, "utf8"));
        filesWritten.push(relativePath);
        continue;
      }

      if (asset.type === "image" && asset.sourceUrl?.startsWith("data:")) {
        const decoded = decodeImageDataUrl(asset.sourceUrl);
        if (!decoded.ok) {
          markFailed(asset, decoded.reason);
          continue;
        }
        const finalPath = ensureExtension(relativePath, imageDataUrlExtensions[decoded.mimeType] ?? "bin");
        await writeBinaryFile(resolveInside(outputDir, finalPath), decoded.data);
        asset.mimeType = decoded.mimeType;
        markSaved(asset, finalPath, decoded.data.length);
        filesWritten.push(finalPath);
        continue;
      }

      normalizeUnresolvedAsset(asset);
    } catch (error) {
      markFailed(asset, error instanceof Error ? error.message : ASSET_FAILURE_REASONS.WRITE_FAILED);
    }
  }

  return filesWritten;
}

async function resolveAssetOutputPath(outputDir: string, asset: AssetReference): Promise<string | undefined> {
  if (asset.sourceUrl?.startsWith("blob:")) {
    asset.status = "unresolved";
    asset.failureReason = ASSET_FAILURE_REASONS.BLOB_URL_BROWSER_ONLY;
    asset.filename = asset.filename ?? null;
    return undefined;
  }

  if (asset.status === "failed") {
    return undefined;
  }

  if (asset.content === undefined && !asset.sourceUrl?.startsWith("data:")) {
    normalizeUnresolvedAsset(asset);
    return undefined;
  }

  const directory = assetDirectory(asset);
  const filename = sanitizeFilename(asset.filename ?? defaultAssetFilename(asset));
  const relativePath = path.join("assets", directory, filename);
  resolveInside(outputDir, relativePath);
  return relativePath;
}

function normalizeUnresolvedAsset(asset: AssetReference): void {
  if (asset.status === "saved") {
    asset.status = "unresolved";
  }
  asset.filename = asset.filename ?? null;
  asset.failureReason = asset.failureReason ?? ASSET_FAILURE_REASONS.CROSS_ORIGIN_OR_PROTECTED;
}

function markSaved(asset: AssetReference, filename: string, sizeBytes: number): void {
  asset.status = "saved";
  asset.filename = filename;
  asset.failureReason = undefined;
  asset.sizeBytes = sizeBytes;
  asset.content = undefined;
}

function markFailed(asset: AssetReference, reason: string): void {
  asset.status = "failed";
  asset.failureReason = reason;
  asset.filename = asset.filename ?? null;
  asset.content = undefined;
}

function cloneAssets(assets: AssetReference[]): AssetReference[] {
  return assets.map((asset) => ({ ...asset }));
}

function assetDirectory(asset: AssetReference): string {
  if (asset.type === "image") {
    return "images";
  }
  if (asset.type === "html") {
    return "html";
  }
  if (asset.type === "markdown") {
    return "markdown";
  }
  return "files";
}

function defaultAssetFilename(asset: AssetReference): string {
  const messagePart = String(asset.sourceMessageIndex ?? 0).padStart(3, "0");
  const idPart = sanitizeFilename(asset.id || "asset");
  const extension = defaultExtension(asset);
  return `message-${messagePart}-${idPart}.${extension}`;
}

function defaultExtension(asset: AssetReference): string {
  if (asset.type === "html") {
    return "html";
  }
  if (asset.type === "markdown") {
    return "md";
  }
  if (asset.type === "image") {
    return "png";
  }
  return "txt";
}

function ensureExtension(relativePath: string, extension: string): string {
  if (path.extname(relativePath)) {
    return relativePath;
  }
  return `${relativePath}.${extension}`;
}

function decodeImageDataUrl(sourceUrl: string): { ok: true; mimeType: string; data: Buffer } | { ok: false; reason: string } {
  const match = /^data:([^;,]+);base64,(.*)$/i.exec(sourceUrl);
  if (!match) {
    return { ok: false, reason: ASSET_FAILURE_REASONS.UNSUPPORTED_DATA_URL };
  }

  const mimeType = match[1].toLowerCase();
  if (!(mimeType in imageDataUrlExtensions)) {
    return { ok: false, reason: ASSET_FAILURE_REASONS.UNSUPPORTED_DATA_URL };
  }

  try {
    return { ok: true, mimeType, data: Buffer.from(match[2], "base64") };
  } catch {
    return { ok: false, reason: ASSET_FAILURE_REASONS.DATA_URL_DECODE_FAILED };
  }
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
