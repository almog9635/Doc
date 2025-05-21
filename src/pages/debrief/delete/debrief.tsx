import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthCheck } from '../../auth/hooks/Authentication';
import styles from './debrief.module.css';

const DeleteDebriefById: React.FC = () => {
  const [debriefId, setDebriefId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const navigate = useNavigate();
  // Only admin can access this page
  const { isAuthorized } = useAuthCheck(['admin']);
  
  const handleDebriefIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebriefId(e.target.value);
  };
  
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!debriefId.trim()) {
      setMessage({ text: 'Please enter a debrief ID', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ text: 'Processing deletion request...', type: 'info' });
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.delete(`http://localhost:4000/debrief/${debriefId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessage({ text: `Debrief with ID ${debriefId} has been successfully deleted.`, type: 'success' });
      setDebriefId(''); // Clear the input field
      
      // After 3 seconds, clear the success message
      setTimeout(() => {
        if (message?.type === 'success') {
          setMessage(null);
        }
      }, 3000);
      
    } catch (error: any) {
      console.error('Error deleting debrief:', error);
      
      // Handle different error responses
      if (error.response) {
        if (error.response.status === 404) {
          setMessage({ text: `Debrief with ID ${debriefId} not found.`, type: 'error' });
        } else if (error.response.status === 403) {
          setMessage({ text: 'You do not have permission to delete this debrief.', type: 'error' });
        } else {
          setMessage({ text: `Error: ${error.response.data.message || 'Failed to delete debrief'}`, type: 'error' });
        }
      } else {
        setMessage({ text: 'Network error. Please check your connection and try again.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // If not authorized (not an admin), return null (handled by useAuthCheck)
  if (isAuthorized === false) {
    return null;
  }
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Delete Debrief by ID</h1>
      <p className={styles.adminNote}>
        This is an administrator-only feature. Use with caution as deletions cannot be undone.
      </p>
      
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleDelete} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="debriefId" className={styles.label}>
            Debrief ID
            <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="debriefId"
            value={debriefId}
            onChange={handleDebriefIdChange}
            placeholder="Enter debrief ID to delete"
            className={styles.input}
            required
          />
        </div>
        
        <div className={styles.buttonContainer}>
          <button 
            type="submit" 
            className={styles.deleteButton}
            disabled={loading || !debriefId.trim()}
          >
            {loading ? 'Deleting...' : 'Delete Debrief'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/debriefs')}
            className={styles.backButton}
          >
            Back to Debriefs
          </button>
        </div>
      </form>
      
      <div className={styles.warningBox}>
        <h3 className={styles.warningTitle}>⚠️ Warning</h3>
        <p>Deleting a debrief will permanently remove the following data:</p>
        <ul>
          <li>All content items (paragraphs, tables)</li>
          <li>All associated tasks</li>
          <li>All lessons learned</li>
        </ul>
        <p>This action <strong>cannot</strong> be undone.</p>
      </div>
    </div>
  );
};

export default DeleteDebriefById;