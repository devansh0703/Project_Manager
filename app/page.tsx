'use client'
import { useState } from 'react';

export default function HomePage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const res = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            alert('Logged in successfully');
        } else {
            alert(data.message);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

