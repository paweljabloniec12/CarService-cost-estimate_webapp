import supabase from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import "../componentsCSS/Login.css";

function Login() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);

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
    }, []);

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
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    theme="dark"
                    providers={[]}
                    localization={{
                        variables: {
                            sign_up: {
                                email_label: 'Adres email',
                                password_label: 'Hasło',
                                email_input_placeholder: 'Twój adres email',
                                password_input_placeholder: 'Twoje hasło',
                                button_label: 'Zarejestruj się',
                                loading_button_label: 'Rejestracja...',
                                social_provider_text: 'Zaloguj się przez {{provider}}',
                                link_text: 'Nie masz konta? Zarejestruj się',
                                confirmation_text: 'Sprawdź swoją skrzynkę email, aby potwierdzić rejestrację'
                            },
                            sign_in: {
                                email_label: 'Adres email',
                                password_label: 'Hasło',
                                email_input_placeholder: 'Twój adres email',
                                password_input_placeholder: 'Twoje hasło',
                                button_label: 'Zaloguj się',
                                loading_button_label: 'Logowanie...',
                                social_provider_text: 'Zaloguj się przez {{provider}}',
                                link_text: 'Masz już konto? Zaloguj się'
                            },
                            forgotten_password: {
                                link_text: 'Zapomniałeś hasła?',
                                email_label: 'Adres email',
                                password_label: 'Hasło',
                                email_input_placeholder: 'Twój adres email',
                                button_label: 'Wyślij instrukcję resetowania hasła',
                                loading_button_label: 'Wysyłanie instrukcji...',
                                confirmation_text: 'Sprawdź swoją skrzynkę email, aby zresetować hasło'
                            },
                            update_password: {
                                password_label: 'Nowe hasło',
                                password_input_placeholder: 'Twoje nowe hasło',
                                button_label: 'Zaktualizuj hasło',
                                loading_button_label: 'Aktualizacja hasła...',
                                confirmation_text: 'Twoje hasło zostało zaktualizowane'
                            },
                            verify_otp: {
                                email_input_label: 'Adres email',
                                email_input_placeholder: 'Twój adres email',
                                phone_input_label: 'Numer telefonu',
                                phone_input_placeholder: 'Twój numer telefonu',
                                token_input_label: 'Kod',
                                token_input_placeholder: 'Wprowadź otrzymany kod',
                                button_label: 'Zweryfikuj',
                                loading_button_label: 'Weryfikacja...'
                            }
                        }
                    }}
                />
            </header>
        </div>
    );
}

export default Login;
