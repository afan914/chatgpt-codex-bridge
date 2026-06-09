import os from "node:os";
import path from "node:path";
import { readdir, stat } from "node:fs/promises";
import type { BridgeProject } from "@chatgpt-codex-bridge/shared";

const PROJECT_MARKERS = [
  ".git",
  ".codex",
  ".codex-context",
  "package.json",
  "pnpm-workspace.yaml",
  "pyproject.toml",
  "Cargo.toml",
  "go.mod"
];

const IGNORED_DIRECTORY_NAMES = new Set([
  ".cache",
  ".git",
  ".npm",
  ".pnpm-store",
  ".Trash",
  "Library",
  "Applications",
  "node_modules"
]);

export async function discoverBridgeProjects(configuredProjects: BridgeProject[]): Promise<BridgeProject[]> {
  const configuredPaths = new Set(configuredProjects.map((project) => normalizePath(project.path)));
  const usedIds = new Set(configuredProjects.map((project) => project.id));
  const discovered: BridgeProject[] = [];

  for (const candidatePath of await discoverCandidatePaths()) {
    const normalizedPath = normalizePath(candidatePath);
    if (configuredPaths.has(normalizedPath) || discovered.some((project) => normalizePath(project.path) === normalizedPath)) {
      continue;
    }

    if (!(await isProjectDirectory(candidatePath))) {
      continue;
    }

    const name = path.basename(candidatePath);
    const id = makeUniqueProjectId(`auto-${name}`, usedIds);
    usedIds.add(id);
    discovered.push({
      id,
      name,
      path: candidatePath
    });
  }

  return discovered.sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));
}

async function discoverCandidatePaths(): Promise<string[]> {
  const home = os.homedir();
  const roots = [
    path.join(home, "chatgpt-codex-bridge"),
    path.join(home, "Documents"),
    path.join(home, "Desktop"),
    path.join(home, "Downloads")
  ];
  const candidates = new Set<string>();

  for (const root of roots) {
    if (!(await isDirectory(root))) {
      continue;
    }
    candidates.add(root);
    for (const candidate of await listChildDirectories(root, 2)) {
      candidates.add(candidate);
    }
  }

  return [...candidates];
}

async function listChildDirectories(root: string, maxDepth: number): Promise<string[]> {
  if (maxDepth <= 0) {
    return [];
  }

  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const directories: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || shouldIgnoreDirectory(entry.name)) {
      continue;
    }

    const directoryPath = path.join(root, entry.name);
    directories.push(directoryPath);
    directories.push(...await listChildDirectories(directoryPath, maxDepth - 1));
  }

  return directories;
}

async function isProjectDirectory(directoryPath: string): Promise<boolean> {
  for (const marker of PROJECT_MARKERS) {
    if (await pathExists(path.join(directoryPath, marker))) {
      return true;
    }
  }
  return false;
}

async function isDirectory(directoryPath: string): Promise<boolean> {
  try {
    return (await stat(directoryPath)).isDirectory();
  } catch {
    return false;
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function shouldIgnoreDirectory(name: string): boolean {
  return name.startsWith(".") || IGNORED_DIRECTORY_NAMES.has(name);
}

function makeUniqueProjectId(input: string, usedIds: Set<string>): string {
  const baseId = sanitizeProjectId(input) || "auto-project";
  let id = baseId;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function sanitizeProjectId(input: string): string {
  return input
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/-+/g, "-")
    .replace(/-$/, "");
}

function normalizePath(projectPath: string): string {
  return path.resolve(projectPath);
}
