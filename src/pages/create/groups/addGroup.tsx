import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import styles from './addGroup.module.css';
import axios from 'axios';
import { DecodedToken } from '../../../entity/decodedToken';

// Set up Axios interceptor to add token to headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AddGroup: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [commander, setCommander] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/group/create', {
        name,
        commander: commander ? parseInt(commander, 10) : null,
      });
      navigate('/groups');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  if (!isAuthorized) {
    return null; // or a loading spinner, or a message indicating that the user is not authorized
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Group</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Group Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          Commander ID
          <input
            type="number"
            value={commander}
            onChange={(e) => setCommander(e.target.value)}
            className={styles.input}
          />
        </label>
        <button type="submit" className={styles.submitButton}>
          Create Group
        </button>
      </form>
    </div>
  );
};

export default AddGroup;