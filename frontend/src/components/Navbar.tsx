import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/cineshine.svg';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {  
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/movies" className="navbar-brand" onClick={closeMenu}>
          <img src={logo} alt="Cineshine" className="navbar-brand-logo" />
        </Link>
      </div>

      <div className="navbar-right">
        <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          <Link to="/movies" onClick={closeMenu}>Фильмы</Link>
          <Link to="/recommendations" onClick={closeMenu}>Рекомендации</Link>
          <Link to="/friends" onClick={closeMenu}>Друзья</Link>
          <Link to="/friends/requests" onClick={closeMenu}>Заявки</Link>
          <Link to="/feed" onClick={closeMenu}>Лента</Link>
          <Link to="/watchlist" onClick={closeMenu}>Буду смотреть</Link>
          <Link to="/profile" onClick={closeMenu}>Профиль</Link>
          <button onClick={() => { handleLogout(); closeMenu(); }}>Выйти</button>
        </div>

        <button className="burger-btn" onClick={toggleMenu} aria-label="Меню">
          <span className={`burger-line ${isOpen ? 'active' : ''}`}></span>
          <span className={`burger-line ${isOpen ? 'active' : ''}`}></span>
          <span className={`burger-line ${isOpen ? 'active' : ''}`}></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
