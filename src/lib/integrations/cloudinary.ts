/**
 * Cloudinary Integration - FREE Image Hosting
 * 
 * Features:
 * - 25GB storage free
 * - Image optimization
 * - Transformations (resize, crop, filters)
 * - Property photos, documents
 * 
 * Setup:
 * 1. Sign up at https://cloudinary.com (free)
 * 2. Get your cloud name, API key, and API secret
 * 3. Add to .env.local:
 *    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 */

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  resource_type: string;
}

export interface UploadOptions {
  folder?: string;
  tags?: string[];
  transformation?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: 'auto' | number;
  };
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * Generate a signed upload URL for client-side uploads
 */
export async function generateUploadSignature(folder: string = 'dealflow'): Promise<{
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}> {
  if (!CLOUDINARY_API_SECRET || !CLOUDINARY_API_KEY || !CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary credentials not configured');
  }

  const timestamp = Math.round(Date.now() / 1000);
  
  // Create signature using crypto
  const crypto = await import('crypto');
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  return {
    signature,
    timestamp,
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY
  };
}

/**
 * Upload image from server side (Node.js)
 */
export async function uploadImage(
  imageData: string | Buffer,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary not configured');
  }

  const formData = new FormData();
  
  if (typeof imageData === 'string' && imageData.startsWith('data:')) {
    // Base64 data URL
    formData.append('file', imageData);
  } else if (typeof imageData === 'string') {
    // URL
    formData.append('file', imageData);
  } else {
    // Buffer - convert to base64
    const base64 = `data:image/jpeg;base64,${imageData.toString('base64')}`;
    formData.append('file', base64);
  }

  formData.append('upload_preset', 'dealflow_unsigned');
  
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  if (options.tags) {
    formData.append('tags', options.tags.join(','));
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  return response.json();
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'pad';
    quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    effect?: string;
  } = {}
): string {
  if (!CLOUDINARY_CLOUD_NAME) {
    // Return placeholder if Cloudinary not configured
    return `https://via.placeholder.com/${options.width || 400}x${options.height || 300}`;
  }

  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.effect) transformations.push(`e_${options.effect}`);

  const transformString = transformations.length > 0 
    ? transformations.join(',') + '/'
    : '';

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}${publicId}`;
}

/**
 * Get property photo thumbnail
 */
export function getPropertyThumbnail(publicId: string): string {
  return getOptimizedImageUrl(publicId, {
    width: 400,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
}

/**
 * Get property photo for gallery view
 */
export function getPropertyGalleryImage(publicId: string): string {
  return getOptimizedImageUrl(publicId, {
    width: 800,
    height: 600,
    crop: 'fit',
    quality: 'auto:good',
    format: 'auto'
  });
}

/**
 * Get full resolution property photo
 */
export function getPropertyFullImage(publicId: string): string {
  return getOptimizedImageUrl(publicId, {
    quality: 'auto:best',
    format: 'auto'
  });
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary credentials not configured');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const crypto = await import('crypto');
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
    .digest('hex');

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: 'POST',
      body: formData
    }
  );

  const result = await response.json();
  return result.result === 'ok';
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!CLOUDINARY_CLOUD_NAME;
}
