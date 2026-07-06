import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME

// Initialize R2 client using standard S3 compatibility layer
const getR2Client = (): S3Client => {
  // Safe fail for build time in dev environments
  const accountId = R2_ACCOUNT_ID || 'placeholder'
  const accessKeyId = R2_ACCESS_KEY_ID || 'placeholder'
  const secretAccessKey = R2_SECRET_ACCESS_KEY || 'placeholder'
  
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

const r2Client = getR2Client()

/**
 * Generates a presigned URL to upload a file directly to Cloudflare R2
 * @param fileKey Unique file identifier (e.g. users/userId/receipts/filename.png)
 * @param contentType MIME type of the file (e.g. image/jpeg)
 * @param expiresIn Time in seconds until the link expires (default: 300s = 5m)
 */
export async function getSignedUploadUrl(
  fileKey: string, 
  contentType: string, 
  expiresIn: number = 300
): Promise<string> {
  const bucketName = R2_BUCKET_NAME || 'outlay-receipts'
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    ContentType: contentType,
  })

  return getSignedUrl(r2Client, command, { expiresIn })
}

/**
 * Generates a presigned URL to view/download a file from Cloudflare R2
 * @param fileKey Unique file identifier in the bucket
 * @param expiresIn Time in seconds until the link expires (default: 3600s = 1h)
 */
export async function getSignedDownloadUrl(
  fileKey: string, 
  expiresIn: number = 3600
): Promise<string> {
  const bucketName = R2_BUCKET_NAME || 'outlay-receipts'
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  })

  return getSignedUrl(r2Client, command, { expiresIn })
}

/**
 * Deletes an object from the R2 bucket
 * @param fileKey Unique file identifier in the bucket
 */
export async function deleteFromR2(fileKey: string): Promise<void> {
  const bucketName = R2_BUCKET_NAME || 'outlay-receipts'
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  })

  await r2Client.send(command)
}
