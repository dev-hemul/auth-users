import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import {useTranslation} from "react-i18next";

const Layout = ({ children }) => {
  const {t} = useTranslation();
  const language = useSelector((state) => state.language.language);
  
	
	return (
		<div className='flex-col justify-center  h-screen'>
			
			
			
			{children} {/* Тут рендердуються дочірні елементи */}
		</div>
	);
}

export default Layout;