import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import styles from './addUser.module.css';
import axios from 'axios';
import { Role } from '../../../entity/role';
import { Group } from '../../../entity/group';
import { DecodedToken } from '../../../entity/decodedToken';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

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
      // Map selected role names to Role objects
      const selectedRoleObjects = roles.filter(role => selectedRoles.includes(role.roleName));
      const selectedGroupObject = groups.find(group => group.name === selectedGroup);
    const token = localStorage.getItem('accessToken');
    await axios.post('http://localhost:4000/createUser', {
      firstName,
      lastName,
      serviceType,
      password,
      roles: selectedRoleObjects,
      group: selectedGroupObject,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
          navigate('/users');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  if (!isAuthorized) {
    return null; // or a loading spinner, or a message indicating that the user is not authorized
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
          <input
            type="text"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className={styles.input}
            required
          />
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
              <option key={role.id} value={role.roleName}>
                {role.roleName}
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
              <option key={group.id} value={group.name}>
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