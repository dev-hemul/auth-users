import {useGoogleLogin} from '@react-oauth/google';
import axios from 'axios';
import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom';
import {FcGoogle} from 'react-icons/fc';

const GoogleAuthButton = ({type}) => {
	const navigate = useNavigate();
	
	// Налаштування Google авторизації
	const login = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			try {
				const apiUrl =
					type === 'login'
						? process.env.REACT_APP_GOOGLE_LOGIN_URL
						: process.env.REACT_APP_GOOGLE_REGISTER_URL;
				
				const {data} = await axios.post(apiUrl, {
					token: tokenResponse.access_token
				});
				
				if (data.status === 'ok') {
					toast.success(
						type === 'register' ? 'Успішна реєстрація' : 'Успішний вхід'
					);
					
					localStorage.setItem('accessToken', data.message.accessT);
					localStorage.setItem('refreshToken', data.message.refreshT);
					
					navigate('/profile');
				} else {
					toast.error(
						type === 'register'
							? 'Помилка реєстрації через Google'
							: 'Помилка авторизації через Google'
					);
				}
			} catch (error) {
				console.error('Google Auth Error:', error.message);
				
				// Якщо помилка має відповідь від сервера з полем error
				if (error.response && error.response.data && error.response.data.error) {
					toast.error(error.response.data.error);  // Використовуємо повідомлення помилки із сервера
				} else {
					// У випадку іншого типу помилки, наприклад, якщо немає відповіді від сервера
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
			<FcGoogle size={23}/>
		</button>
	);
};

export default GoogleAuthButton;
