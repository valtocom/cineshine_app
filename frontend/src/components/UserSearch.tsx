import React, { useState } from 'react';
import api from '../services/api';
import './Friends.css';

interface User {
  id: number;
  username: string;
  email: string;
}

const UserSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const searchUsers = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await api.get(`/users/search?q=${query}`);
      setUsers(response.data);
      if (response.data.length === 0) {
        setMessage('Пользователи не найдены');
      }
    } catch (err) {
      setMessage('Ошибка при поиске');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: number) => {
    try {
      await api.post('/friends/request', { friendId: userId });
      setMessage('Заявка отправлена!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Ошибка при отправке заявки');
    }
  };

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h2>Поиск пользователей</h2>
        <p className="friends-subtitle">Найдите друзей по имени</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Введите имя пользователя"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
          className="search-input"
        />
        <button onClick={searchUsers} className="search-btn">Найти</button>
      </div>

      {message && <div className="search-message">{message}</div>}

      {loading && <div className="loading-spinner"></div>}

      <div className="users-list">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="friend-info">
              <div className="friend-avatar">
                <img 
                  src={`https://ui-avatars.com/api/?background=f5c518&color=000&name=${encodeURIComponent(user.username)}`} 
                  alt={user.username}
                />
              </div>
              <div>
                <h3>{user.username}</h3>
                <p>{user.email}</p>
              </div>
            </div>
            <button onClick={() => sendFriendRequest(user.id)} className="add-btn">
              Добавить в друзья
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;
