import {Router} from 'express';
import onlyAuthMv from './mv/onlyAuth.js';
import User from './../../model/user-info.js';


const router = Router();

router.post('/profile', onlyAuthMv, async (req, res) => {
  const { uid } = res.locals;

  try {
    const user = await User.findById(uid).select('login email'); // Шукаємо користувача по UID
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // Користувача не знайдено
    }

    // Відправляємо успішну відповідь з login та email
    return res.json({
      status: 'ok',
      payload: {
        uid,
        login: user.login,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error); // Логуємо помилку
    return res.status(500).json({ message: 'Server error' }); // Відповідь при помилці
  }
});

export default router;