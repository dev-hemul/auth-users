import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import replaceToken from '../auth/replaceToken/replaceToken';
import { useTranslation } from "react-i18next";


const Profile = () => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [avatarUploaded, setAvatarUploaded] = useState(false);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false); // Статус загрузки
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken) {
      setError('Ви не маєте доступ до цієї сторінки. Вам потрібно залогінитись!');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_PROFILE;
        const { data } = await axios.post(
          `${apiUrl}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        setProfileData(data.payload);

        // Запуск оновлення токенів
        if (accessToken && refreshToken) {
          await replaceToken(accessToken, refreshToken);
        }
      } catch (error) {
        setError('Ваш токен більше не дійсний, залогіньтесь будь-ласка знову');
      }
    };

    fetchProfileData();
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  // Обработчик выбора файла
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  // Обработчик загрузки аватара
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const apiUrl2 = process.env.REACT_APP_CHANGE_AVATAR;
      console.log(apiUrl2);

      await axios.post(
        apiUrl2,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // После загрузки обновим данные профиля
      await fetchProfileData();
      setAvatarUploaded(true); // Скрываем кнопку загрузки
      setLoading(false);
    } catch (error) {
      console.log(error);
      setError('Ошибка при загрузке аватара');
      setLoading(false);
    }
  };

  const fetchProfileData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const apiUrl = process.env.REACT_APP_PROFILE;
    const { data } = await axios.post(
      `${apiUrl}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    setProfileData(data.payload);
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-md text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <a
            href="/"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            Повернутись на сторінку логіна
          </a>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 p-6 dark:bg-gray-900">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg mt-20 dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700 dark:text-white">
          {t("User_profile")}
        </h2>
        <div className="flex flex-col items-center">
          <div>
            {profileData.avatar && (
              <img
                className="mb-5"
                src={`${profileData.avatar}`}
                alt="User Avatar"
                style={{
                  display: 'block',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%'
                }}
              />
            )}
          </div>

          {!avatarUploaded && (
            <div className="mt-4">
              <input
                type="file"
                onChange={handleAvatarChange}
                accept="image/*"
                className="mb-4"
              />
              <button
                onClick={handleAvatarUpload}
                disabled={loading}
                className={`w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md ${loading ? 'bg-blue-300' : 'hover:bg-blue-600'}`}
              >
                {loading ? 'Завантаження...' : 'Завантажити аватар'}
              </button>
            </div>
          )}

          <p className="text-lg mb-4 dark:text-white">
            <span className="block font-medium text-gray-600 text-center dark:text-white">User ID:</span>{' '}
            <div className="flex justify-center">{profileData.uid}</div>
          </p>
          <p className="text-lg mb-4 dark:text-white">
            <span className="block font-medium text-gray-600 text-center dark:text-white">{t("Your_login")}:</span>{' '}
            <div className="flex justify-center">{profileData.login}</div>
          </p>
          <p className="text-lg mb-4 dark:text-white">
            <span className="block font-medium text-gray-600 text-center dark:text-white">{t("Your_e-mail")}:</span>{' '}
            <div className="flex justify-center">{profileData.email}</div>
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition"
        >
          {t("Exit")}
        </button>
      </div>
    </div>
  );
};

export default Profile;

