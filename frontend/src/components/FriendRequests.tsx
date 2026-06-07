import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Request {
  id: number;
  from_user_id: number;
  from_username: string;
  status: string;
}

const FriendRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/friends/requests');
      setRequests(response.data);
      setError('');
    } catch (err) {
      setError('Ошибка при загрузке заявок');
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId: number) => {
    try {
      await api.put(`/friends/request/${requestId}/accept`);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      setError('Ошибка при принятии заявки');
    }
  };

  const declineRequest = async (requestId: number) => {
    try {
      await api.put(`/friends/request/${requestId}/decline`);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      setError('Ошибка при отклонении заявки');
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Заявки в друзья</h2>
      {error && <div className="error">{error}</div>}
      {requests.length === 0 ? (
        <p>Нет входящих заявок</p>
      ) : (
        <div className="requests-list">
          {requests.map((req) => (
            <div key={req.id} className="request-card">
              <div>
                <h3>{req.from_username}</h3>
                <p>Хочет добавить вас в друзья</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => acceptRequest(req.id)}>Принять</button>
                <button onClick={() => declineRequest(req.id)} className="secondary">
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
