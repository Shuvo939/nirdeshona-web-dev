import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function getConfig() {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    R2_PUBLIC_URL,
  } = process.env;

  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET_NAME ||
    !R2_PUBLIC_URL
  ) {
    throw new Error("Missing Cloudflare R2 environment variables.");
  }

  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucketName: R2_BUCKET_NAME,
    publicUrl: R2_PUBLIC_URL.replace(/\/$/, ""),
  };
}

export function hasR2() {
  try {
    getConfig();
    return true;
  } catch {
    return false;
  }
}

// Lazily create the client so builds (and pages that never upload)
// don't crash when R2 env vars are missing.
export function getR2() {
  const config = getConfig();

  if (!client) {
    // R2_ENDPOINT is optional — only for local development against an
    // S3-compatible server (MinIO etc.). Production uses the R2 endpoint.
    const customEndpoint = process.env.R2_ENDPOINT;
    client = new S3Client({
      region: "auto",
      endpoint: customEndpoint || `https://${config.accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: Boolean(customEndpoint),
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }

  return { client, ...config };
}

export async function uploadToR2({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}) {
  const { client: r2, bucketName, publicUrl } = getR2();

  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: `${publicUrl}/${key}`,
  };
}

export async function deleteFromR2(key: string) {
  const { client: r2, bucketName } = getR2();

  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}
/* ============================================================
   PRIVATE FILES (ticket attachments)
   Stored in R2_PRIVATE_BUCKET_NAME when set, otherwise in the main
   bucket under a random, unlisted key. Always served through short-lived
   signed URLs after an access check — never via the public URL.
============================================================ */

export function privateBucket() {
  const { bucketName } = getR2();
  return process.env.R2_PRIVATE_BUCKET_NAME || bucketName;
}

export async function presignPrivatePut(key: string, contentType: string, contentLength: number) {
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const { client } = getR2();
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: privateBucket(), Key: key, ContentType: contentType, ContentLength: contentLength }),
    { expiresIn: 600 },
  );
}

export async function headPrivateObject(key: string) {
  const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
  const { client } = getR2();
  try {
    const res = await client.send(new HeadObjectCommand({ Bucket: privateBucket(), Key: key }));
    return { size: Number(res.ContentLength ?? 0), contentType: res.ContentType ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

export async function presignPrivateGet(key: string, fileName: string, inline: boolean) {
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { client } = getR2();
  const safe = fileName.replace(/["\\\r\n]/g, "_");
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: privateBucket(),
      Key: key,
      ResponseContentDisposition: `${inline ? "inline" : "attachment"}; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    }),
    { expiresIn: 300 },
  );
}

export async function deletePrivateObject(key: string) {
  const { client } = getR2();
  await client.send(new DeleteObjectCommand({ Bucket: privateBucket(), Key: key }));
}

/* ============================================================
   PUBLIC MEDIA (admin media library)
============================================================ */

export async function presignPublicPut(key: string, contentType: string, contentLength: number) {
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const { client, bucketName } = getR2();
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucketName, Key: key, ContentType: contentType, ContentLength: contentLength }),
    { expiresIn: 600 },
  );
}

export async function headPublicObject(key: string) {
  const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
  const { client, bucketName } = getR2();
  try {
    const res = await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return { size: Number(res.ContentLength ?? 0), contentType: res.ContentType ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

export function publicUrlFor(key: string) {
  return `${getR2().publicUrl}/${key}`;
}
