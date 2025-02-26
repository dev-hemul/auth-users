import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {GoogleOAuthProvider} from '@react-oauth/google';
import {Provider} from "react-redux";
import {store} from "./store";
import "./i18.js";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID_GOOGLE;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<Provider store={store}>
		<GoogleOAuthProvider clientId={CLIENT_ID}>
			<App/>
		</GoogleOAuthProvider>
	</Provider>
);
