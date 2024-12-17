import { Router } from 'express';
import { requestPasswordReset, resetPassword } from '../../controller/forgotPassword.js';

const app = Router();

// Роут для запиту відновлення пароля
app.post('/forgot-password', requestPasswordReset);

// Роут для скидання пароля
app.post('/reset-password', resetPassword);

export default app;