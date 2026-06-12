import {
  S3Client,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { env } from './validateEnv.js';

export const BUCKET_NAME = env.S3_BUCKET;

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_ACCESS_SECRET,
  },
  endpoint: env.S3_ENDPOINT_URL,
  forcePathStyle: true, // 使用 MinIO 必須設定為 true
});

export const deleteFromS3 = async (fileKey: string) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });
  await s3Client.send(command);
};

export const healthCheck = async () => {
  const command = new HeadBucketCommand({ Bucket: BUCKET_NAME });
  await s3Client.send(command);
};
