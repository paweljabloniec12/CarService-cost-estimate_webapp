import supabase from '../supabaseClient';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../componentsCSS/Login.css";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN") {
                setErrorMessage(null);
                navigate("/home");
            } else if (event === "SIGNED_OUT") {
                navigate("/");
                [window.localStorage, window.sessionStorage].forEach((storage) => {
                    Object.entries(storage).forEach(([key]) => {
                        storage.removeItem(key);
                    });
                });
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate]);

    const handleSignIn = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                switch(error.message) {
                    case 'Invalid login credentials':
                        setErrorMessage('Nieprawidłowe dane logowania');
                        break;
                    case 'User not found':
                        setErrorMessage('Użytkownik nie został znaleziony');
                        break;
                    case 'Invalid email':
                        setErrorMessage('Nieprawidłowy format adresu email');
                        break;
                    default:
                        setErrorMessage('Wystąpił błąd podczas logowania');
                }
            }
        } catch (err) {
            setErrorMessage('Wystąpił nieoczekiwany błąd');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        
        try {
            const { error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                switch(error.message) {
                    case 'User already registered':
                        setErrorMessage('Użytkownik już istnieje');
                        break;
                    case 'Invalid email':
                        setErrorMessage('Nieprawidłowy format adresu email');
                        break;
                    case 'Password should be at least 6 characters.':
                        setErrorMessage('Hasło powinno mieć min. długość: 6');
                        break;
                    default:
                        setErrorMessage('Wystąpił błąd podczas rejestracji');
                }
            }
        } catch (err) {
            setErrorMessage('Wystąpił nieoczekiwany błąd');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSignUp = () => {
        setIsSignUp(!isSignUp);
        setErrorMessage(null);
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
                    
                    <form 
                        onSubmit={isSignUp ? handleSignUp : handleSignIn} 
                        className="supabase-auth-form"
                    >
                        <div className="supabase-auth-input-container">
                            <label htmlFor="email">
                                {isSignUp ? 'Adres email' : 'Adres email'}
                            </label>
                            <input 
                                type="email" 
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Twój adres email"
                                required
                                className="supabase-auth-input"
                            />
                        </div>
                        
                        <div className="supabase-auth-input-container">
                            <label htmlFor="password">
                                {isSignUp ? 'Hasło' : 'Hasło'}
                            </label>
                            <input 
                                type="password" 
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Twoje hasło"
                                required
                                className="supabase-auth-input"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="supabase-auth-button"
                            disabled={isLoading}
                        >
                            {isLoading 
                                ? (isSignUp ? 'Rejestracja...' : 'Logowanie...') 
                                : (isSignUp ? 'Zarejestruj się' : 'Zaloguj się')
                            }
                        </button>
                    </form>

                    <div className="supabase-auth-link">
                        <button onClick={toggleSignUp} className="supabase-auth-link-button">
                            {isSignUp 
                                ? 'Masz już konto? Zaloguj się' 
                                : 'Nie masz konta? Zarejestruj się'
                            }
                        </button>
                        <button className="supabase-auth-forgotten-password">
                            Zapomniałeś hasła?
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default Login;