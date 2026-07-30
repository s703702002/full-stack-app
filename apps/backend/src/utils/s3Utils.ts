import {
  S3Client,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './validateEnv.js';

export const BUCKET_NAME = env.S3_BUCKET;

export const s3Client = new S3Client({
  region: 'us-east-1', // MinIO 對 region 沒有實際限制，隨便填一個合法值即可
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

export async function generatePresignedPutUrl(
  key: string,
  contentType: string,
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

export async function generatePresignedGetUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}
