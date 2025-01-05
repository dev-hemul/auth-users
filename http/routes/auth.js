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
import axios from 'axios';

const router = Router();
const ajv = new Ajv();
const validate = ajv.compile(userSchema);

const GOOGLE_CLIENT_ID = process.env.CLIENT_ID_GOOGLE;
const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

const FB_CLIENT_ID = process.env.FB_CLIENT_ID;
const FB_CLIENT_SECRET = process.env.FB_CLIENT_SECRET;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI;
const FRONTEND_URL = process.env.FB_REDIRECT_FRONT;

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
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        // Получаем данные о пользователе через Google API
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { email, sub: googleId, name, picture } = userInfoResponse.data;

        if (!email || !googleId || !name || !picture) {
            return res.status(400).json({ error: 'Incomplete user data from Google' });
        }

        // Загружаем аватар пользователя
        const response = await axios.get(picture, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');

        // Проверяем, существует ли пользователь в таблице user-info по googleId
        let user = await userModel.findOne({ googleId });

        if (!user) {
            // Если пользователь не найден, создаем нового пользователя
            user = new userModel({
                googleId,
                login: name,
                email,
                avatar: base64Image
            });
            await user.save(); // Сохраняем пользователя
        } else {
            // Если пользователь найден, обновляем аватар
            user.avatar = base64Image;
            await user.save();
        }

        // После того как пользователь создан или найден, ищем его по _id
        const userId = user._id; // Получаем _id пользователя

        // Генерация токенов
        const tokens = await auth.createTokens({ iss: userId }); // Генерация токенов для пользователя

        console.log(`User ID: ${userId}`);
        console.log(`Access Token: ${tokens.accessT}`);
        console.log(`Refresh Token: ${tokens.refreshT}`);

        // Проверяем, существует ли запись в таблице Token
        let tokenRecord = await Token.findOne({ userId });

        if (!tokenRecord) {
            console.log('Запись в таблице Token не найдена. Создаем новую запись.');
            // Если записи с таким userId нет, создаем новую запись
            tokenRecord = new Token({
                userId,
                accessToken: tokens.accessT,
                refreshToken: tokens.refreshT
            });
            await tokenRecord.save(); // Сохраняем новую запись
        } else {
            console.log('Запись в таблице Token найдена. Обновляем токены.');
            // Если запись с таким userId уже существует, обновляем токены
            tokenRecord.accessToken = tokens.accessT;
            tokenRecord.refreshToken = tokens.refreshT;
            await tokenRecord.save(); // Обновляем запись
        }

        // Отправляем ответ с токенами и информацией о пользователе
        res.json({ status: 'ok', message: { ...tokens, user } });
    } catch (error) {
        console.error('Ошибка при авторизации через Google:', error.message);
        res.status(500).json({ error: 'Ошибка при авторизации через Google' });
    }
});











// Маршрут для початку авторизації через Facebook
router.get('/facebook', (req, res) => {
	const fbAuthUrl = `https://www.facebook.com/v15.0/dialog/oauth?client_id=${FB_CLIENT_ID}&redirect_uri=${FB_REDIRECT_URI}&scope=public_profile`;
	res.redirect(fbAuthUrl);
});

// Обробка редиректу від Facebook
router.get('/facebook/callback', async (req, res) => {
	const {code} = req.query;
	
	if (!code) {
		return res.status(400).json({error: 'Authorization code not found'});
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
		
		const {id: facebookId, name, email, picture, birthday} = userResponse.data;
		const profilePictureUrl = picture?.data?.url;
		const response = await axios.get(profilePictureUrl, {responseType: 'arraybuffer'});
		const base64Image = Buffer.from(response.data).toString('base64');
		
		// Перевірка, чи є користувач у БД
		let user = await userModel.findOne({facebookId});
		
		if (!user) {
			user = new userModel({
				facebookId,
				login: name,
				email: email,
				avatar: base64Image
			});
			
			await user.save(); // Зберігаємо нового користувача до бази
		} else {
			// Якщо користувач існує, оновлюємо інформацію (наприклад, ім'я або електронна пошта)
			user.login = name;
			user.email = email;
			user.avatar = base64Image;
			await user.save();
		}
		
		// Генерація токенів
		const userId = user._id.toString();
		const tokens = await auth.createTokens({iss: userId});
		
		await Token.findOneAndUpdate(
			{userId},
			{refreshToken: tokens.refreshT, accessToken: tokens.accessT},
			{upsert: true}
		);
		
		const frontendRedirectUrl = `${FRONTEND_URL}/profile?accessT=${tokens.accessT}&refreshT=${tokens.refreshT}`;
		res.redirect(frontendRedirectUrl);
		
	} catch (error) {
		console.error('Помилка при авторизації через Facebook:', error.message);
		res.status(500).json({error: 'Помилка при авторизації через Facebook'});
	}
});


export default router;