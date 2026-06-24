import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Friends.css';

interface Friend {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/friends');
      setFriends(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId: number) => {
    try {
      await api.delete(`/friends/${friendId}`);
      setFriends(friends.filter(f => f.id !== friendId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h2>Мои друзья</h2>
        <p className="friends-subtitle">Здесь отображаются ваши друзья</p>
      </div>

      {friends.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет друзей</p>
          <button onClick={() => navigate('/users/search')} className="primary-btn">
            Найти друзей
          </button>
        </div>
      ) : (
        <div className="friends-list">
          {friends.map((friend) => (
            <div key={friend.id} className="friend-card">
              <div className="friend-info">
                <div className="friend-avatar">
                  <img 
                    src={friend.avatar_url || `https://ui-avatars.com/api/?background=f5c518&color=000&name=${encodeURIComponent(friend.username)}`} 
                    alt={friend.username}
                  />
                </div>
                <div>
                  <h3>{friend.username}</h3>
                  <p>{friend.email}</p>
                </div>
              </div>
              <button onClick={() => removeFriend(friend.id)} className="remove-btn">
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsList;