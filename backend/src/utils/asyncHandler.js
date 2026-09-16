/**
 * Express async controller wrapper - try/catch likhne ki zarurat nahi.
 *   router.get('/', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
