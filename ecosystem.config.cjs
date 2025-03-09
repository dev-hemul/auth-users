module.exports = {
  apps: [
    {
      name: 'auth-users', // Имя вашего приложения
      script: 'www.js', // Входной файл вашего приложения
      env: {
        NODE_ENV: 'development',
        PRIVATE_KEY_PATH: 'keys/privateKey.pem',
        PUBLIC_KEY_PATH: 'keys/publicKey.pem' // Локальный путь
      },
      env_production: {
        NODE_ENV: 'production',
        DB_URL: 'mongodb+srv://devhemulll:88888888@cluster0.ah4xy.mongodb.net/User?retryWrites=true&w=majority&appName=Cluster0',
        PRIVATE_KEY_PATH: '/var/www/auth-users/keys/privateKey.pem',
        PUBLIC_KEY_PATH: '/var/www/auth-users/keys/publicKey.pem', // Абсолютный путь на сервере
        FB_CLIENT_ID: '1161748475475183',
        FB_CLIENT_SECRET: 'b9da926ed8e62712076b1561ce52cbac',
        FB_REDIRECT_FRONT: 'https://evgeniiviter.site/',
        CLOUDINARY_CLOUD_NAME: 'drwoup9w6',
        CLOUDINARY_API_KEY: '635826323163627',
        CLOUDINARY_API_SECRET: '4ECmLisWiUqh3kz_G-94kBx-4kg'
      },
    },
  ],
};