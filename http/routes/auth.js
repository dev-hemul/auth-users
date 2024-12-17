import {Router} from 'express';
import * as auth from './../../controller/auth.js';
import createUser from './../../controller/usersController.js';
import userModel from '../../model/user-info.js';
import Token from '../../model/auth.js';
import onlyAuthMv from './mv/onlyAuth.js';
import Ajv from 'ajv';
import {userSchema} from '../helpers/userSchemaValidation.js';
import bcrypt from 'bcrypt';

const router = Router();
const ajv = new Ajv();
const validate = ajv.compile(userSchema);

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
    const tokenRecord = await Token.findOne({ userId: user._id });
    let accessT, refreshT;

    if (tokenRecord) {
        // Якщо refresh token існує, генеруємо новий access token
        const payload = { iss: user._id.toString() };
        const { token: newAccessT } = await auth.createAccessToken(payload);
        accessT = newAccessT;
        refreshT = tokenRecord.refreshToken;  // Берем старий refresh token
    }
	
	res.status(200).json({
        status: 'ok',
        message: { accessT, refreshT }
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


export default router;