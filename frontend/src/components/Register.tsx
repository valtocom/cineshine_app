import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
import './Login.css';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await register(email, password, username);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/profile');
    } catch (err) {
      setError('Ошибка при регистрации');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
      <h2>Регистрация</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          required
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Зарегистрироваться</button>
      </form>
      <button onClick={() => navigate('/')} style={{ marginTop: 10 }}>Уже есть аккаунт? Войти</button>
    </div>
  );
};

export default Register;
