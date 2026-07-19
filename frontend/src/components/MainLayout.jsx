// frontend/src/components/MainLayout.jsx
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';

const MainLayout = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/aboutpage', isButton: true },
    
    { name: 'Contact', path: '/viewprofile' },
  ];

  const handleProfileUpload = () => {
    navigate('/profile');
  };

  const handleCvUpload = () => {
    navigate('/sendcv');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header 
        navItems={navItems}
        onProfileUpload={handleProfileUpload}
        onCvUpload={handleCvUpload}
      />
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;