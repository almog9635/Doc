import React from 'react';
import styles from '../debrief.module.css';

interface BasicInfoProps {
  title: string;
  debriefDate: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: any;
}

const BasicInfo: React.FC<BasicInfoProps> = ({
  title,
  debriefDate,
  onTitleChange,
  onDateChange,
  errors
}) => {
  return (
    <div className={styles.debriefSection}>
      <h2>Basic Information</h2>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={onTitleChange}
          placeholder="Enter debrief title"
          className={`${styles.inputField} ${errors.title ? styles.fieldRequired : ''}`}
        />
        {errors.title && <span className={styles.errorMessage}>{errors.title}</span>}
      </label>
      
      <label>
        Date and Time
        <input
          type="datetime-local"
          value={debriefDate}
          onChange={onDateChange}
          className={`${styles.inputField} ${errors.debriefDate ? styles.fieldRequired : ''}`}
        />
        {errors.debriefDate && <span className={styles.errorMessage}>{errors.debriefDate}</span>}
      </label>
    </div>
  );
};

export default BasicInfo;
