"use server";

import { exec } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import os from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  permissions: string;
  modified: Date;
  created: Date;
}

export async function getFiles(dirPath: string, filter: (file: FileInfo) => boolean): Promise<FileInfo[]> {
  console.log("getting files from:", dirPath);
  try {
    // Security: Ensure the path is absolute and doesn't contain '..'
    const safePath = dirPath.startsWith("/") ? dirPath : "/";

    const entries = await readdir(safePath, { withFileTypes: true });

    const filesPromises = entries.map(async (entry) => {
      try {
        const fullPath = join(safePath, entry.name);
        const stats = await stat(fullPath);

        // Convert Unix permissions to octal string (e.g., "755")
        const permissions = (stats.mode & 0o777).toString(8);

        return {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size: stats.size,
          permissions,
          modified: stats.mtime,
          created: stats.birthtime,
        };
      } catch (error) {
        // Skip files that can't be accessed (permission denied, symlinks to non-existent files, etc.)
        console.warn(`Skipping file ${entry.name}:`, error);
        return null;
      }
    });

    const filesResults = await Promise.all(filesPromises);

    // Filter out null values (files that couldn't be accessed)
    const files = filesResults.filter((file): file is FileInfo => file !== null && filter(file));

    // Sort directories first, then by name
    return files.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Error reading directory:", error);
    throw new Error(`Failed to read directory: ${dirPath}`);
  }
}

export interface DriveInfo {
  filesystem: string;
  mountPoint: string;
  totalSpace: number;
  usedSpace: number;
  freeSpace: number;
  usePercent: number;
}

export interface SystemInfo {
  platform: string;
  osType: string;
  osRelease: string;
  hostname: string;
  drives: DriveInfo[];
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const platform = os.platform();
  const osType = os.type();
  const osRelease = os.release();
  const hostname = os.hostname();

  const drives: DriveInfo[] = [];

  try {
    if (platform === "darwin" || platform === "linux") {
      // Use df command on macOS and Linux with -P for POSIX format (prevents line wrapping)
      const { stdout } = await execAsync("df -Pk");
      const lines = stdout.trim().split("\n");

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse df output with -P flag: Filesystem 1K-blocks Used Available Capacity Mounted on
        // The -P flag ensures each filesystem is on one line
        const parts = line.split(/\s+/);

        if (parts.length < 6) continue;

        const filesystem = parts[0];
        const totalBlocks = Number.parseInt(parts[1], 10);
        const usedBlocks = Number.parseInt(parts[2], 10);
        const availableBlocks = Number.parseInt(parts[3], 10);
        const usePercentStr = parts[4];
        // Mount point might have spaces, so join remaining parts
        const mountPoint = parts.slice(5).join(" ");

        // Skip special filesystems on Linux
        if (
          platform === "linux" &&
          (filesystem.startsWith("tmpfs") ||
            filesystem.startsWith("devtmpfs") ||
            filesystem.startsWith("udev") ||
            filesystem === "none" ||
            mountPoint.startsWith("/sys") ||
            mountPoint.startsWith("/proc") ||
            mountPoint.startsWith("/dev") ||
            mountPoint.startsWith("/run"))
        ) {
          continue;
        }

        // On macOS, only show real physical drives
        // Skip all virtual/special filesystems and only show /dev/disk* mounted at / or /Volumes/*
        if (platform === "darwin") {
          // Skip special filesystems
          if (
            filesystem.startsWith("devfs") ||
            filesystem.startsWith("map") ||
            filesystem.startsWith("localhost:") ||
            filesystem.startsWith("com.apple.") ||
            filesystem === "none"
          ) {
            continue;
          }

          // Skip system volumes
          if (
            mountPoint.startsWith("/System/Volumes") ||
            mountPoint.startsWith("/private/var/vm") ||
            mountPoint === "/System" ||
            mountPoint === "/Library" ||
            mountPoint === "/home" ||
            mountPoint === "/net" ||
            mountPoint === "/cores"
          ) {
            continue;
          }

          // Only allow /dev/disk* filesystems
          if (!filesystem.startsWith("/dev/disk")) {
            continue;
          }

          // Only allow root (/) or /Volumes/* mount points
          if (mountPoint !== "/" && !mountPoint.startsWith("/Volumes/")) {
            continue;
          }
        }

        // Validate parsed numbers
        if (Number.isNaN(totalBlocks) || Number.isNaN(usedBlocks) || Number.isNaN(availableBlocks)) {
          console.warn(`Skipping drive with invalid numbers: ${line}`);
          continue;
        }

        const usePercent = Number.parseInt(usePercentStr.replace("%", ""), 10);

        // Convert from 1K blocks to bytes
        drives.push({
          filesystem,
          mountPoint,
          totalSpace: totalBlocks * 1024,
          usedSpace: usedBlocks * 1024,
          freeSpace: availableBlocks * 1024,
          usePercent: Number.isNaN(usePercent) ? 0 : usePercent,
        });
      }
    } else if (platform === "win32") {
      // Use wmic on Windows
      const { stdout } = await execAsync("wmic logicaldisk get caption,freespace,size /format:csv");
      const lines = stdout.trim().split("\n");

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(",");
        if (parts.length < 4) continue;

        const mountPoint = parts[1]; // Caption (e.g., "C:")
        const freeSpace = Number.parseInt(parts[2], 10);
        const totalSpace = Number.parseInt(parts[3], 10);

        if (!mountPoint || Number.isNaN(freeSpace) || Number.isNaN(totalSpace)) continue;

        const usedSpace = totalSpace - freeSpace;
        const usePercent = Math.round((usedSpace / totalSpace) * 100);

        drives.push({
          filesystem: mountPoint,
          mountPoint,
          totalSpace,
          usedSpace,
          freeSpace,
          usePercent,
        });
      }
    }
  } catch (error) {
    console.error("Error getting disk info:", error);
    // Return empty drives array on error
  }

  return {
    platform,
    osType,
    osRelease,
    hostname,
    drives,
  };
}
