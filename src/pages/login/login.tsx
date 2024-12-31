import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./login.module.css";
import axios from "axios";

export default function Login() {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('user id:', userId);
        console.log('Password:', password);
        axios.post('http://localhost:4000/login', { userId, password }, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (response.data) {
                console.log('Login successful:', response.data);
                navigate('/users');
            } else {
                console.error('Login failed:', response.data);
            }
        });
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}>
                <input
                    type="text"
                    placeholder="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className={styles.inputField}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                />
                <button type="submit" className={styles.submitButton}>Login</button>
            </form>
        </div>
    );
}