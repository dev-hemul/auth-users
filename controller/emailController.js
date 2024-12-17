import nodemailer from 'nodemailer';

// Налаштуємо transporter для надсилання пошти через Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    user: 'evgenij.nechujveter@gmail.com', // Ваш email
    pass: 'katlnyqvsuziceny',  // Ваш пароль або пароль застосунку
  },
});

// Функція для надсилання листа з інструкціями відновлення пароля
const sendResetPasswordEmail = async (email, resetLink) => {
  try {
    const info = await transporter.sendMail({
      from: '"Зміна пароля" <your-email@gmail.com>', // От кого
      to: email, // Кому
      subject: 'Відновлення пароля',
      html: `Перейдіть за наступним посиланням для відновлення пароля: <a href="${resetLink}">Скинути пароль</a>`, // Тело письма с ссылкой для сброса пароля
    });
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Помилка відправки email');
  }
};

export default sendResetPasswordEmail;
