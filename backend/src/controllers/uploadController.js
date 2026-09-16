import { uploadImageBuffer, destroyImage, assertCloudinaryReady } from '../services/cloudinary.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/ApiError.js';

// POST /api/uploads/image   (multipart/form-data, field name: "image")
export const uploadImage = asyncHandler(async (req, res) => {
  assertCloudinaryReady();
  if (!req.file) throw badRequest('No file received (the field name must be "image")');

  const result = await uploadImageBuffer(req.file.buffer, 'notes');
  return ok(res, { image: result }, 'Image uploaded successfully');
});

// DELETE /api/uploads/image?publicId=notes-heaven/notes/xyz
export const deleteImage = asyncHandler(async (req, res) => {
  assertCloudinaryReady();
  const publicId = req.query.publicId || req.body?.publicId;
  if (!publicId) throw badRequest('publicId is required');
  const result = await destroyImage(publicId);
  return ok(res, { result }, 'Image deleted');
});
