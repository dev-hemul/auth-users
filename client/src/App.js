import Layout from './components/layout/layout';
import Login from './components/auth/login/index';
import Profile from './components/profile/index';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ResetPassword from './components/resetPassword/index';
import './App.css';
import { ToastContainer } from 'react-toastify';
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { toggleTheme } from "./slice/themeSlice";
import {useTranslation} from "react-i18next";
import {setLanguage} from "./slice/languageSlice";
import i18n from "./i18";

function App() {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const lang = useSelector((state) => state.language.lang);
  const theme = useSelector((state) => state.theme.theme);
  
  useEffect(() => {
    // добавляем или удаляем класс dark в зависимости от текущей темы
    document.body.classList.toggle('dark', theme === "dark");
    document.body.classList.toggle('light', theme !== "dark"); // добавляем или удаляем класс light
  }, [theme]);  // зависимость от состояния темы
  
  useEffect(() => {
    // Когда язык меняется в Redux, обновляем язык в i18n
    i18n.changeLanguage(lang);
  }, [lang]); // Добавляем зависимость от lang, чтобы синхронизировать язык

  const handleLanguageChange = () => {
    const newLang = lang === 'en' ? 'uk' : 'en';  // Переключаем между английским и украинским
    dispatch(setLanguage(newLang));  // Обновляем состояние языка в Redux
  };

  return (
    <Router>
      <div>
        <Layout>
          <Routes>
            {/* Роут для логина */}
            <Route path="/" element={<Login theme={theme} toggleTheme={() => dispatch(toggleTheme())} handleLanguageChange={handleLanguageChange}/>} />
            {/* Защищенный роут для профиля */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
          <ToastContainer />
        </Layout>
      </div>
    </Router>
  );
}

export default App;
