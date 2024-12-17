import {useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const ResetPassword = () => {
	const navigate = useNavigate();
	const {token} = useParams();
	const [newPassword, setNewPassword] = useState('');
	const [error, setError] = useState(null);
	const [message, setMessage] = useState('');
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		
		try {
			const apiUrl = process.env.REACT_APP_RESET_PASSWORD;
			const response = await axios.post(`${apiUrl}`, {
				token,
				newPassword
			});
			
			if (response.data.message) {
				setMessage(response.data.message);
				setTimeout(() => {
					navigate('/');
				}, 2000);
			}
		} catch (err) {
			setError(err.response ? err.response.data.error : 'Сталась помилка');
		}
	};
	
	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-100">
			<div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-2xl font-semibold text-center mb-6">Заміна
					пароля</h2>
				
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label htmlFor="newPassword"
						       className="block text-sm font-medium text-gray-700">
							Новий пароль
						</label>
						<input
							type="password"
							id="newPassword"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
							className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
					</div>
					
					{error && <div
						className="text-red-500 text-sm text-center mb-4">{error}</div>}
					{message && <div
						className="text-green-500 text-sm text-center mb-4">{message}</div>}
					
					<button
						type="submit"
						className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						Змінити пароль
					</button>
				</form>
			</div>
		</div>
	);
};

export default ResetPassword;
