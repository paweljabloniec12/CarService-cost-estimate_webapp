import React, { useState } from 'react';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import "../componentsCSS/Login.css";

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        // Walidacja haseł
        if (newPassword !== confirmPassword) {
            setErrorMessage('Hasła nie są takie same');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage('Hasło musi mieć minimum 6 znaków');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ 
                password: newPassword 
            });

            if (error) {
                setErrorMessage('Nie udało się zmienić hasła: ' + error.message);
                return;
            }

            setSuccessMessage('Hasło zostało pomyślnie zmienione');
            
            // Opcjonalnie: przekieruj po zmianie hasła
            setTimeout(() => navigate('/home'), 2000);

        } catch (err) {
            setErrorMessage('Wystąpił nieoczekiwany błąd: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='login-container'>
            <header className='login-container-header'>
                <h1 className="navbar-brand">
                    <img src="./img/logo.png" alt="Logo" className="logo-img" />
                    <div className="navbar-brand-text">
                        <div>KOSZTORYS</div>
                        <div>SERWISOWY</div>
                    </div>
                </h1>

                <div className="supabase-auth-container">
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    {successMessage && <div className="success-message" style={{color: '#5cdb5c'}}>{successMessage}</div>}
                    
                    <form 
                        onSubmit={handlePasswordReset} 
                        className="supabase-auth-form"
                    >
                        <div className="supabase-auth-input-container">
                            <label>Nowe hasło</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nowe hasło"
                                required
                                minLength={6}
                                className="supabase-auth-input"
                            />
                        </div>
                        <div className="supabase-auth-input-container">
                            <label>Potwierdź nowe hasło</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Potwierdź nowe hasło"
                                required
                                minLength={6}
                                className="supabase-auth-input"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="supabase-auth-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Zmiana hasła...' : 'Zmień hasło'}
                        </button>
                    </form>
                </div>
            </header>
        </div>
    );
}

export default ResetPassword;