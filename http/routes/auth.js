import {Router} from 'express';
import * as auth from './../../controller/auth.js';
import createUser from './../../controller/usersController.js';
import userModel from '../../model/user-info.js';
import Token from '../../model/auth.js';
import onlyAuthMv from './mv/onlyAuth.js';
import Ajv from 'ajv';
import {userSchema} from '../helpers/userSchemaValidation.js';
import bcrypt from 'bcrypt';
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { upload } from '../../config/cloudinary.js';
import {uploadAvatar} from "../../controller/avatarController.js";
dotenv.config();

const router = Router();
const ajv = new Ajv();
const validate = ajv.compile(userSchema);

const FB_CLIENT_ID = process.env.FB_CLIENT_ID;
const FB_CLIENT_SECRET = process.env.FB_CLIENT_SECRET;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_FRONT;

// Приходять login + pwd. Створюємо токен
router.post('/strategy/local/login', async (req, res) => {
	// valid ajv
	const valid = validate(req.body);
	if (!valid) {
		console.log(validate.errors);
		return res.status(400).json({errors: validate.errors}); // Повертаємо помилки валідації
	}
	const {login, password} = req.body;
	
	const user = await userModel.findOne({login});
	if (!user) {
		return res.status(400).json({error: 'Invalid login'});
	}
	
	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		return res.status(400).json({error: 'Invalid password'});
	}
	
	// Перевіряємо, чи є вже збережений refreshToken
	const tokenRecord = await Token.findOne({userId: user._id});
	let accessT, refreshT;
	
	if (tokenRecord) {
		// Якщо refresh token існує, генеруємо новий access token
		const payload = {iss: user._id.toString()};
		const {token: newAccessT} = await auth.createAccessToken(payload);
		accessT = newAccessT;
		refreshT = tokenRecord.refreshToken;  // Берем старий refresh token
	}
	
	console.log(`Access токен при логіні згенерований ${accessT}`);
	
	res.status(200).json({
		status: 'ok',
		message: {accessT, refreshT}
	});
})

// Реєстрація

router.post('/strategy/local/registration', async (req, res) => {
	// valid ajv
	const {login, password, email} = req.body;
	const valid = validate(req.body);
	if (!valid) {
		console.log(validate.errors);
		return res.status(400).json({errors: validate.errors}); // Повертаємо помилки валідації
	}
	
	// Перевіряємо унікальність логіна й email
	const existingUser = await userModel.findOne({$or: [{login}, {email}]});
	if (existingUser) {
		return res.status(400).json({error: 'User with this login or email already exists'});
	}
	
	// Записуємо дані юзера в бд
	const provider = "local";
	const newUser = await createUser(login, password, email, provider);  // Зберігаємо нового користувача
	
	// Отримуємо ID нового користувача
	const userId = newUser._id.toString();
	
	// Створення токенів
	const payload = {iss: userId}; // передаємо userId як `iss`
	const {accessT, refreshT} = await auth.createTokens(payload);
	
	res.json({status: 'ok', message: {accessT, refreshT}});
	
})

// Для розлогіну
router.post('/logout', onlyAuthMv, (req, res) => {
	// valid
	const {refreshT} = req.body;
	auth.removeRefreshT(refreshT)
	res.json({status: 'ok'});
})

// Заміна токену
router.post('/replaceTokens', async (req, res) => {
    const { accessT, refreshT } = req.body;

    console.log(`Access Token с клиента для генерации нового: ${accessT}`);
    console.log(`Refresh Token с клиента для генерации нового: ${refreshT}`);

    if (!accessT || !refreshT) {
        return res.status(400).json({ error: 'Access Token and Refresh Token are required' });
    }

    try {
        const validSign = auth.verifySign(accessT);
        if (!validSign) {
            return res.status(403).json({ error: 'Invalid access token signature' });
        }

        const newTokens = await auth.replaceTokens(accessT, refreshT);
	    console.log("Новые сгенерированые токены", {...newTokens})

        if (!newTokens) {
            return res.status(400).json({ error: 'Failed to refresh tokens' });
        }

        console.log('New tokens generated:', newTokens);
        return res.json({ status: 'ok',  ...newTokens });
    } catch (error) {
        console.error('Error in /replaceTokens route:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/google-login', async (req, res) => {
	const {token} = req.body;
	
	if (!token) {
		return res.status(400).json({error: 'Токен гугла відстуній!'});
	}
	
	try {
		// Отримуємо дані про користувача через Google API
		const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: {Authorization: `Bearer ${token}`}
		});
		
		const {email, sub: googleId, name, picture} = userInfoResponse.data;
		
		if (!email || !googleId || !name || !picture) {
			return res.status(400).json({error: 'Неповні дані користувача від Google'});
		}
		
		// Перевіряємо, чи існує користувач у таблиці user-info за googleId
		let user_info = await userModel.findOne({googleId});
		
		// Завантажуємо аватар користувача
		const response = await axios.get(picture, {responseType: 'arraybuffer'});
		const base64Image = "data:image/jpeg;base64," + Buffer.from(response.data).toString('base64');
		
		if (user_info.googleId) {
			// Якщо користувач знайдено, оновлюємо аватар
			user_info.avatar = base64Image;
			await user_info.save(); // Зберігаємо користувача
		}
		
		// Після того, як користувач знайдений, шукаємо його по _id
		const userId = new mongoose.Types.ObjectId(user_info._id); // Отримуємо _id користувача
		
		// Генерация токенов
		const tokens = await auth.createTokens({iss: userId}); // Генерація токенів для користувача
		
		// Надсилаємо відповідь з токенами та інформацією про користувача
		res.json({status: 'ok', message: {...tokens, user_info}});
	} catch (error) {
		res.status(500).json({error: 'Ви не зареєстровані, будь-ласка пройдіть реєстрацію'});
	}
});

router.post('/google-register', async (req, res) => {
	const {token} = req.body;
	
	if (!token) {
		return res.status(400).json({error: 'Token is required'});
	}
	
	try {
		// Отримуємо дані про користувача через Google API
		const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: {Authorization: `Bearer ${token}`}
		});
		
		const {email, sub: googleId, name, picture} = userInfoResponse.data;
		
		if (!email || !googleId || !name || !picture) {
			return res.status(400).json({error: 'Incomplete user data from Google'});
		}
		
		// Загружаем аватар пользователя
		const response = await axios.get(picture, {responseType: 'arraybuffer'});
		const base64Image = "data:image/jpeg;base64," + Buffer.from(response.data).toString('base64');
		
		// Перевіряємо, чи існує користувач у таблиці user-info за googleId
		let user = await userModel.findOne({googleId});
		const provider = "google";
		if (!user) {
			// Якщо користувача не знайдено, то створюємо нового
			user = new userModel({
				googleId,
				login: name,
				email,
				avatar: base64Image,
				provider: provider
			});
			await user.save(); // Зберігаємо користувача
		}else {
			return res.status(500).json({error: 'Такий юзер вже зареєстрований!'});
		}
		
			// Після того, як користувач створений або знайдений, шукаємо його по _id
		const userId = user._id; // Отримуємо _id користувача
		
		// Генерація токенів
		const tokens = await auth.createTokens({iss: userId}); // Генерация токенов для пользователя
		
		// Перевіряємо, чи існує запис у таблиці Token
		let tokenRecord = await Token.findOne({userId});
		
		// Якщо запису з таким userId немає, створюємо новий запис
		if (!tokenRecord) {
			tokenRecord = new Token({
				userId,
				accessToken: tokens.accessT,
				refreshToken: tokens.refreshT
			});
		}
		await tokenRecord.save(); // Зберігаємо новий запис
		
		// Надсилаємо відповідь з токенами та інформацією про користувача
		res.json({status: 'ok', message: {...tokens, user}});
	} catch (error) {
		console.error('Помилка під час реєстрації через Google:', error.message);
		res.status(500).json({error: 'Помилка під час реєстрації через Google'});
	}
});


// Обробка редиректу від Facebook
router.post('/facebook/callback', async (req, res) => {
	const {code} = req.body;
	console.log("код фесбука на сервере", code)
	
	if (!code) {
		return res.status(400).json({error: 'Код доступу фейсбука не отриманий'});
	}
	
	try {
		// Отримання access_token від Facebook
		const tokenResponse = await axios.get(
			`https://graph.facebook.com/v15.0/oauth/access_token`,
			{
				params: {
					client_id: FB_CLIENT_ID,
					client_secret: FB_CLIENT_SECRET,
					redirect_uri: FB_REDIRECT_URI,
					code
				}
			}
		);
		
		if (!tokenResponse.data.access_token) {
    return res.status(400).json({ error: 'Не удалось получить access_token от Facebook' });
}
		
		const accessToken = tokenResponse.data.access_token;
		
		// Запит даних користувача
		const userResponse = await axios.get(
			`https://graph.facebook.com/me`,
			{
				params: {
					access_token: accessToken,
					fields: 'id,name,email, picture.type(normal)'
				}
			}
		);
		
		const {id: facebookId, name, email, picture} = userResponse.data;
		const profilePictureUrl = picture?.data?.url;
		const response = await axios.get(profilePictureUrl, {responseType: 'arraybuffer'});
		const base64Image = Buffer.from(response.data).toString('base64');
		
		// Перевірка, чи є користувач у БД
		let user = await userModel.findOne({facebookId});
		const provider = "facebook";
		
		if (!user) {
			user = new userModel({
				facebookId,
				login: name,
				email: email,
				avatar: base64Image,
				provider: provider
			});
			
			await user.save(); // Зберігаємо нового користувача до бази
		} else {
			// Якщо користувач існує, оновлюємо інформацію (наприклад, ім'я або електронна пошта)
			user.login = name;
			user.email = email;
			user.avatar = base64Image;
			await user.save();
		}
		
		// Після того, як користувач створений або знайдений, шукаємо його по _id
		const userId = user._id; // Отримуємо _id користувача
		
		// Генерація токенів
		const tokens = await auth.createTokens({iss: userId});
		
		let tokenRecord = await Token.findOne({userId});
		
		// Якщо запису з таким userId немає, створюємо новий запис
		if (!tokenRecord) {
			tokenRecord = new Token({
				userId,
				accessToken: tokens.accessT,
				refreshToken: tokens.refreshT
			});
		}
		
		await tokenRecord.save(); // Сохраняем новую запись
		
		// Надсилаємо відповідь з токенами та інформацією про користувача
		res.status(200).json({status: 'ok', message: {...tokens}});
		
		
	} catch (error) {
		console.error('Помилка при авторизації через Facebook:', error.message);
		res.status(500).json({error: 'Помилка при авторизації через Facebook'});
	}
	
});

router.post('/upload-avatar', upload.single('avatar'), uploadAvatar);


export default router;