import React from 'react';

const Layout = ({ children }) => {
	return (
		<div className='flex-col justify-center py-2 px-1 bg-gray-200 h-screen'>
			{children} {/* Тут рендердуються дочірні елементи */}
		</div>
	);
}

export default Layout;