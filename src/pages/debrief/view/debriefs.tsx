import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './debriefs.module.css';
import { Debrief } from '../../../entity/debrief/debrief';
import { useAuthCheck } from '../../auth/hooks/Authentication';
import { useNavigate } from 'react-router-dom';

const Debriefs: React.FC = () => {
  const [debriefs, setDebriefs] = useState<Debrief[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthorized } = useAuthCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthorized) {
      fetchDebriefs();
    }
  }, [isAuthorized]);

  const fetchDebriefs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:4000/debriefs', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setDebriefs(response.data.getAllDebriefs);
      console.log(debriefs);
    } catch (err) {
      console.error('Error fetching debriefs:', err);
      setError('Failed to load debriefs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.debriefsContainer}>
      <h1>Debriefs</h1>
      {loading && <div className={styles.loading}>Loading debriefs...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {!loading && !error && (
        <>
          {debriefs.length === 0 ? (
            <div className={styles.noDebriefs}>No debriefs available.</div>
          ) : (
            <ul className={styles.debriefList}>
              {debriefs.map(debrief => (
                <li key={debrief.id} className={styles.debriefItem}>
                  <Link to={`/debrief/${debrief.id}`} className={styles.debriefLink}>
                    <span className={styles.debriefTitle}>{debrief.title}</span>
                    <span className={styles.debriefDate}>{new Date(debrief.date).toLocaleDateString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to="/createDebrief" className={styles.createButton}>
            Create New Debrief
          </Link>
        </>
      )}
    </div>
  );
};

export default Debriefs;