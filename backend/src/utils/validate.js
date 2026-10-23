const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function isEmail(v) {
  return typeof v === 'string' && EMAIL_RE.test(v);
}

// Mínimo 8 caracteres, una mayúscula, una minúscula y un número
function isStrongPassword(v) {
  return typeof v === 'string' && v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v);
}

function required(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === '');
  if (missing.length) throw new HttpError(400, `Campos obligatorios: ${missing.join(', ')}`);
}

module.exports = { HttpError, isEmail, isStrongPassword, required };
