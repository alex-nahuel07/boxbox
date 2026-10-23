const { luhnValid, cardBrand, expiryValid, processPayment } = require('../src/utils/payment');

// Pruebas unitarias de la pasarela de pago simulada
describe('Pasarela de pago simulada', () => {
  test('valida el número con el algoritmo de Luhn', () => {
    expect(luhnValid('4242 4242 4242 4242')).toBe(true);
    expect(luhnValid('5555 5555 5555 4444')).toBe(true);
    expect(luhnValid('4242 4242 4242 4241')).toBe(false);
    expect(luhnValid('123')).toBe(false);
  });

  test('detecta la marca de la tarjeta', () => {
    expect(cardBrand('4242424242424242')).toBe('visa');
    expect(cardBrand('5555555555554444')).toBe('mastercard');
    expect(cardBrand('378282246310005')).toBe('amex');
  });

  test('controla la fecha de vencimiento', () => {
    const hoy = new Date(2026, 9, 23);
    expect(expiryValid('10/26', hoy)).toBe(true);
    expect(expiryValid('09/26', hoy)).toBe(false);
    expect(expiryValid('13/30', hoy)).toBe(false);
  });

  test('aprueba una tarjeta válida y rechaza las de prueba', () => {
    const tarjeta = { name: 'TEST', expiry: '12/30', cvc: '123' };
    const ok = processPayment({ ...tarjeta, number: '4242424242424242' }, 1000);
    expect(ok.approved).toBe(true);
    expect(ok.authorizationCode).toMatch(/^AUT-/);

    const sinFondos = processPayment({ ...tarjeta, number: '4000000000000002' }, 1000);
    expect(sinFondos.approved).toBe(false);
    expect(sinFondos.reason).toBe('Fondos insuficientes');
  });
});
