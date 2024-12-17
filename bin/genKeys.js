import { generateKeyPairSync } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Отримання шляху до поточної директорії (аналог __dirname для ES-модулів)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Шлях до папки keys у кореневій директорії проєкту
const keysDir = path.join(__dirname, '..', 'keys');

// Створення директорії, якщо вона не існує
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Генерація пари ключів
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048, // Довжина ключа у бітах
  publicKeyEncoding: {
    type: 'spki', // Стандарт для публічного ключа
    format: 'pem', // Формат PEM
  },
  privateKeyEncoding: {
    type: 'pkcs8', // Стандарт для приватного ключа
    format: 'pem', // Формат PEM
  },
});

// Запис публічного ключа у файл
fs.writeFileSync(path.join(keysDir, 'publicKey.pem'), publicKey);

// Запис приватного ключа в файл
fs.writeFileSync(path.join(keysDir, 'privateKey.pem'), privateKey);

console.log('Ключі успішно згенеровані!');
