import {useGoogleLogin} from '@react-oauth/google';
import axios from 'axios';
import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom';
import {FcGoogle} from 'react-icons/fc';
import {useTranslation} from "react-i18next";

const GoogleAuthButton = ({type}) => {
	const {t} = useTranslation();
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
						type === 'register' ? t("Successful_registration_google_toast") : t("Successfully_logged_toast")
					);
					
					localStorage.setItem('accessToken', data.message.accessT);
					localStorage.setItem('refreshToken', data.message.refreshT);
					
					navigate('/profile');
				} else {
					toast.error(
						type === 'register'
							? t("Google_registration_error_toast")
							: t("Google_authorization_error_toast")
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
							? t("Registration_error_toast")
							: t("Authorization_error_toast")
					);
				}
			}
		},
		onError: (error) => {
			console.error('Google Auth Error:', error);
			toast.error(
				type === 'register'
					? t("Google_registration_error_toast")
					: t("Google_authorization_error_toast")
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
