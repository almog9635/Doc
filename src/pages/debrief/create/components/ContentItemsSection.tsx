import React from 'react';
import styles from '../debrief.module.css';
import { ContentItem } from '../../../../entity/debrief/content/content-item';
import { Column } from '../../../../entity/debrief/content/table/column';
import { Row } from '../../../../entity/debrief/content/table/row';
import { Comment } from '../../../../entity/debrief/content/paragraph/comment';

interface ContentItemsSectionProps {
  contentItems: ContentItem[];
  contentType: 'TABLE' | 'PARAGRAPH';
  editMode: boolean;
  currentContentName: string;
  columnName: string;
  commentBullet: string;
  tableColumns: Column[];
  tableRows: Row[];
  paragraphComments: Comment[]; // Make sure this is properly typed
  editingContentItemId: string | null;
  editingColumnId: string | null;
  editColumnName: string;
  editingCommentId: string | null;
  editCommentBullet: string;
  handlers: {
    handleContentTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleContentNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleColumnNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Add this new handler
    handleAddContentItem: () => void;
    handleEditContentItem: (id: string) => void;
    handleUpdateContentItem: () => void;
    handleCancelEdit: () => void;
    handleAddColumn: () => void;
    handleEditColumn: (id: string) => void;
    handleUpdateColumn: () => void;
    handleDeleteColumn: (id: string) => void;
    handleAddRow: () => void;
    handleCellChange: (rowId: string, columnId: string, value: string) => void;
    handleAddComment: () => void;
    handleEditComment: (id: string) => void;
    handleUpdateComment: () => void;
    handleDeleteComment: (id: string) => void;
    handleCommentBulletChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  };
  errors: string;
}

const ContentItemsSection: React.FC<ContentItemsSectionProps> = ({
  contentItems,
  contentType,
  editMode,
  currentContentName,
  columnName,
  commentBullet,
  tableColumns,
  tableRows,
  paragraphComments,
  editingContentItemId,
  editingColumnId,
  editColumnName,
  editingCommentId,
  editCommentBullet,
  handlers,
  errors
}) => {
  return (
    <div className={styles.debriefSection}>
      <h2>{editMode ? 'Edit Content Item' : 'Content Items'}</h2>
      <div className={styles.contentForm}>
        <label>
          Content Type
          <select 
            value={contentType} 
            onChange={handlers.handleContentTypeChange}
            className={styles.selectField}
            disabled={editMode && 'columns' in contentItems.find(item => item.id === editingContentItemId)!}
          >
            <option value="PARAGRAPH">Paragraph</option>
            <option value="TABLE">Table</option>
          </select>
        </label>
        
        <label>
          Content Name
          <input
            type="text"
            value={currentContentName}
            onChange={handlers.handleContentNameChange}
            placeholder="Enter content name"
            className={styles.inputField}
          />
        </label>
        
        {contentType === 'TABLE' && (
          <div className={styles.tableSection}>
            <h3>Define Table</h3>
            
            <div className={styles.columnForm}>
              {editingColumnId ? (
                <>
                  <label>
                    Edit Column Name
                    <input
                      type="text"
                      value={editColumnName}
                      onChange={(e) => handlers.handleColumnNameChange(e)}
                      placeholder="Enter column name"
                      className={styles.inputField}
                    />
                  </label>
                  <button onClick={handlers.handleUpdateColumn} className={styles.updateButton}>
                    Update Column
                  </button>
                  <button onClick={() => handlers.handleCancelEdit()} className={styles.cancelButton}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <label>
                    Column Name
                    <input
                      type="text"
                      value={columnName}
                      onChange={handlers.handleColumnNameChange}
                      placeholder="Enter column name"
                      className={styles.inputField}
                    />
                  </label>
                  <button onClick={handlers.handleAddColumn} className={styles.addButton}>
                    Add Column
                  </button>
                </>
              )}
            </div>
            
            {tableColumns.length > 0 && (
              <div>
                <h4>Columns</h4>
                <ul className={styles.columnList}>
                  {tableColumns.map((column, index) => (
                    <li key={column.id} className={styles.columnListItem}>
                      <span>{index + 1}. {column.name}</span>
                      <div className={styles.itemActions}>
                        <button 
                          onClick={() => handlers.handleEditColumn(column.id)} 
                          className={styles.smallEditButton}
                          disabled={!!editingColumnId}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handlers.handleDeleteColumn(column.id)} 
                          className={styles.smallDeleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <button onClick={handlers.handleAddRow} className={styles.addButton}>Add Row</button>
                
                {tableRows.length > 0 && (
                  <div className={styles.tablePreview}>
                    <h4>Table Preview</h4>
                    <table>
                      <thead>
                        <tr>
                          {tableColumns.map(column => (
                            <th key={column.id}>{column.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map(row => (
                          <tr key={row.id}>
                            {tableColumns.map(column => {
                              const cell = row.cells.find(c => c.column === column.id);
                              return (
                                <td key={`${row.id}-${column.id}`}>
                                  <input
                                    type="text"
                                    value={cell?.value || ''}
                                    onChange={(e) => handlers.handleCellChange(row.id, column.id, e.target.value)}
                                    className={styles.cellInput}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {contentType === 'PARAGRAPH' && (
          <div className={styles.paragraphSection}>
            <h3>Define Paragraph</h3>
            
            <div className={styles.commentForm}>
              {editingCommentId ? (
                <>
                  <label>
                    Edit Comment
                    <textarea
                      value={editCommentBullet}
                      onChange={(e) => handlers.handleCommentBulletChange(e)}
                      placeholder="Enter comment"
                      className={styles.textareaField}
                    />
                  </label>
                  <button onClick={handlers.handleUpdateComment} className={styles.updateButton}>
                    Update Comment
                  </button>
                  <button onClick={() => handlers.handleCancelEdit()} className={styles.cancelButton}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <label>
                    Comment
                    <textarea
                      value={commentBullet}
                      onChange={handlers.handleCommentBulletChange}
                      placeholder="Enter comment"
                      className={styles.textareaField}
                    />
                  </label>
                  <button onClick={handlers.handleAddComment} className={styles.addButton}>
                    Add Comment
                  </button>
                </>
              )}
            </div>
            
            {/* Add null check before accessing .length */}
            {paragraphComments && paragraphComments.length > 0 && (
              <div>
                <h4>Comments</h4>
                <ul className={styles.commentList}>
                  {paragraphComments.map((comment, index) => (
                    <li key={comment.id} className={styles.commentListItem}>
                      <span>{index + 1}. {comment.bullet}</span>
                      <div className={styles.itemActions}>
                        <button 
                          onClick={() => handlers.handleEditComment(comment.id)} 
                          className={styles.smallEditButton}
                          disabled={!!editingCommentId}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handlers.handleDeleteComment(comment.id)} 
                          className={styles.smallDeleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {editMode ? (
          <div className={styles.editButtonGroup}>
            <button onClick={handlers.handleUpdateContentItem} className={styles.updateButton}>
              Update Content Item
            </button>
            <button onClick={handlers.handleCancelEdit} className={styles.cancelEditButton}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={handlers.handleAddContentItem} className={styles.addButton}>
            Add Content Item
          </button>
        )}
      </div>
      
      {contentItems.length > 0 && (
        <div>
          <h3>Content Items</h3>
          <ul className={styles.contentList}>
            {contentItems.map((item, index) => (
              <li key={item.id} className={styles.contentListItem}>
                <div className={styles.contentItemInfo}>
                  {index + 1}. {item.name} - Type: {'columns' in item ? 'Table' : 'Paragraph'}
                </div>
                <div className={styles.contentItemActions}>
                  <button 
                    onClick={() => handlers.handleEditContentItem(item.id)} 
                    className={styles.editButton}
                    disabled={editMode}
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {errors && <span className={styles.errorMessage}>{errors}</span>}
    </div>
  );
};

export default ContentItemsSection;
