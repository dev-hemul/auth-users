  import React, { useState } from 'react';
  import axios from 'axios';
  import { toast } from 'react-toastify';
  import { useNavigate } from 'react-router-dom';
  import 'react-toastify/dist/ReactToastify.css';
  import GoogleAuthButton from '../google/google-auth';
  import FacebookAuthButton from '../facebook/facebook-auth';
  
  const LoginPage = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isResetMode, setIsResetMode] = useState(false);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
  
    const navigate = useNavigate();
  
    const getTokens = async (login, password) => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
  
      if (accessToken && refreshToken) {
        toast.info('Ви вже авторизовані');
        navigate('/profile');
        return;
      }
  
      try {
        const apiUrl = process.env.REACT_APP_LOGIN;
        const { data } = await axios.post(`${apiUrl}`, { login, password });
  
        if (data.status === 'ok') {
          toast.success('Ви успішно увійшли в систему!');
          localStorage.setItem('accessToken', data.message.accessT);
          localStorage.setItem('refreshToken', data.message.refreshT);
          navigate('/profile');
        }
      } catch (error) {
        console.error('Помилка при вході:', error.message);
        if (error.response) {
          const errorMessage = error.response.data.error;
          if (errorMessage === 'Invalid login') {
            toast.error('Не правильний логін!');
          } else if (errorMessage === 'Invalid password') {
            toast.error('Не правильний пароль!');
          } else if (errorMessage === 'Invalid email') {
            toast.info('Логін і пароль мають бути від 3 символів!');
          } else {
            toast.error(`Помилка: ${errorMessage || 'Щось пішло не так...'}`);
          }
        }
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isLoginMode) {
        await getTokens(login, password);
      } else {
        const apiUrl = process.env.REACT_APP_REGISTRATION;
        try {
          const { data } = await axios.post(`${apiUrl}`, { login, password, email });
          if (data.status === 'ok') {
            const { accessT: accessToken, refreshT: refreshToken } = data.message;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            toast.success('Реєстрація успішна! Тепер залогіньтесь!');
            setIsLoginMode(true);
          }
        } catch (error) {
          console.error('Помилка при реєстрації', error.message);
          toast.error('Такий логін або e-mail вже зареєстрований!');
        }
      }
    };
  
    const handlePasswordReset = async (e) => {
      e.preventDefault();
      try {
        const apiUrl = process.env.REACT_APP_FORGOT_PASSWORD;
        const { data } = await axios.post(`${apiUrl}`, { email });
        if (data.status === 'ok') {
          toast.success('Інструкцію з відновлення надіслана на вашу пошту');
          setIsResetMode(false);
          setIsLoginMode(true);
        } else {
          toast.error('Не вдалося надіслати інструкцію.');
        }
      } catch (error) {
        console.error('Помилка відновлення пароля:', error.message);
        toast.error('Виникла помилка при запиті.');
      }
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          {!isResetMode ? (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                {isLoginMode ? 'Увійти в систему' : 'Реєстрація'}
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="login" className="block text-sm font-medium text-gray-700">
                    Логін
                  </label>
                  <input
                    id="login"
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Логін має бути від 3 символів"
                  />
                </div>
                {!isLoginMode && (
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder='В форматі "test@gmail.com"'
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Пароль має бути від 3 символів"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 text-white bg-emerald-500 hover:bg-emerald-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md focus:outline-none text-sm font-medium"
                >
                  {isLoginMode ? 'Увійти' : 'Зареєструватись'}
                </button>
              </form>
              
              <div className="flex gap-5 justify-center flex-wrap">
                <div>
                  <GoogleAuthButton />
                </div>
              <div>
                <FacebookAuthButton />
              </div>
              
            </div>
              <div className="text-sm text-center">
                {isLoginMode ? (
                  <>
                    <p className="mb-2">
                      Забули свій пароль?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetMode(true);
                          setEmail('');
                        }}
                        className="text-red-600 hover:text-red-500 hover:underline font-medium"
                      >
                        Відновити
                      </button>
                    </p>
                    <p>
                      Немає облікового запису?{' '}
                      <button
                        type="button"
                        onClick={() => setIsLoginMode(false)}
                        className="text-green-600 hover:text-green-500 hover:underline font-medium"
                      >
                        Зареєструватись
                      </button>
                    </p>
                  </>
                ) : (
                  <p>
                    Вже є акаунт?{' '}
                    <button
                      type="button"
                      onClick={() => setIsLoginMode(true)}
                      className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Увійти
                    </button>
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">Відновлення пароля</h2>
              <form className="space-y-4" onSubmit={handlePasswordReset}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md focus:outline-none text-sm font-medium"
                >
                  Відновити
                </button>
              </form>
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="w-full mt-4 text-indigo-600 hover:underline text-sm"
              >
                Повернутись до входу
              </button>
            </>
          )}
        </div>
      </div>
    );
  };
  
  export default LoginPage;
