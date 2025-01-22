import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import styles from './groups.module.css';
import { DecodedToken } from '../../../entity/decodedToken';
import { Group } from '../../../entity/group';

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.roles || !decoded.roles.includes('admin')) {
        navigate('/home');
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthorized) {
      axios.get('http://localhost:4000/groups', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        const fetchedGroups = response.data.getAllGroups || [];
        setGroups(fetchedGroups);
      })
      .catch(err => {
        console.error('Error fetching groups:', err);
      });
    }
  }, [isAuthorized]);

  const handleGroupClick = (id: number) => {
    navigate(`/group/${id}`);
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Groups</h1>
      <ul className={styles.groupList}>
        {groups.map(group => (
          <li 
            key={group.id} 
            onClick={() => handleGroupClick(group.id)} 
            className={styles.groupItem}
          >
            <span className={styles.groupId}>Group ID: {group.id}</span> -
            <span className={styles.groupName}>{group.name}</span> - 
            <span className={styles.commander}> Commander ID: {group.commander.id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Groups;