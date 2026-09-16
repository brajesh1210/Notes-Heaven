import { uploadImageBuffer, destroyImage, assertCloudinaryReady } from '../services/cloudinary.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/ApiError.js';

// POST /api/uploads/image   (multipart/form-data, field name: "image")
export const uploadImage = asyncHandler(async (req, res) => {
  assertCloudinaryReady();
  if (!req.file) throw badRequest('Koi file nahi mili (field name "image" hona chahiye)');

  const result = await uploadImageBuffer(req.file.buffer, 'notes');
  return ok(res, { image: result }, 'Image upload ho gayi');
});

// DELETE /api/uploads/image?publicId=notes-heaven/notes/xyz
export const deleteImage = asyncHandler(async (req, res) => {
  assertCloudinaryReady();
  const publicId = req.query.publicId || req.body?.publicId;
  if (!publicId) throw badRequest('publicId required hai');
  const result = await destroyImage(publicId);
  return ok(res, { result }, 'Image delete ho gayi');
});
