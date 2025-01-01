import React from 'react';
import styles from './home.module.css';
import TokenWrapper from '../../components/wrapper/tokenWrapper';

const Home: React.FC = () => {
    
    return (
        <TokenWrapper>
        <div className={styles.homeContainer}>
            <h1 className={styles.title}>Home Page</h1>
            {(
                <p>
                    Welcome to the home page! You can navigate to the users page by clicking the link below.
                </p>
            )}
        </div>
        </TokenWrapper>
    );
};

export default Home;