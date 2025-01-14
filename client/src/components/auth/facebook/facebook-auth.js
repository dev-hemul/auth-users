import {FaFacebookF} from "react-icons/fa6";

const FacebookAuthButton = () => {
	
	const startFacebookAuth = () => {
    const FACEBOOK_CLIENT_ID = process.env.REACT_APP_CLIENT_ID_FACEBOOK;
    const REACT_APP_FACEBOOK_REDIRECT = process.env.REACT_APP_MAIN;
		window.location.href = `https://www.facebook.com/v15.0/dialog/oauth?client_id=1161748475475183&redirect_uri=${REACT_APP_FACEBOOK_REDIRECT}&scope=public_profile`;
	}
	
	
	return (
		<div>
			<button
				onClick={startFacebookAuth}
				className="flex items-center gap-2 border border-gray-300 px-4 py-2 bg-blue-700 rounded-md hover:bg-blue-600"
			>
				<FaFacebookF className="text-white" size={22}/>
			</button>
		</div>
	);
};

export default FacebookAuthButton;
