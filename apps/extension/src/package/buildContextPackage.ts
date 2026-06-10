import JSZip from "jszip";
import {
  ASSET_FAILURE_REASONS,
  createConversationSlug,
  generateAssetsManifestJson,
  generateCodexTaskMarkdown,
  generateExportReadmeMarkdown,
  generateFullConversationMarkdown,
  generateManifestJson,
  sanitizeFilename,
  type AssetReference,
  type ExtractedCodeBlock,
  type ImportChatGPTContextPayload
} from "@chatgpt-codex-bridge/shared";

const MAX_DATA_URL_IMAGE_BYTES = 1024 * 1024;

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

export async function buildContextPackageZip(payload: ImportChatGPTContextPayload): Promise<{
  blob: Blob;
  filename: string;
  manifest: unknown;
}> {
  const conversationSlug = createConversationSlug(payload.conversation.title, payload.conversation.url);
  const packageFolderName = `chatgpt-context-package-${conversationSlug}`;
  const filename = `${packageFolderName}.zip`;
  const zip = new JSZip();
  const root = zip.folder(packageFolderName);
  if (!root) {
    throw new Error("Could not create package folder");
  }

  root.file("CODEX_TASK.md", generateCodexTaskMarkdown(payload.conversation));
  root.file("README.md", generateExportReadmeMarkdown());
  root.file("full_conversation.md", generateFullConversationMarkdown(payload.messages));
  ensureAssetFolders(root);

  const assets = cloneAssets(payload.assets ?? []);
  writeSnippetFiles(root, payload);
  await writeBrowserAssetFiles(root, assets);

  const destination = { type: "package" as const, exportedBy: "extension" as const };
  const manifest = generateManifestJson(payload, assets, destination);
  root.file("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
  root.file("assets_manifest.json", `${JSON.stringify(generateAssetsManifestJson(assets), null, 2)}\n`);

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return { blob, filename, manifest };
}

function ensureAssetFolders(root: JSZip): void {
  root.folder("assets/snippets");
  root.folder("assets/html");
  root.folder("assets/markdown");
  root.folder("assets/images");
  root.folder("assets/files");
}

function writeSnippetFiles(root: JSZip, payload: ImportChatGPTContextPayload): void {
  for (const message of payload.messages) {
    const codeBlocks = message.codeBlocks ?? [];
    for (let snippetIndex = 0; snippetIndex < codeBlocks.length; snippetIndex += 1) {
      const block = codeBlocks[snippetIndex];
      root.file(`assets/snippets/${buildSnippetFilename(message.index, snippetIndex + 1, block)}`, block.content);
    }
  }
}

async function writeBrowserAssetFiles(root: JSZip, assets: AssetReference[]): Promise<void> {
  for (const asset of assets) {
    try {
      if (asset.sourceUrl?.startsWith("blob:")) {
        markUnresolved(asset, ASSET_FAILURE_REASONS.BLOB_URL_BROWSER_ONLY);
        continue;
      }

      if (asset.status === "failed") {
        continue;
      }

      if (asset.content !== undefined && asset.type !== "image") {
        const relativePath = `assets/${assetDirectory(asset)}/${sanitizeFilename(asset.filename ?? defaultAssetFilename(asset))}`;
        root.file(relativePath, asset.content);
        markSaved(asset, relativePath, new TextEncoder().encode(asset.content).byteLength);
        continue;
      }

      if (asset.type === "image" && asset.sourceUrl?.startsWith("data:")) {
        const decoded = decodeImageDataUrl(asset.sourceUrl);
        if (!decoded.ok) {
          markUnresolved(asset, decoded.reason);
          continue;
        }
        if (decoded.bytes.byteLength > MAX_DATA_URL_IMAGE_BYTES) {
          markUnresolved(asset, ASSET_FAILURE_REASONS.DATA_URL_TOO_LARGE);
          continue;
        }
        const basePath = `assets/images/${sanitizeFilename(asset.filename ?? defaultAssetFilename(asset))}`;
        const relativePath = ensureExtension(basePath, imageDataUrlExtensions[decoded.mimeType] ?? "bin");
        root.file(relativePath, decoded.bytes);
        asset.mimeType = decoded.mimeType;
        markSaved(asset, relativePath, decoded.bytes.byteLength);
        continue;
      }

      markUnresolved(asset, ASSET_FAILURE_REASONS.CROSS_ORIGIN_OR_PROTECTED);
    } catch (error) {
      asset.status = "failed";
      asset.filename = asset.filename ?? null;
      asset.failureReason = error instanceof Error ? error.message : ASSET_FAILURE_REASONS.WRITE_FAILED;
      asset.content = undefined;
    }
  }
}

function decodeImageDataUrl(sourceUrl: string): { ok: true; mimeType: string; bytes: Uint8Array } | { ok: false; reason: string } {
  const match = /^data:([^;,]+);base64,(.*)$/i.exec(sourceUrl);
  if (!match) {
    return { ok: false, reason: ASSET_FAILURE_REASONS.UNSUPPORTED_DATA_URL };
  }

  const mimeType = match[1].toLowerCase();
  if (!(mimeType in imageDataUrlExtensions)) {
    return { ok: false, reason: ASSET_FAILURE_REASONS.UNSUPPORTED_DATA_URL };
  }

  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return { ok: true, mimeType, bytes };
  } catch {
    return { ok: false, reason: ASSET_FAILURE_REASONS.DATA_URL_DECODE_FAILED };
  }
}

function markSaved(asset: AssetReference, filename: string, sizeBytes: number): void {
  asset.status = "saved";
  asset.filename = filename;
  asset.failureReason = undefined;
  asset.sizeBytes = sizeBytes;
  asset.content = undefined;
}

function markUnresolved(asset: AssetReference, reason: string): void {
  asset.status = "unresolved";
  asset.filename = asset.filename ?? null;
  asset.failureReason = reason;
  asset.content = undefined;
}

function cloneAssets(assets: AssetReference[]): AssetReference[] {
  return assets.map((asset) => ({ ...asset }));
}

function assetDirectory(asset: AssetReference): string {
  if (asset.type === "html") {
    return "html";
  }
  if (asset.type === "markdown") {
    return "markdown";
  }
  if (asset.type === "image") {
    return "images";
  }
  return "files";
}

function defaultAssetFilename(asset: AssetReference): string {
  const messagePart = String(asset.sourceMessageIndex ?? 0).padStart(3, "0");
  const idPart = sanitizeFilename(asset.id || "asset");
  return `message-${messagePart}-${idPart}.${defaultExtension(asset)}`;
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
  return /\.[A-Za-z0-9]+$/.test(relativePath) ? relativePath : `${relativePath}.${extension}`;
}

function buildSnippetFilename(messageIndex: number, snippetIndex: number, block: ExtractedCodeBlock): string {
  const messagePart = String(messageIndex).padStart(3, "0");
  const snippetPart = String(snippetIndex).padStart(3, "0");
  return `message-${messagePart}-snippet-${snippetPart}.${languageToExtension(block.language)}`;
}

function languageToExtension(language: string | undefined): string {
  if (!language) {
    return "txt";
  }

  return extensionByLanguage[language.toLowerCase()] ?? "txt";
}
