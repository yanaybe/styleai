import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadWardrobeImage(
  file: string,
  userId: string
): Promise<{ url: string; thumbnailUrl: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder: `styleai/wardrobe/${userId}`,
    transformation: [
      { background: "white", gravity: "center", aspect_ratio: "1:1", crop: "pad" },
    ],
    eager: [
      { width: 400, height: 400, crop: "fill", gravity: "auto", format: "webp", quality: "auto" },
      { width: 120, height: 120, crop: "fill", gravity: "auto", format: "webp", quality: "auto" },
    ],
    eager_async: false,
  });

  return {
    url: result.eager?.[0]?.secure_url ?? result.secure_url,
    thumbnailUrl: result.eager?.[1]?.secure_url ?? result.secure_url,
    publicId: result.public_id,
  };
}

export async function uploadAvatarImage(
  file: string,
  userId: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder: `styleai/avatars/${userId}`,
    transformation: [
      { width: 800, height: 1200, crop: "fill", gravity: "face" },
      { format: "webp", quality: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function uploadInspirationImage(
  file: string,
  userId: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder: `styleai/inspiration/${userId}`,
    transformation: [{ format: "webp", quality: "auto" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getSignedUploadUrl(folder: string): {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
} {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  };
}
