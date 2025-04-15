import React from 'react';
import { Link } from 'react-router-dom';
import styles from './groupNavBar.module.css';

const GroupNavBar: React.FC = () => {
    return (
        <nav className={styles.groupNav}>
            <Link to="/createGroup" className={styles.groupButton}>
                <span className={styles.icon}>+</span>
                Create Group
            </Link>
            <Link to="/deleteGroup" className={styles.groupButton}>
                <span className={styles.icon}>×</span>
                Delete Group
            </Link>
        </nav>
    );
};

export default GroupNavBar; 