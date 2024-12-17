import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

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
        /*console.log(data);*/
        setProfileData(data.payload);
      } catch (error) {
        setError('Ваш токен більше не дійсний, залогіньтесь будь-ласка знову');
      }
    };

    fetchProfileData();
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
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
    <div className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 p-6">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg mt-20">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Профіль користувача
        </h2>
        <p className="text-lg mb-4">
          <span className="font-medium text-gray-600">User ID:</span> {profileData.uid}
        </p>
        <p className="text-lg mb-4">
          <span className="font-medium text-gray-600">Ваш логін:</span> {profileData.login}
        </p>
        <p className="text-lg mb-4">
          <span className="font-medium text-gray-600">Ваш Пароль:</span> {profileData.email}
        </p>
        <button
          type="button"
          onClick={logout}
          className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition"
        >
          Вихід
        </button>
      </div>
    </div>
  );
};

export default Profile;
