import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "../../logging/winston/AppLogger";

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || "";
    this.s3Client = new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_KEY || "",
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      logger.info(`[S3Service] Successfully uploaded file: ${fileName}`);
      return fileName;
    } catch (error) {
      logger.error(`[S3Service] Upload failed for ${fileName}:`, error);
      throw error;
    }
  }

  async getSignedFileUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error(`[S3Service] Failed to generate signed URL for ${fileName}:`, error);
      throw error;
    }
  }
}
