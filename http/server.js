import express from 'express';
import path from 'path';
// Цей рядок імпортує функцію fileURLToPath із модуля url, вбудованого в Node.js.
import {fileURLToPath} from 'url';
// Логи для консолі за запитами
import morgan from 'morgan';
// Обробка та відображення помилок
import createHttpError from 'http-errors';
// Імпорт CORS
import cors from 'cors';
// Роути
import mainRouter from './routes/main.js'
import authRouter from './routes/auth.js';
import resetPasword from './routes/restore.js';

const app = express();
app.use(morgan('combined'));

app.use(cors({
  origin: '*',
	credentials: true
}));
app.use(express.json());

// import.meta.url це спеціальна змінна ESM, яка містить URL поточного модуля (файлу).
// fileURLToPath(import.meta.url) - конвертує цей URL в шлях файлової системи.
// В результаті __filename буде містити повний шлях до поточного файлу (де знаходиться цей код). Це аналог старої змінної __filename в CommonJS.
const __filename = fileURLToPath(import.meta.url);

// path.dirname(__filename) отримує директорію, в якій знаходиться файл, з повного шляху __filename
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../client/build')));

app.use('/', mainRouter);
app.use('/auth', authRouter);
app.use('/restore', resetPasword);

app.use((req, res, next) => {
	next(createHttpError(404));
})

// error hendler - midleware для обробки помилок. Тобто спочатку вище формуємо помилку, а потім всі помилки передаються сюди
app.use((err, req, res, next) => {
	const {status = 404, message = 'Internal Server Error'} = err; // Беремо статус помилки
	console.error(status);
	console.error(message);
	
	res.status(status).json({ error: message }); // Повертаємо повідомлення про помилку в форматі JSON
});

export default app;