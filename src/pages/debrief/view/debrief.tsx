import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './debrief.module.css';
import { Debrief } from '../../../entity/debrief/debrief';
import { useAuthCheck } from '../../auth/hooks/Authentication';

const DebriefView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthorized } = useAuthCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthorized && id) {
      fetchDebrief(id);
    }
  }, [id, isAuthorized]);

  const fetchDebrief = async (debriefId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:4000/debrief/${debriefId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const debriefData : Debrief = response.data.debriefs[0];
      debriefData.createdBy = response.data.debriefs[0].metaData.createdBy;
      debriefData.updatedBy = response.data.debriefs[0].metaData.updatedBy;
      console.log('Fetched debrief:', debriefData);
      
      if (debriefData && debriefData.contentItems) {
        debriefData.contentItems = debriefData.contentItems.map((item: any) => {
          // If item doesn't have a type, infer it from its structure
          if (!item.type) {
            if (item.comments) {
              item.type = 'paragraph';
            } else if (item.columns && item.rows) {
              item.type = 'table';
            }
          }
          return item;
        });
      }
      
      setDebrief(debriefData);
    } catch (err) {
      console.error('Error fetching debrief:', err);
      setError('Failed to load debrief. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Parse labels string into array (assuming labels are comma-separated)
  const parseLabels = (labelsString: string): string[] => {
    if (!labelsString) return [];
    return labelsString.split(',').map(label => label.trim()).filter(label => label);
  };

  const safeDisplay = (content: any): string => {
    if (content === null || content === undefined) return '';
    if (typeof content === 'string' || typeof content === 'number') return content.toString();
    if (typeof content === 'object') return JSON.stringify(content);
    return '';
  };

  // Helper function to determine if an item is a table based on its structure
  const isTable = (item: any): boolean => {
    return item.type === 'table' || (!item.type && item.columns && item.rows);
  };

  // Helper function to determine if an item is a paragraph based on its structure
  const isParagraph = (item: any): boolean => {
    return item.type === 'paragraph' || (!item.type && item.comments);
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.debriefContainer}>
      <div className={styles.debriefHeader}>
        <Link to="/debriefs" className={styles.backButton}>← Back to Debriefs</Link>
        {!loading && !error && debrief && (
          <div className={styles.headerActions}>
            <Link to={`/debrief/edit/${id}`} className={styles.editButton}>Edit Debrief</Link>
          </div>
        )}
      </div>

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading debrief...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => fetchDebrief(id || '')} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && debrief && (
        <div className={styles.debriefContent}>
          <h1 className={styles.debriefTitle}>{safeDisplay(debrief.title)}</h1>
          <div className={styles.debriefMeta}>
            <span className={styles.debriefDate}>Date: {formatDate(debrief.date)}</span>
            <span className={styles.debriefCreator}>Created by: {safeDisplay(debrief.createdBy)}</span>
            
            {/* Labels display */}
            {debrief.labels && (
              <div className={styles.labelsContainer}>
                <strong>Labels: </strong>
                <div className={styles.labelsList}>
                  {parseLabels(debrief.labels).map((label, index) => (
                    <span key={index} className={styles.labelItem}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.contentItemsSection}>
            <h2 className={styles.sectionTitle}>Content Items</h2>
            <div className={styles.sectionContent}>
              <div style={{marginBottom: '10px', color: 'gray'}}>
                <small>Content Items Count: {debrief.contentItems ? debrief.contentItems.length : 0}</small>
                {debrief.contentItems && debrief.contentItems.length > 0 && (
                  <small style={{marginLeft: '10px'}}>
                    (Paragraphs: {debrief.contentItems.filter(item => isParagraph(item)).length}, 
                    Tables: {debrief.contentItems.filter(item => isTable(item)).length})
                  </small>
                )}
              </div>
              
              {debrief.contentItems && debrief.contentItems.some(item => isParagraph(item)) ? (
                <div className={styles.paragraphsContainer}>
                  <h3 className={styles.contentSubtitle}>Paragraphs</h3>
                  {debrief.contentItems
                    .filter(item => isParagraph(item))
                    .map((paragraph: any, index) => (
                      <div key={paragraph.id || index} className={styles.paragraphItem}>
                        <h4 className={styles.paragraphTitle}>
                          {index + 1}. {safeDisplay(paragraph.name)}
                        </h4>
                        <div className={styles.commentsContainer}>
                          {paragraph.comments && paragraph.comments.length > 0 ? (
                            paragraph.comments.map((comment: any, commentIndex: number) => (
                              <div key={comment.id || `comment-${commentIndex}`} className={styles.commentItem}>
                                <span className={styles.commentBullet}>{commentIndex + 1}.</span>
                                <span className={styles.commentText}>{safeDisplay(comment.bullet || comment.text || comment.content)}</span>
                              </div>
                            ))
                          ) : (
                            <p>No comments available</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className={styles.emptySection}>
                  <p>No paragraphs available</p>
                </div>
              )}

              {debrief.contentItems && debrief.contentItems.some(item => isTable(item)) ? (
                <div className={styles.tablesContainer}>
                  <h3 className={styles.contentSubtitle}>Tables</h3>
                  {debrief.contentItems
                    .filter(item => isTable(item))
                    .map((table: any, index) => (
                      <div key={table.id || index} className={styles.tableItem}>
                        <h4 className={styles.tableTitle}>
                          {index + 1}. {safeDisplay(table.name)}
                        </h4>
                        {table.columns && table.rows ? (
                          <div className={styles.tableContainer}>
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  {table.columns.map((column: any, colIndex: number) => (
                                    <th key={column.id || `col-${colIndex}`} className={styles.tableHeader}>
                                      {safeDisplay(column.name)}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows.map((row: any, rowIndex: number) => (
                                  <tr key={row.id || `row-${rowIndex}`} className={styles.tableRow}>
                                    {table.columns.map((column: any, colIndex: number) => {
                                      // Try different methods to find the cell
                                      let cell = null;
                                      // Method 1: Look for cell.column === column.id
                                      if (row.cells && row.cells.length > 0) {
                                        cell = row.cells.find((c: any) => String(c.column) === String(column.id));
                                      }
                                      
                                      // Method 2: Look for cell directly in row by column index
                                      if (!cell && row.cells && row.cells[colIndex]) {
                                        cell = row.cells[colIndex];
                                      }
                                      
                                      // Method 3: Look if the row has a direct property matching the column name
                                      const columnKey = column.name?.toLowerCase().replace(/\s+/g, '_');
                                      if (!cell && columnKey && row[columnKey] !== undefined) {
                                        cell = { value: row[columnKey] };
                                      }
                                      
                                      return (
                                        <td key={`cell-${rowIndex}-${colIndex}`} className={styles.tableCell}>
                                          {cell ? safeDisplay(cell.value || cell.content || cell.text || cell) : ''}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p>Table structure is incomplete: {JSON.stringify(table)}</p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className={styles.emptySection}>
                  <p>No tables available</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.tasksSection}>
            <h2 className={styles.sectionTitle}>Tasks</h2>
            {debrief.tasks && debrief.tasks.length > 0 ? (
              <div className={styles.tasksList}>
                {debrief.tasks.map((task, index) => (
                  <div key={task.id} className={styles.taskItem}>
                    <div className={styles.taskHeader}>
                      <span className={styles.taskNumber}>{index + 1}.</span>
                      <span className={styles.taskContent}>{safeDisplay(task.content)}</span>
                    </div>
                    <div className={styles.taskDetails}>
                      <span className={styles.taskAssigned}>
                        <strong>Assigned to:</strong> {safeDisplay(task.user.id) || 'Unassigned'}
                      </span>
                      <span className={styles.taskDates}>
                        <strong>Start:</strong> {formatDate(task.startDate)} | 
                        <strong>Deadline:</strong> {formatDate(task.deadline)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>No tasks assigned.</p>
            )}
          </div>

          {/* Lessons Section */}
          <div className={styles.lessonsSection}>
            <h2 className={styles.sectionTitle}>Lessons Learned</h2>
            {debrief.lessons && debrief.lessons.length > 0 ? (
              <div className={styles.lessonsList}>
                {debrief.lessons.map((lesson, index) => (
                  <div key={lesson.id} className={styles.lessonItem}>
                    <div className={styles.lessonHeader}>
                      <span className={styles.lessonNumber}>{index + 1}.</span>
                      <span className={styles.lessonContent}>{safeDisplay(lesson.content)}</span>
                    </div>
                    
                    {lesson.tasks && lesson.tasks.length > 0 && (
                      <div className={styles.lessonTasks}>
                        <h4>Related Tasks</h4>
                        {lesson.tasks.map((task, taskIndex) => (
                          <div key={task.id} className={styles.lessonTaskItem}>
                            <div className={styles.lessonTaskHeader}>
                              <span className={styles.lessonTaskNumber}>{taskIndex + 1}.</span>
                              <span className={styles.lessonTaskContent}>{safeDisplay(task.content)}</span>
                            </div>
                            <div className={styles.lessonTaskDetails}>
                              <span className={styles.lessonTaskAssigned}>
                                <strong>Assigned to:</strong> {safeDisplay(task.user.id) || 'Unassigned'}
                              </span>
                              <span className={styles.lessonTaskDates}>
                                <strong>Start:</strong> {formatDate(task.startDate)} | 
                                <strong>Deadline:</strong> {formatDate(task.deadline)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>No lessons recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebriefView;