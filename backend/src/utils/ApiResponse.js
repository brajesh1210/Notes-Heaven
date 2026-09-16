/**
 * Har response ka ek hi shape rakhte hain, frontend me parsing easy rehta hai:
 * { success: true, message: "...", data: {...} }
 */
export const ok = (res, data = {}, message = 'OK', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

export const created = (res, data = {}, message = 'Created') => ok(res, data, message, 201);
