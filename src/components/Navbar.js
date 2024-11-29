import React, { useState } from 'react';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../componentsCSS/Navbar.css';

function Navbar({ onNavigate, activeComponent }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    getUser();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleNavigate = (destination) => {
    onNavigate(destination);
    setIsMenuOpen(false);
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/");
    }
  };

  return (
    <div className="navbar">
      <h1 className="navbar-brand">
        <img src="./img/logo.png" alt="Logo"></img>
        <div className="navbar-brand-text">
          <div>KOSZTORYS</div>
          <div>SERWISOWY</div>
        </div>
      </h1>
      <div className={`navbar-buttons ${isMenuOpen ? 'open' : ''}`}>
        <button
          onClick={() => handleNavigate('orders')}
          className={`nav-button ${activeComponent === 'orders' ? 'active' : ''}`}
        >
          Zlecenia
        </button>
        <button
          onClick={() => handleNavigate('clients')}
          className={`nav-button ${activeComponent === 'clients' ? 'active' : ''}`}
        >
          Klienci
        </button>
        <button
          onClick={() => handleNavigate('vehicles')}
          className={`nav-button ${activeComponent === 'vehicles' ? 'active' : ''}`}
        >
          Pojazdy
        </button>
        <button
          onClick={() => handleNavigate('services')}
          className={`nav-button ${activeComponent === 'services' ? 'active' : ''}`}
        >
          Usługi
        </button>
        <button
          onClick={() => handleNavigate('materials')}
          className={`nav-button ${activeComponent === 'materials' ? 'active' : ''}`}
        >
          Materiały
        </button>
        {/* Dodane menu użytkownika dla widoku mobilnego */}
        <div className="mobile-user-menu">
          <div className="user-email">{user?.email}</div>
          <button onClick={signOutUser} className="nav-button">
            Wyloguj
          </button>
        </div>
      </div>
      {/* Menu użytkownika dla widoku desktopowego */}
      <div className="user-menu-container desktop-only">
        <button onClick={toggleUserMenu} className="user-menu-button">
          {user?.email}
          <span className={`arrow ${isUserMenuOpen ? 'up' : 'down'}`}>▼</span>
        </button>
        {isUserMenuOpen && (
          <div className="user-dropdown-menu">
            <button onClick={signOutUser} className="dropdown-item">
              Wyloguj
            </button>
          </div>
        )}
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
    </div>
  );
}

export default Navbar;