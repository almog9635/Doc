import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { DecodedToken } from '../../../entity/decodedToken';
import { User } from '../../../entity/user';
import styles from './deleteUser.module.css';

const DeleteUser: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.roles || !decoded.roles.includes('admin')) {
      navigate('/home');
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  const fetchUser = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:4000/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.users.length > 0) {
        setUser(response.data.users[0]);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:4000/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      navigate('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      fetchUser(userId);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Delete User</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          User ID
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className={styles.input}
            placeholder="Enter user ID (optional)"
          />
        </label>
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={!userId.trim()}
        >
          Fetch User
        </button>
      </form>
      {userId.trim() && !user && (
        <p className={styles.noUser}>No user found with the provided ID.</p>
      )}
      {user && (
        <div className={styles.userDetails}>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Service Type:</strong> {user.serviceType}</p>
          <p><strong>Roles:</strong> {user.roles.map((r) => r.name).join(', ')}</p>
          <p><strong>Group:</strong> {user.group?.name}</p>
          <button onClick={handleDelete} className={styles.deleteButton}>
            Delete User
          </button>
        </div>
      )}
    </div>
  );
};

export default DeleteUser;