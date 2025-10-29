import fs from 'fs/promises';
import path from 'path';
import jws from 'jws';
import Token from './../model/auth.js';
import { nanoid } from 'nanoid';

const alg = 'RS512';
const lifedur = 3 * 60 * 1000;  // 3 хвилин

// Берём путь к корню проекта
const rootDir = path.resolve();

// Если есть переменные окружения — берём их, иначе используем относительный путь
const privateKeyPath = process.env.PRIVATE_KEY_PATH
    ? path.resolve(process.env.PRIVATE_KEY_PATH)
    : path.join(rootDir, 'keys', 'privateKey.pem');

const publicKeyPath = process.env.PUBLIC_KEY_PATH
    ? path.resolve(process.env.PUBLIC_KEY_PATH)
    : path.join(rootDir, 'keys', 'publicKey.pem');

const priv = await fs.readFile(privateKeyPath, 'utf8');
const pub = await fs.readFile(publicKeyPath, 'utf8');

// Функція для створення access token
const createAccessToken = (payload) => {
    payload.exp = payload.exp || Date.now() + lifedur;
    const jti = nanoid();
    payload.jti = jti;

    const token = jws.sign({
        header: { alg: alg },
        payload,
        secret: priv,
    });

    return { token, jti };
};

// Функція для створення refresh token
const createRefreshToken = async (jti, userId, accessT) => {
    const existingToken = await Token.findOne({ userId });  // Ищем существующий токен по userId

    if (existingToken) {
        // Якщо токен вже існує, оновлюємо його
        existingToken.accessToken = accessT;  // Оновлюємо accessToken
        existingToken.refreshToken = nanoid();  // Створюємо новий refreshToken
        await existingToken.save();  // Зберігаємо оновлений запис
        return existingToken.refreshToken;  // Повертаємо оновлений refreshToken
    } else {
        // Якщо токен не знайдено, створюємо новий
        const token = nanoid();
        await Token.create({
            userId: userId,
            accessToken: accessT,
            refreshToken: token
        });
        return token;  // Повертаємо новий refreshToken
    }
};

// Функція для створення обох токенів
const createTokens = async (payload) => {
    try {
        const { token: accessT, jti } = createAccessToken(payload);
        const refreshT = await createRefreshToken(jti, payload.iss, accessT);  // передаємо payload.iss як userId

        if (!accessT || !refreshT) {
             console.error("Access Token or Refresh Token is missing");
              throw new Error('Access or refresh token is missing');
        }

        await Token.updateOne({ jti }, { $set: { accessToken: accessT, refreshToken: refreshT } });

        return { accessT, refreshT };
    } catch (error) {
        console.error('Error while creating tokens:', error);
        throw new Error('Failed to create tokens');
    }
};

// Функція для заміни токенів
const replaceTokens = async (accessT, refreshT) => {
    const payload = getPayloadAccessT(accessT);
    const { jti } = payload;

    const token = await Token.findOne({ refreshToken: refreshT });

    if (!token) {
        console.warn('Refresh token not found in the database.');
        return false;
    }

    // Видалення старого токена після успішного створення нового
    await Token.deleteOne({ jti, refreshToken: refreshT });

    // Видалення exp з payload
    delete payload.exp;

    return createTokens(payload);
};

// Функція для відкликання refresh токенів по issuer
const withdrawRefreshTokensByIssuer = async (iss) => {
    await Token.deleteMany({ userId: iss });
};

// Функція для видалення refresh токена
const removeRefreshT = async (refreshT) => {
    const token = await Token.findOneAndDelete({ refreshToken: refreshT });
    return token ? true : false;
};

// Функція для вилучення payload з access token
const getPayloadAccessT = (accessT) => {
    const result = jws.decode(accessT);
    if (!result) {
        throw new Error('Invalid access token');
    }
    return JSON.parse(result.payload);
};

// Функція перевірки підпису access token
const verifySign = (accessT) => {
    const result = jws.verify(accessT, alg, pub);
    return result;
};

// Функція перевірки стану access token
const verifyAccessT = (accessT) => {
    const result = verifySign(accessT);
    if (!result) {
        return 'bad_sign';
    }

    const { exp } = getPayloadAccessT(accessT);
    if (exp < Date.now()) {
        return 'expired';
    }

    return true;
};

export {
    createAccessToken,
    createTokens,
    replaceTokens,
    getPayloadAccessT,
    withdrawRefreshTokensByIssuer,
    removeRefreshT,
    verifyAccessT,
    verifySign,
};
