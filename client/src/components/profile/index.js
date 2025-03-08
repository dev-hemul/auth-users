import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import replaceToken from '../auth/replaceToken/replaceToken';
import { useTranslation } from 'react-i18next';
import profile from '../../accets/profile.png';
import { GoPencil } from 'react-icons/go';

const Profile = () => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
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
              Authorization: `Bearer ${accessToken}`,
            },
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

  // Обробник завантаження аватару
  const handleAvatarUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const apiUrl2 = process.env.REACT_APP_CHANGE_AVATAR;

      await axios.post(apiUrl2, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
			
      await fetchProfileData();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError('Помилка при завантаженні аватара');
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
          Authorization: `Bearer ${accessToken}`,
        },
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
          {t('User_profile')}
        </h2>
        <div className="flex flex-col items-center">
          <div className="relative w-[100px] h-[100px] flex items-center justify-center">
            <img
              className="mb-5"
              src={profileData.avatar || profile}
              alt="profile"
              width="100"
              height="100"
              style={{ borderRadius: '50%' }}
            />

            <label
              htmlFor="avatarInput"
              className="absolute -top-2 -right-1 bg-gray-700 text-white p-2 rounded-full cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
            >
              <GoPencil size={14} />
            </label>
          </div>

          <div className="mt-4">
            <input
              type="file"
              id="avatarInput"
              onChange={(e) => handleAvatarUpload(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />
          </div>

          <p className="text-lg mb-4 dark:text-white">
            <span className="block font-medium text-gray-600 text-center dark:text-white">
              User ID:
            </span>{' '}
            <div className="flex justify-center">{profileData.uid}</div>
          </p>
          <p className="text-lg mb-4 dark:text-white">
            <span className="block font-medium text-gray-600 text-center dark:text-white">
              {t('Your_login')}:
            </span>{' '}
            <div className="flex justify-center">{profileData.login}</div>
          </p>
          <p className="text-lg mb-4 dark:text-white">
            <span className="block font-medium text-gray-600 text-center dark:text-white">
              {t('Your_e-mail')}:
            </span>{' '}
            <div className="flex justify-center">{profileData.email}</div>
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition"
        >
          {t('Exit')}
        </button>
      </div>
    </div>
  );
};

export default Profile;
