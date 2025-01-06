import userModel from '../model/user-info.js';
import bcrypt from 'bcrypt';

const createUser = async (login, password, email, provider) => {
  // Хешуємо пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Створюємо нового користувача
  const newUser = new userModel({
    login,
    password: hashedPassword,
    email,
    provider: provider
  });

  await newUser.save();
  
  return newUser;
};

export default createUser;