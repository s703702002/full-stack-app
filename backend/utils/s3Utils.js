import {
  S3Client,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';

export const BUCKET_NAME = process.env.S3_BUCKET;

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_SECRET,
  },
  endpoint: process.env.S3_ENDPOINT_URL,
  forcePathStyle: true, // 🚀 關鍵：使用 MinIO 必須設定為 true
});

export const deleteFromS3 = async (fileKey) => {
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
