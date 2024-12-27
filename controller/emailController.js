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
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #4CAF50; text-align: center;">Відновлення пароля</h2>
          <p>Вітаємо!</p>
          <p>Ви отримали це повідомлення, тому що на ваш акаунт було запитано зміну пароля.</p>
          <p>Щоб відновити пароль, перейдіть за наступним посиланням:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Скинути пароль</a>
          </p>
          <p><strong>Увага:</strong> посилання дійсне лише протягом 1 години. Якщо ви не запитували зміну пароля, просто ігноруйте це повідомлення.</p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 14px; color: #777;">Це автоматичне повідомлення, відповіді на нього не обробляються.</p>
        </div>
      `,
    });
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Помилка відправки email');
  }
};


export default sendResetPasswordEmail;
