import path from "node:path";
import {
  generateAssetsManifestJson,
  generateManifestJson,
  type AssetReference,
  type ImportChatGPTContextPayload,
  type ImportDestination
} from "@chatgpt-codex-bridge/shared";
import { writeJsonFile } from "../utils/fileSystem.js";

export async function writeManifestFiles(
  outputDir: string,
  payload: ImportChatGPTContextPayload,
  assets: AssetReference[],
  destination: ImportDestination
): Promise<string[]> {
  await writeJsonFile(path.join(outputDir, "manifest.json"), generateManifestJson(payload, assets, destination));
  await writeJsonFile(path.join(outputDir, "assets_manifest.json"), generateAssetsManifestJson(assets));

  return ["manifest.json", "assets_manifest.json"];
}
