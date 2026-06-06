import type { AssetReference } from "@chatgpt-codex-bridge/shared";

const DOWNLOADABLE_EXTENSIONS = /\.(png|jpe?g|webp|gif|svg|html?|md|json|csv|zip)(\?|#|$)/i;

export function extractAssets(messageElement: Element, messageIndex: number): AssetReference[] {
  const seenSourceUrls = new Set<string>();
  const assets: AssetReference[] = [];

  for (const image of Array.from(messageElement.querySelectorAll<HTMLImageElement>("img[src]"))) {
    addAsset(assets, seenSourceUrls, {
      id: `asset_${messageIndex}_${assets.length + 1}`,
      type: "image",
      status: "unresolved",
      sourceUrl: image.src,
      sourceMessageIndex: messageIndex,
      failureReason: "Asset downloading is not implemented in Milestone 3"
    });
  }

  for (const anchor of Array.from(messageElement.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
    const sourceUrl = anchor.href;
    if (!sourceUrl.startsWith("blob:") && !DOWNLOADABLE_EXTENSIONS.test(sourceUrl)) {
      continue;
    }

    addAsset(assets, seenSourceUrls, {
      id: `asset_${messageIndex}_${assets.length + 1}`,
      type: inferAssetType(sourceUrl),
      status: "unresolved",
      sourceUrl,
      sourceMessageIndex: messageIndex,
      failureReason: "Asset downloading is not implemented in Milestone 3"
    });
  }

  return assets;
}

function addAsset(assets: AssetReference[], seenSourceUrls: Set<string>, asset: AssetReference): void {
  if (!asset.sourceUrl || seenSourceUrls.has(asset.sourceUrl)) {
    return;
  }

  seenSourceUrls.add(asset.sourceUrl);
  assets.push(asset);
}

function inferAssetType(sourceUrl: string): AssetReference["type"] {
  if (/\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(sourceUrl) || sourceUrl.startsWith("blob:")) {
    return "image";
  }

  if (/\.html?(\?|#|$)/i.test(sourceUrl)) {
    return "html";
  }

  if (/\.md(\?|#|$)/i.test(sourceUrl)) {
    return "markdown";
  }

  return "file";
}
