// Підключення до бази даних
import mongoose from 'mongoose';
import colors from 'colors';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';

const environment = process.env.NODE_ENV || 'development'; // Получаем NODE_ENV или используем 'development' по умолчанию

// Загружаем соответствующий .env файл в зависимости от окружения
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) });

const connectDB = async () => {
	const dbName = process.env.DB_URL;
	try {
		await mongoose.connect(dbName);
		console.log(`Connected to DB user: ${dbName}`.bgGreen.black);
	} catch (err) {
		console.log(`'not connected', ${err}`.bgYellow.red.bold);
	}
}

export default connectDB;



