import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import styles from './group.module.css';
import { DecodedToken } from '../../../entity/decodedToken';
import { Group } from '../../../entity/group';
import { User } from '../../../entity/user';

interface GroupDetails extends Group {
  users: User[];
}

const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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
    } catch (err) {
      console.error('Invalid token:', err);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (isAuthorized && id) {
        try {
          const response = await axios.get(`http://localhost:4000/group/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          });
          const fetchedGroup: GroupDetails = response.data.groups;
          setGroup(fetchedGroup);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching group details:', err);
          setError('Failed to load group details.');
          setLoading(false);
        }
      }
    };

    fetchGroupDetails();
  }, [isAuthorized, id]);

  const handleBack = () => {
    navigate('/groups');
  };

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return <div className={styles.container}><p>Loading...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p>{error}</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Group Details</h1>
      {group ? (
        <div className={styles.groupInfo}>
          <p><strong>Group Name:</strong> {group.name}</p>
          <p><strong>Commander ID:</strong> {group.commander.id}</p>
        </div>
      ) : (
        <p>No group details available.</p>
      )}

      <h2 className={styles.subtitle}>Users in this Group</h2>
      {group && group.users.length > 0 ? (
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Service Type</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {group.users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.serviceType}</td>
                <td>{user.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users in this group.</p>
      )}

      <button onClick={handleBack} className={styles.backButton}>Back to Groups</button>
    </div>
  );
};

export default GroupPage;