import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Friend {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      setFriends(res.data);
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
    <div>
      <h2>👥 Мои друзья</h2>
      
      {friends.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👋</div>
          <p>У вас пока нет друзей</p>
          <button onClick={() => window.location.href = '/users/search'} className="primary-btn">
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
                    src={friend.avatar_url || `https://ui-avatars.com/api/?background=e50914&color=fff&name=${encodeURIComponent(friend.username)}`} 
                    alt={friend.username}
                  />
                </div>
                <div>
                  <h3>{friend.username}</h3>
                  <p>{friend.email}</p>
                </div>
              </div>
              <button onClick={() => removeFriend(friend.id)} className="danger-btn">Удалить</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
