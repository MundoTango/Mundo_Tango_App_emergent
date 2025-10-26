/**
 * Replit Object Storage Integration
 * 
 * Provides object storage capabilities for vibe coding generated assets:
 * - Code backups before applying changes
 * - Screenshots from testing
 * - Generated files and images
 * 
 * Based on Replit App Storage blueprint (blueprint:javascript_object_storage)
 * Created: Oct 26, 2025 (MB.MD Workstream C)
 */

import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

// The object storage client is used to interact with the object storage service.
export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

/**
 * Object Storage Service for Vibe Coding
 * 
 * Stores:
 * - Code backups (before AI modifications)
 * - Test screenshots
 * - Generated assets
 */
export class ObjectStorageService {
  constructor() {}

  /**
   * Get the private object directory for vibe coding assets
   */
  getVibeCodeDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      console.warn(
        "⚠️  PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
        "tool and set PRIVATE_OBJECT_DIR env var."
      );
      return "";
    }
    return dir;
  }

  /**
   * Save a code backup before vibe coding modifications
   */
  async saveCodeBackup(filePath: string, content: string, projectId: number): Promise<string | null> {
    const vibeDir = this.getVibeCodeDir();
    if (!vibeDir) {
      console.log('📦 [ObjectStorage] Skipping backup - storage not configured');
      return null;
    }

    try {
      const backupId = randomUUID();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fullPath = `${vibeDir}/backups/${projectId}/${timestamp}-${backupId}.bak`;

      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      await file.save(content, {
        metadata: {
          contentType: 'text/plain',
          metadata: {
            originalPath: filePath,
            projectId: projectId.toString(),
            timestamp
          }
        }
      });

      console.log(`✅ [ObjectStorage] Saved backup: ${fullPath}`);
      return fullPath;
    } catch (error) {
      console.error('❌ [ObjectStorage] Backup failed:', error);
      return null;
    }
  }

  /**
   * Save a screenshot from vibe coding testing
   */
  async saveScreenshot(screenshotBuffer: Buffer, projectId: number, description: string): Promise<string | null> {
    const vibeDir = this.getVibeCodeDir();
    if (!vibeDir) {
      console.log('📦 [ObjectStorage] Skipping screenshot - storage not configured');
      return null;
    }

    try {
      const screenshotId = randomUUID();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fullPath = `${vibeDir}/screenshots/${projectId}/${timestamp}-${screenshotId}.png`;

      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      await file.save(screenshotBuffer, {
        metadata: {
          contentType: 'image/png',
          metadata: {
            description,
            projectId: projectId.toString(),
            timestamp
          }
        }
      });

      console.log(`✅ [ObjectStorage] Saved screenshot: ${fullPath}`);
      return fullPath;
    } catch (error) {
      console.error('❌ [ObjectStorage] Screenshot save failed:', error);
      return null;
    }
  }

  /**
   * Get upload URL for file uploads
   */
  async getUploadURL(fileType: 'backup' | 'screenshot' | 'asset', projectId: number): Promise<string | null> {
    const vibeDir = this.getVibeCodeDir();
    if (!vibeDir) {
      return null;
    }

    const objectId = randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullPath = `${vibeDir}/${fileType}s/${projectId}/${timestamp}-${objectId}`;

    const { bucketName, objectName } = parseObjectPath(fullPath);

    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  /**
   * Download an object file
   */
  async downloadObject(file: File, res: Response, cacheTtlSec: number = 3600): Promise<void> {
    try {
      const [metadata] = await file.getMetadata();
      
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `private, max-age=${cacheTtlSec}`,
      });

      const stream = file.createReadStream();

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  /**
   * List backups for a project
   */
  async listBackups(projectId: number): Promise<string[]> {
    const vibeDir = this.getVibeCodeDir();
    if (!vibeDir) {
      return [];
    }

    try {
      const fullPath = `${vibeDir}/backups/${projectId}/`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);

      const [files] = await bucket.getFiles({
        prefix: objectName
      });

      return files.map(f => `/${bucketName}/${f.name}`);
    } catch (error) {
      console.error('❌ [ObjectStorage] List backups failed:', error);
      return [];
    }
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`
    );
  }

  const { signed_url: signedURL } = await response.json();
  return signedURL;
}
