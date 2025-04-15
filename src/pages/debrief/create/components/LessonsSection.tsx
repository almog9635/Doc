import React, { useEffect } from 'react';
import styles from '../debrief.module.css';
import { Lesson } from '../../../../entity/debrief/lesson';
import { User } from '../../../../entity/user';
import { DecodedToken } from '../../../../entity/decodedToken';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface LessonsSectionProps {
  lessons: Lesson[];
  lessonContent: string;
  selectedLessonId: string | null;
  lessonTaskContent: string;
  lessonTaskStartDate: string;
  lessonTaskDeadline: string;
  lessonTaskUser: string;
  editingLessonId: string | null;
  editLessonContent: string;
  handlers: {
    handleLessonContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleAddLesson: () => void;
    handleEditLesson: (id: string) => void;
    handleUpdateLesson: () => void;
    handleDeleteLesson: (id: string) => void;
    handleSelectLesson: (id: string) => void;
    handleLessonTaskContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleLessonTaskStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleLessonTaskDeadlineChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleLessonTaskUserChange: (userId: string) => void;
    handleAddLessonTask: () => void;
    handleRemoveLessonTask: (lessonId: string, taskId: string) => void;
    handleCancelLessonTask: () => void;
    handleCancelEdit: () => void;
    handleEditLessonContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  };
  errors: string;
}

const LessonsSection: React.FC<LessonsSectionProps> = ({
  lessons,
  lessonContent,
  selectedLessonId,
  lessonTaskContent,
  lessonTaskStartDate,
  lessonTaskDeadline,
  lessonTaskUser,
  editingLessonId,
  editLessonContent,
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
    handlers.handleLessonTaskUserChange(e.target.value);
  };

  // Find user name by ID for display purposes
  const getUserNameById = (userId: string): string => {
    const user = usersGroup.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  // Check if form inputs are valid
  const isTaskFormValid = lessonTaskContent.trim() && lessonTaskStartDate && lessonTaskDeadline;

  // Handler for selecting a lesson - added check to prevent selection when editing
  const handleSelectLessonSafely = (id: string) => {
    if (!editingLessonId) {
      handlers.handleSelectLesson(id);
    }
  };

  // Handler for editing a lesson - added check to prevent editing when task form is open
  const handleEditLessonSafely = (id: string) => {
    if (!selectedLessonId) {
      handlers.handleEditLesson(id);
    }
  };

  return (
    <div className={styles.debriefSection}>
      <h2>Lessons</h2>
      <div className={styles.lessonForm}>
        {editingLessonId ? (
          <>
            <label>
              Edit Lesson Content<span className={styles.required}>*</span>
              <textarea
                value={editLessonContent}
                onChange={handlers.handleEditLessonContentChange}
                placeholder="Enter lesson learned"
                className={styles.textareaField}
                required
              />
            </label>
            
            <div className={styles.editButtonGroup}>
              <button onClick={handlers.handleUpdateLesson} className={styles.updateButton}>
                Update Lesson
              </button>
              <button onClick={handlers.handleCancelEdit} className={styles.cancelEditButton}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <label>
              Lesson Content<span className={styles.required}>*</span>
              <textarea
                value={lessonContent}
                onChange={handlers.handleLessonContentChange}
                placeholder="Enter lesson learned"
                className={styles.textareaField}
                required
              />
            </label>
            
            <button onClick={handlers.handleAddLesson} className={styles.addButton}>Add Lesson</button>
          </>
        )}
      </div>
      
      {lessons.length > 0 && (
        <div>
          <h3>Lessons</h3>
          <ul className={styles.lessonList}>
            {lessons.map((lesson, index) => (
              <li key={lesson.id} className={styles.lessonListItem}>
                <div className={styles.lessonContent}>
                  {editingLessonId === lesson.id ? (
                    <div className={styles.lessonEditForm}>
                      <textarea
                        value={editLessonContent}
                        onChange={handlers.handleEditLessonContentChange}
                        className={styles.textareaField}
                      />
                      <div className={styles.editButtonGroup}>
                        <button 
                          onClick={handlers.handleUpdateLesson} 
                          className={styles.smallButton}
                        >
                          Save
                        </button>
                        <button 
                          onClick={handlers.handleCancelEdit} 
                          className={styles.smallCancelButton}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.lessonHeader}>
                        <h4>{index + 1}. {lesson.content}</h4>
                        <div className={styles.itemActions}>
                          <button 
                            onClick={() => handleEditLessonSafely(lesson.id)} 
                            className={styles.smallEditButton}
                            disabled={!!editingLessonId || selectedLessonId !== null}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handlers.handleDeleteLesson(lesson.id)} 
                            className={styles.smallDeleteButton}
                            disabled={!!editingLessonId || selectedLessonId === lesson.id}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {lesson.tasks.length > 0 && !editingLessonId && (
                    <div className={styles.lessonTasks}>
                      <h5>Related Tasks:</h5>
                      <ul className={styles.lessonTaskList}>
                        {lesson.tasks.map(task => (
                          <li key={task.id} className={styles.lessonTaskItem}>
                            <div className={styles.taskDetails}>
                              <p>
                                <strong>Task:</strong> {task.content}
                              </p>
                              <p>
                                <strong>Assigned to:</strong> {task.user ? getUserNameById(task.user) : 'Unassigned'}
                              </p>
                              <p>
                                <strong>Timeline:</strong> {new Date(task.startDate).toLocaleString()} - {new Date(task.deadline).toLocaleString()}
                              </p>
                            </div>
                            <button 
                              onClick={() => handlers.handleRemoveLessonTask(lesson.id, task.id)} 
                              className={styles.smallDeleteButton}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {!editingLessonId && (
                  <button 
                    onClick={() => handleSelectLessonSafely(lesson.id)} 
                    className={`${styles.addButton} ${selectedLessonId === lesson.id ? styles.activeButton : ''}`}
                    disabled={!!editingLessonId || (selectedLessonId !== null && selectedLessonId !== lesson.id)}
                  >
                    {selectedLessonId === lesson.id ? 'Adding Task...' : 'Add Task'}
                  </button>
                )}
              </li>
            ))}
          </ul>
          
          {selectedLessonId && !editingLessonId && (
            <div className={styles.lessonTaskForm}>
              <h4>Add Task to Lesson</h4>
              <label>
                Task Content<span className={styles.required}>*</span>
                <textarea
                  value={lessonTaskContent}
                  onChange={handlers.handleLessonTaskContentChange}
                  placeholder="Enter task description"
                  className={styles.textareaField}
                  required
                />
              </label>
              
              <label>
                Start Date<span className={styles.required}>*</span>
                <input
                  type="datetime-local"
                  value={lessonTaskStartDate}
                  onChange={handlers.handleLessonTaskStartDateChange}
                  className={styles.inputField}
                  required
                />
              </label>
              
              <label>
                Deadline<span className={styles.required}>*</span>
                <input
                  type="datetime-local"
                  value={lessonTaskDeadline}
                  onChange={handlers.handleLessonTaskDeadlineChange}
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
                    value={lessonTaskUser}
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
              
              <div className={styles.lessonTaskFormButtons}>
                <button 
                  onClick={handlers.handleAddLessonTask} 
                  className={styles.addButton}
                  disabled={!isTaskFormValid}
                >
                  Add Task to Lesson
                </button>
                <button onClick={handlers.handleCancelLessonTask} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {errors && <span className={`${styles.errorMessage} error-message`}>{errors}</span>}
    </div>
  );
};

export default LessonsSection;
