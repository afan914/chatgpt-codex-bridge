import { ASSET_FAILURE_REASONS, type AssetReference, type ExtractedCodeBlock } from "@chatgpt-codex-bridge/shared";

const DOWNLOADABLE_EXTENSIONS = /\.(png|jpe?g|webp|gif|svg|html?|md|markdown|json|csv|txt|zip|pdf)(\?|#|$)/i;

export function extractAssets(messageElement: Element, messageIndex: number, codeBlocks: ExtractedCodeBlock[]): AssetReference[] {
  const seen = new Set<string>();
  const assets: AssetReference[] = [];

  for (const image of Array.from(messageElement.querySelectorAll<HTMLImageElement>("img[src]"))) {
    addAsset(assets, seen, {
      id: "",
      type: "image",
      status: image.src.startsWith("data:") ? "saved" : "unresolved",
      sourceUrl: image.src,
      sourceLabel: image.alt || image.getAttribute("aria-label") || "image",
      sourceMessageIndex: messageIndex,
      filename: buildAssetFilename(messageIndex, assets.length + 1, inferExtension(image.src, "png")),
      failureReason: initialFailureReason(image.src)
    });
  }

  for (const source of Array.from(messageElement.querySelectorAll<HTMLSourceElement>("source[srcset]"))) {
    for (const sourceUrl of parseSrcSet(source.srcset)) {
      addAsset(assets, seen, {
        id: "",
        type: "image",
        status: sourceUrl.startsWith("data:") ? "saved" : "unresolved",
        sourceUrl,
        sourceLabel: "responsive image source",
        sourceMessageIndex: messageIndex,
        filename: buildAssetFilename(messageIndex, assets.length + 1, inferExtension(sourceUrl, "png")),
        failureReason: initialFailureReason(sourceUrl)
      });
    }
  }

  for (const anchor of Array.from(messageElement.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
    const sourceUrl = anchor.href;
    if (!sourceUrl.startsWith("blob:") && !DOWNLOADABLE_EXTENSIONS.test(sourceUrl)) {
      continue;
    }

    addAsset(assets, seen, {
      id: "",
      type: inferAssetType(sourceUrl),
      status: "unresolved",
      sourceUrl,
      sourceLabel: anchor.textContent?.trim() || anchor.getAttribute("download") || "downloadable link",
      sourceMessageIndex: messageIndex,
      filename: buildAssetFilename(messageIndex, assets.length + 1, inferExtension(sourceUrl, "txt")),
      failureReason: initialFailureReason(sourceUrl)
    });
  }

  for (let blockIndex = 0; blockIndex < codeBlocks.length; blockIndex += 1) {
    const block = codeBlocks[blockIndex];
    const artifactType = languageToArtifactType(block.language);
    if (!artifactType) {
      continue;
    }

    const extension = artifactType === "html" ? "html" : "md";
    addAsset(assets, seen, {
      id: "",
      type: artifactType,
      status: "saved",
      sourceLabel: `${block.language ?? artifactType} code block`,
      sourceMessageIndex: messageIndex,
      filename: `message-${String(messageIndex).padStart(3, "0")}-artifact-${String(blockIndex + 1).padStart(3, "0")}.${extension}`,
      mimeType: artifactType === "html" ? "text/html" : "text/markdown",
      content: block.content
    });
  }

  return assets;
}

function addAsset(assets: AssetReference[], seen: Set<string>, asset: AssetReference): void {
  const fingerprint = asset.sourceUrl ?? `${asset.type}:${asset.sourceMessageIndex}:${asset.filename}:${asset.content?.length ?? 0}`;
  if (seen.has(fingerprint)) {
    return;
  }

  seen.add(fingerprint);
  assets.push(asset);
}

function parseSrcSet(srcset: string): string[] {
  return srcset
    .split(",")
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter((candidate) => candidate.length > 0);
}

function inferAssetType(sourceUrl: string): AssetReference["type"] {
  if (/\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(sourceUrl) || sourceUrl.startsWith("blob:")) {
    return "image";
  }

  if (/\.html?(\?|#|$)/i.test(sourceUrl)) {
    return "html";
  }

  if (/\.(md|markdown)(\?|#|$)/i.test(sourceUrl)) {
    return "markdown";
  }

  return "file";
}

function inferExtension(sourceUrl: string, fallback: string): string {
  const match = /\.([a-z0-9]+)(\?|#|$)/i.exec(sourceUrl);
  if (match) {
    return match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  }

  const dataUrlMatch = /^data:([^;,]+)/i.exec(sourceUrl);
  if (dataUrlMatch) {
    return mimeToExtension(dataUrlMatch[1].toLowerCase()) ?? fallback;
  }

  return fallback;
}

function mimeToExtension(mimeType: string): string | undefined {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }
  if (mimeType === "image/png") {
    return "png";
  }
  if (mimeType === "image/webp") {
    return "webp";
  }
  if (mimeType === "image/gif") {
    return "gif";
  }
  if (mimeType === "image/svg+xml") {
    return "svg";
  }
  return undefined;
}

function buildAssetFilename(messageIndex: number, assetIndex: number, extension: string): string {
  return `message-${String(messageIndex).padStart(3, "0")}-asset-${String(assetIndex).padStart(3, "0")}.${extension}`;
}

function languageToArtifactType(language: string | undefined): "html" | "markdown" | undefined {
  const normalized = language?.toLowerCase();
  if (normalized === "html" || normalized === "htm") {
    return "html";
  }
  if (normalized === "md" || normalized === "markdown") {
    return "markdown";
  }
  return undefined;
}

function initialFailureReason(sourceUrl: string): string | undefined {
  if (sourceUrl.startsWith("data:")) {
    return undefined;
  }
  if (sourceUrl.startsWith("blob:")) {
    return ASSET_FAILURE_REASONS.BLOB_URL_BROWSER_ONLY;
  }
  return ASSET_FAILURE_REASONS.CROSS_ORIGIN_OR_PROTECTED;
}
