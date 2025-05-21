import React from 'react';
import { Link } from 'react-router-dom';
import styles from './unauthorized.module.css';

const Unauthorized: React.FC = () => {
  return (
    <div className={styles.unauthorizedContainer}>
      <div className={styles.unauthorizedContent}>
        <h1 className={styles.title}>Access Denied</h1>
        <div className={styles.icon}>
          <i className="fas fa-lock"></i>
        </div>
        <p className={styles.message}>
          You don't have permission to access this page. This area requires 
          higher level authorization.
        </p>
        <div className={styles.actions}>
          <Link to="/home" className={styles.homeButton}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;