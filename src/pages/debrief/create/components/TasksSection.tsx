import React, { useEffect } from 'react';
import styles from '../debrief.module.css';
import { Task } from '../../../../entity/debrief/task';
import { User } from '../../../../entity/user';
import { DecodedToken } from '../../../../entity/decodedToken';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface TasksSectionProps {
  tasks: Task[];
  taskContent: string;
  taskStartDate: string;
  taskDeadline: string;
  taskUser: string;
  editingTaskId: string | null;
  editTaskContent: string;
  editTaskStartDate: string;
  editTaskDeadline: string;
  editTaskUser: string;
  handlers: {
    handleTaskContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleTaskStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTaskDeadlineChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTaskUserChange: (userId: string) => void;
    handleAddTask: () => void;
    handleEditTask: (id: string) => void;
    handleUpdateTask: () => void;
    handleDeleteTask: (id: string) => void;
    handleCancelEdit: () => void;
  };
  errors: string;
}

const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  taskContent,
  taskStartDate,
  taskDeadline,
  taskUser,
  editingTaskId,
  editTaskContent,
  editTaskStartDate,
  editTaskDeadline,
  editTaskUser,
  handlers,
  errors
}) => {
  const [usersGroup, setUsersGroup] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsersGroup();
  }, []);

  const fetchUsersGroup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        setError('Authentication error. Please log in again.');
        return;
      }
      
      const decoded = jwtDecode<DecodedToken>(token);
      const response = await axios.get(`http://localhost:4000/user/group/${decoded.sub}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setUsersGroup(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users group:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handlers.handleTaskUserChange(e.target.value);
  };

  // Find user name by ID for display purposes
  const getUserNameById = (userId: string): string => {
    const user = usersGroup.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  return (
    <div className={styles.debriefSection}>
      <h2>Tasks</h2>
      <div className={styles.taskForm}>
        {editingTaskId ? (
          <>
            <label>
              Edit Task Content<span className={styles.required}>*</span>
              <textarea
                value={editTaskContent}
                onChange={handlers.handleTaskContentChange}
                placeholder="Enter task description"
                className={styles.textareaField}
                required
              />
            </label>
            
            <label>
              Start Date<span className={styles.required}>*</span>
              <input
                type="datetime-local"
                value={editTaskStartDate}
                onChange={handlers.handleTaskStartDateChange}
                className={styles.inputField}
                required
              />
            </label>
            
            <label>
              Deadline<span className={styles.required}>*</span>
              <input
                type="datetime-local"
                value={editTaskDeadline}
                onChange={handlers.handleTaskDeadlineChange}
                className={styles.inputField}
                required
              />
            </label>
            
            <label>
              Assigned To
              {isLoading ? (
                <div className={styles.loadingSpinner}>Loading users...</div>
              ) : error ? (
                <div className={styles.errorText}>{error}</div>
              ) : (
                <select
                  value={editTaskUser}
                  onChange={handleUserChange}
                  className={styles.selectField}
                >
                  <option value="">-- Select a user --</option>
                  {usersGroup.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              )}
            </label>
            
            <div className={styles.editButtonGroup}>
              <button 
                onClick={handlers.handleUpdateTask} 
                className={styles.updateButton}
                disabled={!editTaskContent.trim() || !editTaskStartDate || !editTaskDeadline}
              >
                Update Task
              </button>
              <button onClick={handlers.handleCancelEdit} className={styles.cancelEditButton}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <label>
              Task Content<span className={styles.required}>*</span>
              <textarea
                value={taskContent}
                onChange={handlers.handleTaskContentChange}
                placeholder="Enter task description"
                className={styles.textareaField}
                required
              />
            </label>
            
            <label>
              Start Date<span className={styles.required}>*</span>
              <input
                type="datetime-local"
                value={taskStartDate}
                onChange={handlers.handleTaskStartDateChange}
                className={styles.inputField}
                required
              />
            </label>
            
            <label>
              Deadline<span className={styles.required}>*</span>
              <input
                type="datetime-local"
                value={taskDeadline}
                onChange={handlers.handleTaskDeadlineChange}
                className={styles.inputField}
                required
              />
            </label>
            
            <label>
              Assigned To
              {isLoading ? (
                <div className={styles.loadingSpinner}>Loading users...</div>
              ) : error ? (
                <div className={styles.errorText}>{error}</div>
              ) : (
                <select
                  value={taskUser}
                  onChange={handleUserChange}
                  className={styles.selectField}
                >
                  <option value="">-- Select a user --</option>
                  {usersGroup.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              )}
              {!usersGroup.length && !isLoading && !error && (
                <div className={styles.noteText}>
                  No users in your group. Tasks will be assigned with no specific user.
                </div>
              )}
            </label>
            
            <button 
              onClick={handlers.handleAddTask} 
              className={styles.addButton}
              disabled={!taskContent.trim() || !taskStartDate || !taskDeadline}
            >
              Add Task
            </button>
            
            {error && (
              <div className={styles.retryContainer}>
                <button onClick={fetchUsersGroup} className={styles.retryButton}>
                  Retry Loading Users
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {tasks.length > 0 && (
        <div>
          <h3>Tasks</h3>
          <ul className={styles.taskList}>
            {tasks.map((task, index) => (
              <li key={task.id} className={styles.taskListItem}>
                <div className={styles.taskContent}>
                  <p>
                    <strong>{index + 1}. {task.content}</strong>
                  </p>
                  <p>
                    <span className={styles.taskLabel}>Assigned to:</span> 
                    {task.user ? getUserNameById(task.user) : 'Unassigned'}
                  </p>
                  <p>
                    <span className={styles.taskLabel}>From:</span> {new Date(task.startDate).toLocaleString()} 
                    <span className={styles.taskLabel}> to </span> {new Date(task.deadline).toLocaleString()}
                  </p>
                </div>
                <div className={styles.itemActions}>
                  <button 
                    onClick={() => handlers.handleEditTask(task.id)} 
                    className={styles.editButton}
                    disabled={!!editingTaskId}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handlers.handleDeleteTask(task.id)} 
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {errors && <span className={`${styles.errorMessage} error-message`}>{errors}</span>}
    </div>
  );
};

export default TasksSection;
