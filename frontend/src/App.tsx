import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import MovieList from './components/MovieList';
import MovieDetail from './components/MovieDetail';
import Recommendations from './components/Recommendations';
import FriendsList from './components/FriendsList';
import FriendRequests from './components/FriendRequests';
import Feed from './components/Feed';
import Watchlist from './components/Watchlist';
import UserSearch from './components/UserSearch';
import Navbar from './components/Navbar';
import './App.css';

const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const authenticated = isAuthenticated();

  return (
    <BrowserRouter>
      <div className="app">
        {authenticated && <Navbar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/movies" element={<PrivateRoute><MovieList /></PrivateRoute>} />
          <Route path="/movies/:id" element={<PrivateRoute><MovieDetail /></PrivateRoute>} />
          <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
          <Route path="/friends" element={<PrivateRoute><FriendsList /></PrivateRoute>} />
          <Route path="/friends/requests" element={<PrivateRoute><FriendRequests /></PrivateRoute>} />
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/watchlist" element={<PrivateRoute><Watchlist /></PrivateRoute>} />
          <Route path="/users/search" element={<PrivateRoute><UserSearch /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/movies" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
