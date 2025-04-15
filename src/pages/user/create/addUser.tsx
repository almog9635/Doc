import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import styles from './addUser.module.css';
import axios from 'axios';
import { Role } from '../../../entity/role';
import { Group } from '../../../entity/group';
import { DecodedToken } from '../../../entity/decodedToken';
import { ServiceType, Rank } from '../../../consts';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [rank, setRank] = useState<Rank | ''>('');

  useEffect(() => {
    // Check for "Admin" role
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.roles || !decoded.roles.includes('admin')) {
      navigate('/home');
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthorized) {
      // Fetch available roles from the server
    const token = localStorage.getItem('accessToken');
    axios.get('http://localhost:4000/roles', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
        .then((response) => {
          setRoles(response.data.getAllRoles);
        })
    axios.get('http://localhost:4000/groups', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
        .then((response) => {
          setGroups(response.data.getAllGroups);
        })
        .catch(err => console.error('Error fetching groups:', err));
    }
  }, [isAuthorized]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedRoles(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const decoded = jwtDecode<DecodedToken>(token!);
      
      await axios.post('http://localhost:4000/user/create', {
        firstName,
        lastName,
        serviceType,
        password,
        rank,
        roles: selectedRoles,
        group: selectedGroup,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Id': decoded.sub
        }
      });
      navigate('/users');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New User</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          First Name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          Last Name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          Service Type
          <select
            className={styles.select}
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
            required
          >
            <option value="" disabled>Select service type</option>
            {Object.values(ServiceType).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
          
        <label className={styles.label}>
          Rank
          <select
            className={styles.select}
            value={rank}
            onChange={(e) => setRank(e.target.value as Rank)}
            required
          >
            <option value="" disabled>Select rank</option>
            {Object.values(Rank).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          Roles
          <select
            className={styles.select}
            value={selectedRoles}
            onChange={handleRoleChange}
            multiple
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Group
          <select
            className={styles.select}
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            required
          >
            <option value="" disabled>Select a group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={styles.submitButton}>
          Create User
        </button>
      </form>
    </div>
  );
};

export default AddUser;