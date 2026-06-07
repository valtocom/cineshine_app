import React, { useState } from 'react';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
}

const UserSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const searchUsers = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/users/search?q=${query}`);
      setUsers(response.data);
    } catch (err) {
      setError('Ошибка при поиске');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: number) => {
    try {
      await api.post('/friends/request', { friendId: userId });
      setSuccess('Заявка отправлена!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка при отправке заявки');
    }
  };

  return (
    <div>
      <h2>Поиск пользователей</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Введите имя пользователя"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
        />
        <button onClick={searchUsers}>Найти</button>
      </div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {loading && <div>Поиск...</div>}
      <div className="users-list">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div>
              <h3>{user.username}</h3>
              <p>{user.email}</p>
            </div>
            <button onClick={() => sendFriendRequest(user.id)}>
              Добавить в друзья
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;
