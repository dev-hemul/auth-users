// Підключення до бази даних
import mongoose from 'mongoose';
import colors from 'colors';
import dotenv from 'dotenv';
dotenv.config();

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



