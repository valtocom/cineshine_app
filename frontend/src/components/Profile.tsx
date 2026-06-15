import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Profile.css';

interface User {
  id: number;
  email: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setBio(response.data.bio || '');
      setError('');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Не удалось загрузить профиль');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBio = async () => {
    try {
      const response = await api.put('/auth/profile', { bio });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setEditing(false);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Ошибка при сохранении');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error" style={{ textAlign: 'center', marginTop: '50px' }}>{error}</div>;
  if (!user) return null;

  const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?background=f5c518&color=000&bold=true&size=120&name=${encodeURIComponent(user.username)}`;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={avatarUrl} alt={user.username} />
        </div>
        <h1 className="profile-name">{user.username}</h1>
        <p className="profile-email">{user.email}</p>
        {user.created_at && (
          <p className="profile-joined">
            Присоединился {new Date(user.created_at).toLocaleDateString('ru-RU')}
          </p>
        )}
      </div>

      <div className="profile-bio-section">
        <div className="section-header">
          <h3>О себе</h3>
          {!editing && (
            <button className="edit-btn" onClick={() => setEditing(true)}>Редактировать</button>
          )}
        </div>
        {editing ? (
          <div className="bio-edit">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о своих любимых фильмах..."
              rows={4}
            />
            <div className="bio-actions">
              <button onClick={handleUpdateBio} className="save-btn">Сохранить</button>
              <button onClick={() => setEditing(false)} className="cancel-btn">Отмена</button>
            </div>
          </div>
        ) : (
          <p className="profile-bio">{user.bio || 'Пока ничего не рассказано о себе'}</p>
        )}
      </div>

      <div className="profile-actions">
        <button onClick={() => navigate('/movies')}>Фильмы</button>
        <button onClick={() => navigate('/recommendations')}>Рекомендации</button>
        <button onClick={() => navigate('/friends')}>Друзья</button>
        <button onClick={() => navigate('/feed')}>Лента</button>
        <button onClick={() => navigate('/watchlist')}>Буду смотреть</button>
        <button onClick={handleLogout} className="logout-btn">Выйти</button>
      </div>
    </div>
  );
};

export default Profile;
