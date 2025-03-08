import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import GoogleAuthButton from '../google/google-auth';
import FacebookAuthButton from '../facebook/facebook-auth';
import {IoMoonOutline, IoMoon} from "react-icons/io5";
import {useTranslation} from "react-i18next";
import {useSelector} from "react-redux";

const LoginPage = ({toggleTheme, theme, handleLanguageChange}) => {
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [isResetMode, setIsResetMode] = useState(false);
	const [login, setLogin] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const navigate = useNavigate();
	const {t} = useTranslation();
	const lang = useSelector((state) => state.language.lang);
	
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		
		if (code) {
			// Відправляємо 'code' на сервер
			const sendCodeToServer = async () => {
				try {
					const response = await axios.post(process.env.REACT_APP_FACEBOOK_REDIRECT, {
						code
					});
					
					if (response.data.status === "ok") {
						const {accessT, refreshT} = response.data.message;
						
						// Зберігаємо токени в localStorage
						localStorage.setItem("accessToken", accessT);
						localStorage.setItem("refreshToken", refreshT);
						
						// Перенаправляємо користувача, на сторінку профілю
						navigate("/profile");
					} else {
						console.error("Помилка авторизації через Facebook");
					}
				} catch (error) {
					console.error("Помилка при запиті на сервер:", error.message);
				}
			};
			
			sendCodeToServer();
			
			// Очищаємо URL від параметрів
			window.history.replaceState({}, document.title, "/");
		}
	}, [navigate]);
	
	const getTokens = async (login, password) => {
		
		
		const accessToken = localStorage.getItem('accessToken');
		const refreshToken = localStorage.getItem('refreshToken');
		
		if (accessToken && refreshToken) {
			toast.info(t("You_are_already_logged_toast"));
			navigate('/profile');
			return;
		}
		
		try {
			const apiUrl = process.env.REACT_APP_LOGIN;
			const {data} = await axios.post(`${apiUrl}`, {login, password});
			
			if (data.status === 'ok') {
				toast.success(t("Successfully_logged_toast"));
				localStorage.setItem('accessToken', data.message.accessT);
				localStorage.setItem('refreshToken', data.message.refreshT);
				navigate('/profile');
			}
		} catch (error) {
			console.error('Помилка при вході:', error.message);
			if (error.response) {
				const errorMessage = error.response.data.error;
				if (errorMessage === 'Invalid login') {
					toast.error(t("Incorrect_login_toast"));
				} else if (errorMessage === 'Invalid password') {
					toast.error(t("Incorrect_password"));
				} else if (errorMessage === 'Invalid email') {
					toast.info(t("Login_and_password_must_be_at_least_3_characters_long_toast"));
				} else {
					toast.error(`Помилка: ${errorMessage || t("Something_went_wrong_toast")}`);
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
				const {data} = await axios.post(`${apiUrl}`, {login, password, email});
				if (data.status === 'ok') {
					const {accessT: accessToken, refreshT: refreshToken} = data.message;
					localStorage.setItem('accessToken', accessToken);
					localStorage.setItem('refreshToken', refreshToken);
					toast.success(t("Registration_successful_toast"));
					setIsLoginMode(true);
				}
			} catch (error) {
				console.error('Помилка при реєстрації', error.message);
				toast.error(t("This username or email address is already registered!"));
			}
		}
	};
	
	const handlePasswordReset = async (e) => {
		e.preventDefault();
		try {
			const apiUrl = process.env.REACT_APP_FORGOT_PASSWORD;
			const {data} = await axios.post(`${apiUrl}`, {email});
			if (data.status === 'ok') {
				toast.success('Інструкцію з відновлення надіслана на вашу пошту');
				setIsResetMode(false);
				setIsLoginMode(true);
			} else {
				toast.error(t("Failed_to_send_instructions_toast"));
			}
		} catch (error) {
			console.error('Помилка відновлення пароля:', error.message);
			toast.error(t("An_error_occurred_during_the_request_toast"));
		}
	};
	
	return (
		<div
			className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-700 ease-in-out">
			<div
				className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 transition-colors duration-800 ease-in-out">
				{!isResetMode ? (
					<>
						<div className="flex justify-between">
							<div>
								<button
									className="text-gray-800 dark:text-white transition-colors duration-1000 ease-in-out"
									type="button"
									onClick={toggleTheme}>
									{theme === "dark" ? <IoMoon size="20"/> :
										<IoMoonOutline size="20"/>}
								</button>
							</div>
							<div>
								<button
									className="text-gray-800 dark:text-white transition-colors duration-1000 ease-in-out"
									type="button"
									onClick={handleLanguageChange}
								>
									<div className="relative hover:scale-150 transition duration-700 ease-in-out">
										{lang === 'en' ? (
											<span
												className="fi fi-ua transition-all duration-700 ease-in-out opacity-100"></span>
										) : (
											<span
												className="fi fi-gb transition-all duration-700 ease-in-out opacity-100"></span>
										)}
									</div>
								</button>
							</div>
						</div>
						<h2
							className="text-2xl font-bold text-center text-gray-800 dark:text-white transition-colors duration-1000 ease-in-out">
							{isLoginMode ? t("Log_in_in_system") : t("Register")}
						</h2>
						<form onSubmit={handleSubmit}>
							<div className="mb-4">
								<label htmlFor="login"
								       className="block text-sm font-medium text-gray-800 dark:text-white transition-colors duration-1000 ease-in-out">
									{t("Login")}
								</label>
								<input
									id="login"
									type="text"
									value={login}
									onChange={(e) => setLogin(e.target.value)}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-800 dark:text-white"
									placeholder={t("Login_placeholder")}
								/>
							</div>
							{!isLoginMode && (
								<div className="mb-4">
									<label htmlFor="email"
									       className="block text-sm font-medium text-gray-700 dark:text-white transition-colors duration-1000 ease-in-out ">
										Email
									</label>
									<input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-800 dark:text-white"
										placeholder={t("Email_placeholder")}
									/>
								</div>
							)}
							<div className="mb-10">
								<label htmlFor="password"
								       className="block text-sm font-medium text-gray-700 dark:text-white transition-colors duration-1000 ease-in-out">
									{t("Password")}
								</label>
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-800 dark:text-white"
									placeholder={t("Password_placeholder")}
								/>
							</div>
							<button
								type="submit"
								className="w-full py-3 px-4 text-white bg-emerald-500 hover:bg-emerald-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md focus:outline-none text-sm font-medium"
							>
								{isLoginMode ? t("Log_in") : t("Register")}
							</button>
						</form>
						
						<div className="flex gap-5 justify-center flex-wrap">
							<div>
								{isLoginMode ? <GoogleAuthButton type="login"/> :
									<GoogleAuthButton type="register"/>}
							
							</div>
							<div>
								<FacebookAuthButton/>
							</div>
						
						</div>
						<div className="text-sm text-center">
							{isLoginMode ? (
								<>
									<p
										className="mb-2 dark:text-white transition-colors duration-1000 ease-in-out">
										{t("Remember_password")}{' '}
										<button
											type="button"
											onClick={() => {
												setIsResetMode(true);
												setEmail('');
											}}
											className="text-red-600 hover:text-red-500 hover:underline font-medium"
										>
											{t("Restore")}
										</button>
									</p>
									<p
										className="dark:text-white transition-colors duration-1000 ease-in-out">
										{t("Have_an_account")}{' '}
										<button
											type="button"
											onClick={() => setIsLoginMode(false)}
											className="text-green-600 hover:text-green-500 hover:underline font-medium"
										>
											{t("Register")}
										</button>
									</p>
								</>
							) : (
								<p
									className="dark:text-white transition-colors duration-1000 ease-in-out">
									{t("Already_have_an_account")}{' '}
									<button
										type="button"
										onClick={() => setIsLoginMode(true)}
										className="text-green-600 hover:text-green-500 hover:underline font-medium "
									>
										{t("Log_in")}
									</button>
								</p>
							)}
						</div>
					</>
				) : (
					<>
						<h2
							className="text-2xl font-bold text-center text-gray-800 dark:text-white">
							{t("Password_recovery")}
						</h2>
						<form className="space-y-4" onSubmit={handlePasswordReset}>
							<div>
								<label htmlFor="email"
								       className="block text-sm font-medium text-gray-700 dark:text-white">
									Email
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
								/>
							</div>
							<button
								type="submit"
								className="w-full py-2 px-4 text-white  bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md focus:outline-none text-sm font-medium"
							>
								{t("Restore")}
							</button>
						</form>
						<button
							type="button"
							onClick={() => setIsResetMode(false)}
							className="w-full mt-4 hover:underline text-sm dark:text-white">
							
							{t("Return_to_login")}
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default LoginPage;
