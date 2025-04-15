import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import styles from './groups.module.css';
import { DecodedToken } from '../../../entity/decodedToken';
import { Group } from '../../../entity/group';
import GroupNavBar from '../components/groupNavBar/groupNavBar';

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('name');
  const [filterValue, setFilterValue] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.roles || !decoded.roles.includes('admin')) {
        navigate('/home');
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthorized) {
      axios.get('http://localhost:4000/groups', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        const fetchedGroups = response.data.getAllGroups || [];
        setGroups(fetchedGroups);
        setFilteredGroups(fetchedGroups);
      })
      .catch(err => {
        console.error('Error fetching groups:', err);
      });
    }
  }, [isAuthorized]);

  useEffect(() => {
    const filtered = groups.filter(group => {
      const searchValue = filterValue.toLowerCase();
      switch (filterCategory) {
        case 'name':
          return group.name.toLowerCase().includes(searchValue);
        case 'id':
          return group.id.toLowerCase().includes(searchValue);
        case 'commander':
          return group.commander?.id?.toLowerCase().includes(searchValue) || 
                 (!group.commander && searchValue === 'no commander');
        default:
          return true;
      }
    });
    setFilteredGroups(filtered);
  }, [filterValue, filterCategory, groups]);

  const handleGroupClick = (id: string) : void => {
    navigate(`/group/${id}`);
  };

  const handleFilterChange = (value: string) : void => {
    setFilterValue(value);
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Groups</h1>
      <GroupNavBar />
      <div className={styles.filterContainer}>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="name">Group Name</option>
          <option value="id">Group ID</option>
          <option value="commander">Commander ID</option>
        </select>
        <input
          type="text"
          placeholder={`Filter by ${filterCategory}`}
          value={filterValue}
          onChange={(e) => handleFilterChange(e.target.value)}
          className={styles.filterInput}
        />
        <button
          onClick={() => setFilterValue('')}
          className={styles.clearFilterButton}
        >
          Clear Filter
        </button>
      </div>
      <ul className={styles.groupList}>
        {filteredGroups.map(group => (
          <li 
            key={group.id} 
            className={styles.groupItem}
          >
            <div className={styles.groupContent}>
              <div className={styles.groupDetails} onClick={() => handleGroupClick(group.id)}>
                <h3 className={styles.groupName}>{group.name}</h3>
                <div className={styles.groupInfo}>
                  <p className={styles.groupId}>ID: {group.id}</p>
                  <p className={styles.commander}>Commander: {group.commander?.id || 'No Commander'}</p>
                </div>
              </div>
              <Link 
                to={`/editGroup/${group.id}`} 
                className={styles.editButton}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
              >
                Edit Group
              </Link>
            </div>

          </li>
        ))}
      </ul>

    </div>
  );
};

export default Groups;