import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFriendRequests } from '../hooks/useFriendRequests';
import './Navbar.css';
import logo from '../assets/cineshine.svg';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { count } = useFriendRequests();

  const handleLogout = () => {  
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/movies" className="navbar-brand">
        <img src={logo} alt="Cineshine" className="navbar-brand-logo" />
      </Link>
      <div className="navbar-menu">
        <Link to="/movies">Фильмы</Link>
        <Link to="/recommendations">Рекомендации</Link>
        <Link to="/friends">Друзья</Link>
        <Link to="/friends/requests" className="nav-link">
          Заявки
          {count > 0 && (
            <span className="badge">{count}</span>
          )}
        </Link>
        <Link to="/feed">Лента</Link>
        <Link to="/watchlist">Буду смотреть</Link>
        <Link to="/profile">Профиль</Link>
        <button onClick={handleLogout}>Выйти</button>
      </div>
    </nav>
  );
};

export default Navbar;
