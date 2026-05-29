import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import MovieList from './components/MovieList';
import Recommendations from './components/Recommendations';

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/profile" /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/" />} />
        <Route path="/movies" element={isAuthenticated ? <MovieList /> : <Navigate to="/" />} />
        <Route path="/recommendations" element={isAuthenticated ? <Recommendations /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
