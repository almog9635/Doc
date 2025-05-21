import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import styles from './deleteGroup.module.css';
import axios from 'axios';
import { DecodedToken } from '../../../entity/decodedToken';
import { Group } from '../../../entity/group';

const DeleteGroup: React.FC = () => {
  const navigate = useNavigate();
  const [groupId, setGroupId] = useState('');
  const [group, setGroup] = useState<Group | null>(null);
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

  const fetchGroup = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:4000/group/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Fetched group data:', response.data.groups);
      setGroup(response.data.groups);
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:4000/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json'
        }
      });
      navigate('/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroup(groupId);
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Delete Group</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Group ID
          <input
            type="text"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className={styles.input}
            required
          />
        </label>
        <button type="submit" className={styles.submitButton}>
          Fetch Group
        </button>
      </form>
      {group && (
        <div className={styles.groupDetails}>
          <p><strong>Group Name:</strong> {group.name}</p>
          <p><strong>Commander ID:</strong> {group.commander?.id}</p>
          <button onClick={handleDelete} className={styles.deleteButton}>
            Delete Group
          </button>
        </div>
      )}
    </div>
  );
};

export default DeleteGroup;