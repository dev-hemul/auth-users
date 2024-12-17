import React, {useState} from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [isResetMode, setIsResetMode] = useState(false);
	const [login, setLogin] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	
	const navigate = useNavigate();
	

	const getTokens = async (login, password) => {
		// Перевіряємо чи є токени в localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
		
		 if (accessToken && refreshToken) {
      toast.info('Ви вже авторизовані');
			 navigate('/profile'); // Редирект на профіль
    }
		 
		try {
			
			 const apiUrl = process.env.REACT_APP_LOGIN;
			
			const {data} = await axios.post(`${apiUrl}`, {
				login,
				password
			});

			if (data.status === 'ok') {
				toast.success('Ви успішно залогінились і отримали токен!');
				localStorage.setItem('accessToken', data.message.accessT);
        localStorage.setItem('refreshToken', data.message.refreshT);
				 navigate('/profile'); // Редирект на профіль після успішного входу
			}
		} catch (error) {
			console.error('Error during login:', error.message);
			if (error.response) {
        // Виймаємо повідомлення про помилку
        const errorMessage = error.response.data.error;

        // Перевіряємо повідомлення та виводимо відповідні повідомлення
        if (errorMessage === 'Invalid login') {
            toast.error('Невірний логін!');
        } else if (errorMessage === 'Invalid password') {
            toast.error('Невірний пароль!');
        } else if (errorMessage === 'Invalid email') {
					toast.info('Логін і пароль мають бути від 3 символів!');
        }else {
            toast.error(`Помилка: ${errorMessage || 'Сталося щось дивне...'}`);
        }
    }
			return null;
		}
	};
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isLoginMode) {
			try {
				const tokens = await getTokens(login, password);
				if (tokens) {
					console.log('Received tokens:', tokens);
				}
			} catch (error) {
				console.error('Error during login:', error);
			}
		} else {
			// Реєстрація
			
			const apiUrl = process.env.REACT_APP_REGISTRATION;
			try {
				const {data} = await axios.post(`${apiUrl}`, {
					login,
					password,
					email
				});
				console.log(data);
				console.log(data.message);
				if (data.status === 'ok') {
					// Зберігаю оба токена в local storage
					const {accessT: accessToken, refreshT: refreshToken} = data.message;
					localStorage.setItem('accessToken', accessToken);
					localStorage.setItem('refreshToken', refreshToken);
					toast.success('Реєстрація успішна! Тепер увійдіть.');
					setIsLoginMode(true);
				}
			} catch (error) {
				console.error('Error during registration:', error.message);
				toast.error('Такий логін або e-mail вже існує!');
			}
		}
	};
	
	const handlePasswordReset = async (e) => {
  e.preventDefault();
  try {
		const apiUrl = process.env.REACT_APP_FORGOT_PASSWORD;
    const { data } = await axios.post(`${apiUrl}`, { email });
	  console.log(data)
    if (data.status === 'ok') {
      toast.success('Інструкція з відновлення паролю відправлена на вашу пошту.');
      setIsResetMode(false);
      setIsLoginMode(true);
    } else {
      toast.error('Не вдалося відправити інструкцію.');
    }
  } catch (error) {
    console.error('Error during password reset:', error.message);
    toast.error('Сталася помилка під час запиту.');
  }
};
	
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div
				className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
				{!isResetMode ? (
					<>
						<h2 className="text-2xl font-bold text-center text-gray-800">
							{isLoginMode ? 'Увійти в систему' : 'Реєстрація'}
						</h2>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div>
								<label htmlFor="login"
								       className="block text-sm font-medium text-gray-700">
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
									<label htmlFor="email"
									       className="block text-sm font-medium text-gray-700">
										Email
									</label>
									<input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										placeholder='В форматі &quot;test@gmail.com&quot;'
									/>
								</div>
							)}
							<div>
								<label htmlFor="password"
								       className="block text-sm font-medium text-gray-700">
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
								className="w-full py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md focus:outline-none text-sm font-medium"
							>
								{isLoginMode ? 'Увійти' : 'Зареєструватись'}
							</button>
						</form>
						<div className="text-sm text-center">
							{isLoginMode ? (
								<>
									<p className="mb-2">
										Забули пароль?{' '}
										<button
											type="button"
											onClick={() => {
												setIsResetMode(true);
												setEmail('');
											}}
											className="text-red-600 hover:text-red-400 font-medium"
										>
											Відновити
										</button>
									</p>
									<p>
										Немає аккаунту?{' '}
										<button
											type="button"
											onClick={() => setIsLoginMode(false)}
											className="text-green-600 hover:text-green-400 font-medium"
										>
											Зареєструватися
										</button>
									</p>
								</>
							) : (
								<p>
									Вже є аккаунт?{' '}
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
						<h2
							className="text-2xl font-bold text-center text-gray-800">Відновлення
							паролю</h2>
						<form className="space-y-4" onSubmit={handlePasswordReset}>
							<div>
								<label htmlFor="email"
								       className="block text-sm font-medium text-gray-700">
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
							Повернутися до входу
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default LoginPage;
