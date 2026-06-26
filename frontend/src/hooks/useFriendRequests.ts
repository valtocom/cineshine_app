import { useState, useEffect } from 'react';
import api from '../services/api';

export const useFriendRequests = () => {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const response = await api.get('/friends/requests/count');
      setCount(response.data.count);
    } catch (error) {
      console.error('Ошибка получения количества заявок:', error);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return { count, refetch: fetchCount };
};
