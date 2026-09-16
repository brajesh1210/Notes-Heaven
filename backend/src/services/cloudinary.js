import { v2 as cloudinary } from 'cloudinary';
import { env, features } from '../config/env.js';
import { badRequest } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

if (features.cloudinary) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

/** Buffer -> Cloudinary. Returns { url, publicId, width, height } */
export const uploadImageBuffer = async (buffer, folder = 'notes') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinary.folder}/${folder}`,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });

export const destroyImage = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.warn(`Cloudinary delete failed (${publicId}): ${err.message}`);
    return null;
  }
};

export const assertCloudinaryReady = () => {
  if (!features.cloudinary) {
    throw badRequest(
      'Image upload is not configured. Set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET in backend/.env (free tier).'
    );
  }
};

export { cloudinary };
