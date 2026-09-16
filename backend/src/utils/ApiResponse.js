/**
 * Every response uses the same shape so parsing stays simple on the frontend:
 * { success: true, message: "...", data: {...} }
 */
export const ok = (res, data = {}, message = 'OK', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

export const created = (res, data = {}, message = 'Created') => ok(res, data, message, 201);
