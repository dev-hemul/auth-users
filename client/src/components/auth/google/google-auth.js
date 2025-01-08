import {useGoogleLogin} from '@react-oauth/google';
import axios from 'axios';
import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom';
import {FcGoogle} from 'react-icons/fc';

const GoogleAuthButton = ({type}) => {
	const navigate = useNavigate();
	
	// Настройка Google авторизации
	const login = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			try {
				const apiUrl =
					type === 'login'
						? process.env.REACT_APP_GOOGLE_LOGIN_URL // URL для регистрации
						: process.env.REACT_APP_GOOGLE_REGISTER_URL; // URL для авторизации
				
				const {data} = await axios.post(apiUrl, {
					token: tokenResponse.access_token
				});
				
				if (data.status === 'ok') {
					toast.success(
						type === 'register' ? 'Успішна реєстрація' : 'Успішний вхід'
					);
					
					// Сохраняем токены в localStorage
					localStorage.setItem('accessToken', data.message.accessT);
					localStorage.setItem('refreshToken', data.message.refreshT);
					
					navigate('/profile'); // Перенаправление пользователя
				} else {
					toast.error(
						type === 'register'
							? 'Помилка реєстрації через Google'
							: 'Помилка авторизації через Google'
					);
				}
			} catch (error) {
				console.error('Google Auth Error:', error.message);
				
				// Если ошибка имеет ответ от сервера с полем error
				if (error.response && error.response.data && error.response.data.error) {
					toast.error(error.response.data.error);  // Используем сообщение ошибки с сервера
				} else {
					// В случае другого типа ошибки, например, если нет ответа от сервера
					toast.error(
						type === 'register'
							? 'Виникла помилка при реєстрації'
							: 'Виникла помилка при авторизації'
					);
				}
			}
		},
		onError: (error) => {
			console.error('Google Auth Error:', error);
			toast.error(
				type === 'register'
					? 'Помилка реєстрації через Google'
					: 'Помилка авторизації через Google'
			);
		}
	});
	
	return (
		<button
			type="button"
			onClick={login}
			className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md  hover:bg-gray-100"
			title={type === 'register' ? 'Реєстрація через Google' : 'Вхід через Google'}
		>
			<FcGoogle size={25}/>
		</button>
	);
};

export default GoogleAuthButton;
