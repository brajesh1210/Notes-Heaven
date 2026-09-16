const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const paint = (color, text) => `\x1b[${color}m${text}\x1b[0m`;

const logger = {
  info: (...a) => console.log(paint(36, `[${stamp()}] INFO `), ...a),
  success: (...a) => console.log(paint(32, `[${stamp()}] OK   `), ...a),
  warn: (...a) => console.warn(paint(33, `[${stamp()}] WARN `), ...a),
  error: (...a) => console.error(paint(31, `[${stamp()}] ERR  `), ...a),
};

export default logger;
