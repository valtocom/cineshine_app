import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setEditBio(JSON.parse(storedUser).bio || '');
        }
        
        const response = await api.get('/auth/me');
        setUser(response.data);
        setEditBio(response.data.bio || '');
        localStorage.setItem('user', JSON.stringify(response.data));
        setError('');
      } catch (err: any) {
        console.error('Profile fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Не удалось загрузить профиль');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [navigate]);

  const handleUpdateBio = async () => {
    try {
      const response = await api.put('/auth/profile', { bio: editBio });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Не удалось обновить био');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error-icon">⚠️</div>
        <div className="error">{error}</div>
        <button onClick={() => navigate('/login')}>Войти снова</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <p>Пользователь не найден</p>
        <button onClick={() => navigate('/login')}>Войти</button>
      </div>
    );
  }

  const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?background=e50914&color=fff&bold=true&size=120&name=${encodeURIComponent(user.username)}`;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-avatar-wrapper">
          <img src={avatarUrl} alt={user.username} className="profile-avatar" />
        </div>
        <h1 className="profile-name">{user.username}</h1>
        <p className="profile-email">{user.email}</p>
        {user.created_at && (
          <p className="profile-joined">Присоединился {new Date(user.created_at).toLocaleDateString('ru-RU')}</p>
        )}
      </div>

      <div className="profile-bio-section">
        <div className="section-header">
          <h3>О себе</h3>
          {!isEditing && (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Редактировать
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="bio-edit">
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Расскажите о своих любимых фильмах..."
              rows={4}
            />
            <div className="bio-actions">
              <button onClick={handleUpdateBio} className="save-btn">Сохранить</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Отмена</button>
            </div>
          </div>
        ) : (
          <p className="profile-bio">{user.bio || 'Расскажите о себе...'}</p>
        )}
      </div>

      <div className="profile-actions">
        <button onClick={() => navigate('/movies')} className="action-btn">
          Фильмы
        </button>
        <button onClick={() => navigate('/recommendations')} className="action-btn">
          Рекомендации
        </button>
        <button onClick={() => navigate('/friends')} className="action-btn">
          Друзья
        </button>
        <button onClick={() => navigate('/feed')} className="action-btn">
          Лента
        </button>
        <button onClick={() => navigate('/watchlist')} className="action-btn">
          Буду смотреть
        </button>
        <button onClick={handleLogout} className="logout-btn">
          Выйти
        </button>
      </div>
    </div>
  );
};

export default Profile;
