import React, { useState } from 'react';
import supabase from '../supabaseClient';

function LoginForm({ onLogin, showRegisterForm }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else onLogin(); // Zaloguj użytkownika
    };

    return (
        <div>
            <h2>Logowanie</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" />
                <button type="submit">Zaloguj się</button>
            </form>
            <p>Nie masz konta? <button onClick={showRegisterForm}>Zarejestruj się</button></p>
        </div>
    );
}

export default LoginForm;
