import { Express } from "express";
import { Multer } from "multer";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { s3Enabled } from "../../config/s3.config";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

// Lazy import AWS SDK v3 to avoid hard dependency when S3 is disabled
let S3Client: any;
let PutObjectCommand: any;

@Injectable()
export class MediaService {
  async upload(
    userId: string,
    file: Express.Multer.File,
    extraPath?: string
  ) {
    if (!file) throw new InternalServerErrorException("No file received");
    const key = this.buildKey(userId, file.originalname, extraPath);
    const enabled = s3Enabled(process.env);

    if (enabled) {
      try {
        if (!S3Client) {
          // dynamic import
          ({ S3Client } = await import("@aws-sdk/client-s3"));
          ({ PutObjectCommand } = await import("@aws-sdk/client-s3"));
        }
        const client = new S3Client({ region: process.env.AWS_REGION });
        await client.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );
        const base =
          process.env.S3_PUBLIC_URL_BASE ||
          `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
        return {
          url: `${base}/${key}`,
          mimeType: file.mimetype,
          size: file.size,
          key,
        };
      } catch (e) {
        throw new InternalServerErrorException(
          "S3 upload failed: " + (e as Error).message
        );
      }
    } else {
      // fallback to local filesystem ./uploads (ensure folder exists)
      const uploadsDir = path.resolve(process.cwd(), "uploads");
      fs.mkdirSync(uploadsDir, { recursive: true });
      const diskPath = path.join(uploadsDir, key.replaceAll("/", "_")); // flatten structure
      fs.writeFileSync(diskPath, file.buffer);
      return {
        url: `/uploads/${path.basename(diskPath)}`,
        mimeType: file.mimetype,
        size: file.size,
        key: path.basename(diskPath),
      };
    }
  }

  private buildKey(
    userId: string,
    originalName: string,
    extraPath?: string
  ) {
    const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const stamp = new Date().toISOString().replace(/[:.]/g, "");
    const uid = randomUUID().split("-")[0];
    const parts = [userId];
    if (extraPath) parts.push(extraPath);
    return `${parts.join("/")}/${stamp}_${uid}_${cleanName}`;
  }
}
