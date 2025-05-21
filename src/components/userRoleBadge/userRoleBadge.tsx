import React from 'react';
import styles from './userRoleBadge.module.css';

interface UserRoleBadgeProps {
  roles: string[];
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ roles }) => {
  if (!roles || roles.length === 0) {
    return null;
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return styles.adminBadge;
      case 'leader':
        return styles.leaderBadge;
      case 'soldier':
        return styles.soldierBadge;
      default:
        return styles.defaultBadge;
    }
  };

  return (
    <div className={styles.badgeContainer}>
      {roles.map((role, index) => (
        <span key={index} className={`${styles.roleBadge} ${getRoleBadgeClass(role)}`}>
          {role}
        </span>
      ))}
    </div>
  );
};

export default UserRoleBadge;