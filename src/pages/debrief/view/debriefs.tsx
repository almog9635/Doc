import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './debriefs.module.css';
import { Debrief } from '../../../entity/debrief/debrief';
import { useAuthCheck } from '../../auth/hooks/Authentication';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../../entity/decodedToken';

const Debriefs: React.FC = () => {
  const [debriefs, setDebriefs] = useState<Debrief[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchField, setSearchField] = useState<string>('all');
  const { isAuthorized } = useAuthCheck(['admin', 'leader', 'soldier']);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (isAuthorized) {
      console.log('User is authorized, fetching debriefs...');
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
      const decodedToken = jwtDecode<DecodedToken>(token);
      setIsAdmin(decodedToken.roles.includes("admin"));
      const response = await axios.get('http://localhost:4000/debriefs', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data.getAllDebriefs);
      setDebriefs(response.data.getAllDebriefs || []);
    } catch (err) {
      console.error('Error fetching debriefs:', err);
      setError('Failed to load debriefs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered debriefs based on search term and selected field
  const filteredDebriefs = useMemo(() => {
    if (!searchTerm) {
      return debriefs;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return debriefs.filter(debrief => {
      switch (searchField) {
        case 'title':
          return debrief.title.toLowerCase().includes(lowerCaseSearchTerm);
        case 'createdBy':
          return debrief.metaData?.createdBy?.toLowerCase().includes(lowerCaseSearchTerm);
        case 'labels':
          // Handle labels only as a string
          return typeof debrief.labels === 'string' && 
                 debrief.labels.toLowerCase().includes(lowerCaseSearchTerm);
        case 'all':
        default:
          return (
            debrief.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            (debrief.metaData?.createdBy && debrief.metaData.createdBy.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (typeof debrief.labels === 'string' && debrief.labels.toLowerCase().includes(lowerCaseSearchTerm))
          );
      }
    });
  }, [debriefs, searchTerm, searchField]);

  // Dynamic placeholder text
  const getPlaceholderText = () => {
    switch (searchField) {
      case 'title': return 'Search by title...';
      case 'createdBy': return 'Search by creator...';
      case 'labels': return 'Search by label...';
      case 'all':
      default: return 'Search all fields...';
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.debriefsContainer}>
      <h1>Debriefs</h1>
      <div className={styles.searchControls}>
        <input
          type="text"
          placeholder={getPlaceholderText()}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className={styles.searchSelect}
        >
          <option value="all">All Fields</option>
          <option value="title">Title</option>
          <option value="createdBy">Created By</option>
          <option value="labels">Labels</option>
        </select>
      </div>

      {loading && <div className={styles.loading}>Loading debriefs...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {!loading && !error && (
        <>
          {filteredDebriefs.length === 0 ? (
            <div className={styles.noDebriefs}>{searchTerm ? 'No debriefs match your search.' : 'No debriefs available.'}</div>
          ) : (
            <ul className={styles.debriefList}>
              {filteredDebriefs.map(debrief => (
                <li key={debrief.id} className={styles.debriefItem}>
                  <Link to={`/debrief/${debrief.id}`} className={styles.debriefLink}>
                    <div className={styles.debriefInfo}>
                      <span className={styles.debriefTitle}>{debrief.title}</span>
                      <span className={styles.debriefId}>ID: {debrief.id}</span>
                      {debrief.metaData?.createdBy && (
                        <span className={styles.debriefCreator}>Created by: {debrief.metaData.createdBy}</span>
                      )}
                      {debrief.labels.length > 0 && (
                        <div className={styles.debriefLabels}>
                          Labels: {debrief.labels}
                        </div>
                      )}
                    </div>
                    <span className={styles.debriefDate}>{new Date(debrief.date).toLocaleDateString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.actionButtonsContainer}>
            <Link to="/createDebrief" className={styles.createButton}>
              Create New Debrief
            </Link>
            {isAdmin && (
              <button 
                className={styles.deleteButton} 
                onClick={() => navigate('/debrief/delete')}
              >
                Delete Debrief
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Debriefs;