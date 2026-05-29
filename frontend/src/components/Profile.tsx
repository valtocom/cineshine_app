import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMe();
        setUser(response.data);
      } catch (err) {
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return <div>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
      <h2>Профиль</h2>
      <p><strong>Имя:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <button onClick={() => navigate('/movies')} style={{ padding: '10px 20px', marginRight: 10 }}>Фильмы</button>
      <button onClick={() => navigate('/recommendations')} style={{ padding: '10px 20px', marginRight: 10 }}>Рекомендации</button>
      <button onClick={handleLogout} style={{ padding: '10px 20px' }}>Выйти</button>
    </div>
  );
};

export default Profile;
