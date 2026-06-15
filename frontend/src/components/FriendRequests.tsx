import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Friends.css';

interface Request {
  id: number;
  from_user_id: number;
  from_username: string;
  status: string;
}

const FriendRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/friends/requests');
      setRequests(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId: number) => {
    try {
      await api.put(`/friends/request/${requestId}/accept`);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  const declineRequest = async (requestId: number) => {
    try {
      await api.put(`/friends/request/${requestId}/decline`);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h2>Заявки в друзья</h2>
        <p className="friends-subtitle">Подтвердите или отклоните заявки</p>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>Нет входящих заявок</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((req) => (
            <div key={req.id} className="request-card">
              <div className="friend-info">
                <div className="friend-avatar">
                  <img 
                    src={`https://ui-avatars.com/api/?background=f5c518&color=000&name=${encodeURIComponent(req.from_username)}`} 
                    alt={req.from_username}
                  />
                </div>
                <div>
                  <h3>{req.from_username}</h3>
                  <p>Хочет добавить вас в друзья</p>
                </div>
              </div>
              <div className="request-actions">
                <button onClick={() => acceptRequest(req.id)} className="accept-btn">
                  Принять
                </button>
                <button onClick={() => declineRequest(req.id)} className="decline-btn">
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;
