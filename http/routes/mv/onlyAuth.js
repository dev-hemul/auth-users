import * as auth from './../../../controller/auth.js';
import createHttpError from 'http-errors';

// Функція перевірки токена
const mv = (req, res, next) => {
  // Витягаємо токен із заголовка Authorization
  const accessT = req.headers['authorization']?.split(' ')[1];  // Ожидаем формат "Bearer <token>"

  if (!accessT) {
    return next(createHttpError(401, 'No access token provided'));
  }

  // Перевіряємо токен
  const result = auth.verifyAccessT(accessT);
  console.log('verifyAccessT result:', result);

  if (result !== true) {
    return next(createHttpError(403, 'Invalid or expired token'));
  }

  // Виймаємо payload з токена і зберігаємо user ID в res.locals
  const payload = auth.getPayloadAccessT(accessT);
  res.locals.uid = payload.iss;  // Зберігаємо user ID як uid
  console.log('Payload:', payload);
  console.log('UID:', res.locals.uid);

  next();
};

export default mv;
