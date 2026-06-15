import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/movies" className="navbar-brand">Cineshine</Link>
      <div className="navbar-menu">
        <Link to="/movies">Фильмы</Link>
        <Link to="/recommendations">Рекомендации</Link>
        <Link to="/friends">Друзья</Link>
        <Link to="/feed">Лента</Link>
        <Link to="/watchlist">Буду смотреть</Link>
        <Link to="/profile">Профиль</Link>
        <button onClick={handleLogout}>Выйти</button>
      </div>
    </nav>
  );
};

export default Navbar;
