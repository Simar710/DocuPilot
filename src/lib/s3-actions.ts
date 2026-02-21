'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * @fileOverview Server Actions for AWS S3 integration.
 * Demonstrates a "Decoupled Storage" architecture pattern.
 * 
 * SECURITY BEST PRACTICE: This client is configured to use the default credential provider chain.
 * Since the app is deployed on ECS/EC2 with the 'DocuPilot-EC2-Role', the SDK will automatically
 * fetch temporary credentials from the Instance Metadata Service (IMDS).
 * No hardcoded AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY are required.
 */

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

/**
 * Generates a pre-signed URL for direct-to-S3 uploads.
 * This saves server resources (RAM/CPU) by offloading the upload to S3.
 * 
 * Target Bucket: docupilot-uploads
 */
export async function getUploadUrl(fileName: string, contentType: string) {
  // Use environment variable if provided, fallback to the specific bucket name
  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'docupilot-uploads';
  
  const key = `uploads/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { url, key };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error('Could not generate S3 upload URL. Check IAM Role permissions.');
  }
}
