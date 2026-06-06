import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { writeBinaryFile } from "../utils/fileSystem.js";

interface ZipEntry {
  archivePath: string;
  data: Buffer;
}

const crcTable = buildCrcTable();

export async function createZipFromDirectory(sourceDir: string, zipPath: string, rootFolderName: string): Promise<void> {
  const entries = await collectEntries(sourceDir, rootFolderName);
  const chunks: Buffer[] = [];
  const centralDirectory: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const localHeader = createLocalHeader(entry);
    chunks.push(localHeader, entry.data);
    centralDirectory.push(createCentralDirectoryHeader(entry, offset));
    offset += localHeader.length + entry.data.length;
  }

  const centralDirectoryOffset = offset;
  chunks.push(...centralDirectory);
  const centralDirectorySize = centralDirectory.reduce((size, chunk) => size + chunk.length, 0);
  chunks.push(createEndOfCentralDirectory(entries.length, centralDirectorySize, centralDirectoryOffset));

  await writeBinaryFile(zipPath, Buffer.concat(chunks));
}

async function collectEntries(directory: string, rootFolderName: string, relativeDir = ""): Promise<ZipEntry[]> {
  const entries: ZipEntry[] = [];
  const names = await readdir(path.join(directory, relativeDir));
  names.sort();

  for (const name of names) {
    const relativePath = path.join(relativeDir, name);
    const absolutePath = path.join(directory, relativePath);
    const stats = await stat(absolutePath);
    if (stats.isDirectory()) {
      entries.push(...(await collectEntries(directory, rootFolderName, relativePath)));
      continue;
    }

    if (!stats.isFile()) {
      continue;
    }

    entries.push({
      archivePath: path.posix.join(rootFolderName, relativePath.split(path.sep).join(path.posix.sep)),
      data: await readFile(absolutePath)
    });
  }

  return entries;
}

function createLocalHeader(entry: ZipEntry): Buffer {
  const filename = Buffer.from(entry.archivePath, "utf8");
  const crc = crc32(entry.data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(entry.data.length, 18);
  header.writeUInt32LE(entry.data.length, 22);
  header.writeUInt16LE(filename.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, filename]);
}

function createCentralDirectoryHeader(entry: ZipEntry, offset: number): Buffer {
  const filename = Buffer.from(entry.archivePath, "utf8");
  const crc = crc32(entry.data);
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(entry.data.length, 20);
  header.writeUInt32LE(entry.data.length, 24);
  header.writeUInt16LE(filename.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);
  return Buffer.concat([header, filename]);
}

function createEndOfCentralDirectory(entryCount: number, centralDirectorySize: number, centralDirectoryOffset: number): Buffer {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(entryCount, 8);
  header.writeUInt16LE(entryCount, 10);
  header.writeUInt32LE(centralDirectorySize, 12);
  header.writeUInt32LE(centralDirectoryOffset, 16);
  header.writeUInt16LE(0, 20);
  return header;
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildCrcTable(): number[] {
  const table: number[] = [];
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}
