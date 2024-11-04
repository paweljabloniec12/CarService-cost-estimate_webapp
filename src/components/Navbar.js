import React, { useState } from 'react';
import '../componentsCSS/Navbar.css';

function Navbar({ onNavigate }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavigate = (destination) => {
        onNavigate(destination);
        setIsMenuOpen(false); // Zamknij menu po nawigacji
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
            <nav className={`navbar-buttons ${isMenuOpen ? 'open' : ''}`}>
                <button onClick={() => handleNavigate('orders')} className="nav-button">Zlecenia</button>
                <button onClick={() => handleNavigate('clients')} className="nav-button">Klienci</button>
                <button onClick={() => handleNavigate('vehicles')} className="nav-button">Pojazdy</button>
                <button onClick={() => handleNavigate('services')} className="nav-button">Usługi</button>
            </nav>
            <button className="menu-toggle" onClick={toggleMenu}>
                ☰
            </button>
        </div>
    );
}

export default Navbar;
