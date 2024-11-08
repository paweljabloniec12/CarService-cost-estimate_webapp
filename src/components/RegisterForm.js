import React, { useState } from 'react';
import supabase from '../supabaseClient';

function RegisterForm({ onRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        else onRegister(); // Po poprawnej rejestracji wróć do logowania
    };

    return (
        <div>
            <h2>Rejestracja</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegister}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" />
                <button type="submit">Zarejestruj się</button>
            </form>
        </div>
    );
}

export default RegisterForm;
