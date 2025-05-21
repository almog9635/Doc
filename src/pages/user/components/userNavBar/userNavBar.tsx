import React from 'react';
import { Link } from 'react-router-dom';
import styles from './userNavBar.module.css';

const UserNavBar: React.FC = () => {
    return (
        <nav className={styles.userNav}>
            <Link to="/createUser" className={styles.userButton}>
                <span className={styles.icon}>+</span>
                Add User
            </Link>
        </nav>
    );
};

export default UserNavBar; 