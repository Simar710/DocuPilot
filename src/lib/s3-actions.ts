
'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * @fileOverview Server Actions for AWS S3 integration.
 * Demonstrates a "Decoupled Storage" architecture pattern.
 */

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Generates a pre-signed URL for direct-to-S3 uploads.
 * This saves server resources (RAM/CPU) by offloading the upload to S3.
 */
export async function getUploadUrl(fileName: string, contentType: string) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  
  if (!bucketName) {
    throw new Error('S3 Bucket name is not configured');
  }

  const key = `uploads/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return { url, key };
}
