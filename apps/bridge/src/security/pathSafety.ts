import path from "node:path";

export function assertPathInside(parentDirectory: string, targetPath: string): void {
  const parent = path.resolve(parentDirectory);
  const target = path.resolve(targetPath);
  const relative = path.relative(parent, target);

  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    return;
  }

  throw new Error("PATH_TRAVERSAL_DETECTED");
}

export function resolveInside(parentDirectory: string, ...segments: string[]): string {
  const target = path.resolve(parentDirectory, ...segments);
  assertPathInside(parentDirectory, target);
  return target;
}
