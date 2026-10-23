// Simulación de pasarela de pago con tarjeta de crédito/débito.
// No se conecta a ningún banco: valida la tarjeta y decide el resultado
// según reglas fijas para poder probar casos aprobados y rechazados.

const crypto = require('crypto');

function onlyDigits(v) {
  return String(v || '').replace(/\D/g, '');
}

// Algoritmo de Luhn: verifica el dígito de control del número de tarjeta
function luhnValid(number) {
  const digits = onlyDigits(number);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function cardBrand(number) {
  const n = onlyDigits(number);
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'otra';
}

// expiry en formato MM/AA o MMAA
function expiryValid(expiry, now = new Date()) {
  const m = onlyDigits(expiry).match(/^(\d{2})(\d{2})$/);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const lastDay = new Date(year, month, 0, 23, 59, 59);
  return lastDay >= now;
}

function validateCard({ number, name, expiry, cvc }) {
  const errors = [];
  if (!luhnValid(number)) errors.push('Número de tarjeta inválido');
  if (!name || String(name).trim().length < 3) errors.push('Nombre del titular inválido');
  if (!expiryValid(expiry)) errors.push('Tarjeta vencida o fecha inválida');
  const cvcLen = cardBrand(number) === 'amex' ? 4 : 3;
  if (onlyDigits(cvc).length !== cvcLen) errors.push(`El CVC debe tener ${cvcLen} dígitos`);
  return errors;
}

// Reglas de la simulación (documentadas para las pruebas):
//  - Tarjeta terminada en 0002 -> rechazada por fondos insuficientes
//  - Tarjeta terminada en 0069 -> rechazada por tarjeta denunciada
//  - Cualquier otra tarjeta válida -> aprobada
function processPayment(card, amount) {
  const errors = validateCard(card);
  if (errors.length) return { approved: false, status: 'invalida', errors };

  const digits = onlyDigits(card.number);
  const base = { brand: cardBrand(digits), last4: digits.slice(-4), amount };

  if (digits.endsWith('0002')) return { ...base, approved: false, status: 'rechazado', reason: 'Fondos insuficientes' };
  if (digits.endsWith('0069')) return { ...base, approved: false, status: 'rechazado', reason: 'Tarjeta denunciada' };

  const code = 'AUT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  return { ...base, approved: true, status: 'aprobado', authorizationCode: code };
}

module.exports = { luhnValid, cardBrand, expiryValid, validateCard, processPayment };
