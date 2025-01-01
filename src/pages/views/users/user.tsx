import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../../entity/user.ts';
import styles from './user.module.css';
import TokenWrapper from '../../../components/wrapper/tokenWrapper.tsx';
import { jwtDecode } from 'jwt-decode';

const UserView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error('No access token found');
                    return;
                }
                const decodedToken = jwtDecode(token);
                if(decodedToken.sub !== id){
                    console.error('User not authorized to view this page');
                    return;
                }

                const response = await axios.get(`http://localhost:4000/user/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('API response:', response.data);
                if (response.data) {
                    setUser(response.data.users);
                    console.log('User set:', response.data.users);
                } else {
                    console.error('API response does not contain user data:', response.data);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, [id]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <TokenWrapper>
        <div className={styles.container}>
            <h1 className={styles.title}>User Details</h1>
            <p><strong>First Name:</strong> {user.firstName}</p>
            <p><strong>Last Name:</strong> {user.lastName}</p>
            <p><strong>Service Type:</strong> {user.serviceType}</p>
            <p><strong>Password:</strong> {user.password}</p>
            <p><strong>Group:</strong> {user.group.name}</p>
            <div>
                <strong>Roles:</strong>
                <ul>
                    {Array.isArray(user.roles) && user.roles.map(role => (
                        <li key={role.id}>{role.roleName}</li>
                    ))}
                </ul>
            </div>
        </div>
        </TokenWrapper>
    );
};

export default UserView;