import {Router} from 'express';
import * as auth from './../../controller/auth.js';
import createUser from './../../controller/usersController.js';
import userModel from '../../model/user-info.js';
import Token from '../../model/auth.js';
import onlyAuthMv from './mv/onlyAuth.js';
import Ajv from 'ajv';
import {userSchema} from '../helpers/userSchemaValidation.js';
import bcrypt from 'bcrypt';
import {OAuth2Client} from 'google-auth-library';

const router = Router();
const ajv = new Ajv();
const validate = ajv.compile(userSchema);

const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

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
	const newUser = await createUser(login, password, email);  // Зберігаємо нового користувача
	
	// Отримуємо ID нового користувача
	const userId = newUser._id.toString();
	
	// Створення токенів
	const payload = {iss: userId}; // передаємо userId як `iss`
	const {accessT, refreshT} = await auth.createTokens(payload);
	console.log(accessT, refreshT)
	
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
	const {accessT, refreshT} = req.body;
	console.log(`Токен доступу з фронта: ${accessT}`);
	console.log(`Рефреш токен з фронта: ${refreshT}`);
	if (!accessT || !refreshT) {
		return res.status(400).json({error: 'Необхідний Access Token і Refresh токен'});
	}
	const validSign = auth.verifySign(accessT);
	if (validSign !== true) {
		return res.status(403).json({error: 'Invalid access token signature'});
	}
	
	const newTokens = await auth.replaceTokens(accessT, refreshT);
	console.log(newTokens);
	if (!newTokens) {
		return res.status(400).json({error: 'Failed to refresh tokens'});
	}
	console.log(newTokens)
	return res.json({status: 'ok', payload: {Newtokens: newTokens}});
});

router.post('/google-sign-in', async (req, res) => {
	const {token} = req.body;
	console.log(token)
	
	if (!token) {
		return res.status(400).json({error: 'Token is required'});
	}
	
	console.log('Полученный Google Token:', token);  // Логируем токен
	
	try {
		const ticket = await oAuth2Client.verifyIdToken({
			idToken: token,
			audience: GOOGLE_CLIENT_ID
		});
		const payload = ticket.getPayload();
		const {email, sub: googleId, name, picture} = payload;
		console.log(`ТУТ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ: ${email}, ${googleId}, ${name}`)
		let user = await userModel.findOne({googleId});
		
		if (!user) {
			user = new userModel({
				googleId: googleId,
				login: name,
				email
			});
			await user.save();
		}
		
		const userId = user._id.toString();
		const tokens = await auth.createTokens({iss: userId});
		
		await Token.findOneAndUpdate(
			{userId},
			{refreshToken: tokens.refreshT},
			{upsert: true}
		);
		
		res.json({status: 'ok', message: {...tokens, user}});
	} catch (error) {
		console.error('Ошибка при авторизации через Google:', error.message);
		res.status(500).json({error: 'Ошибка авторизации через Google'});
	}
});


router.get('/google-info-me', async (req, res) => {
	const {authorization} = req.headers;
	
	if (!authorization) {
		return res.status(401).json({error: 'Authorization header is required'});
	}
	
	const token = authorization.replace('Bearer ', '');
	
	try {
		const validSign = auth.verifySign(token);
		if (!validSign) {
			return res.status(403).json({error: 'Invalid token'});
		}
		
		const decoded = auth.decodeToken(token);
		const userId = decoded.iss;
		
		const user = await userModel.findById(userId).select('-password');
		if (!user) {
			return res.status(404).json({error: 'User not found'});
		}
		
		res.json({success: true, user});
	} catch (error) {
		console.error('Ошибка получения информации о пользователе:', error.message);
		res.status(500).json({error: 'Ошибка получения данных пользователя'});
	}
})


export default router;