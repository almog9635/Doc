import React from 'react';
import styles from '../debrief.module.css';
import { Comment } from '../../../../entity/debrief/content/paragraph/comment';

interface MandatorySectionHandlers {
  handleCommentBulletChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleAddComment: () => void;
  handleEditComment: (id: string | null) => void; // Allow null for cancel
  handleUpdateComment: () => void;
  handleDeleteComment: (id: string) => void;
  handleEditCommentBulletChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

interface MandatorySectionProps {
  title: string;
  comments: Comment[];
  commentBullet: string; // For adding new comments
  editingCommentId: string | null;
  editCommentBullet: string; // For editing existing comments
  handlers: MandatorySectionHandlers;
  error?: string;
}

const MandatorySection: React.FC<MandatorySectionProps> = ({
  title,
  comments,
  commentBullet,
  editingCommentId,
  editCommentBullet,
  handlers,
  error
}) => {
  return (
    <div className={styles.mandatorySection}>
      <h3>{title}</h3>
      <div className={styles.commentForm}>
        {editingCommentId ? (
          <>
            <label>
              Edit Point<span className={styles.required}>*</span>
              <textarea
                value={editCommentBullet}
                onChange={handlers.handleEditCommentBulletChange}
                placeholder="Enter point details"
                className={styles.textareaField}
                required
              />
            </label>
            <div className={styles.editButtonGroup}>
              <button onClick={handlers.handleUpdateComment} className={styles.updateButton}>
                Update Point
              </button>
              <button onClick={() => handlers.handleEditComment(null)} className={styles.cancelEditButton}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <label>
              New Point<span className={styles.required}>*</span>
              <textarea
                value={commentBullet}
                onChange={handlers.handleCommentBulletChange}
                placeholder="Enter point details"
                className={styles.textareaField}
                required
              />
            </label>
            <button onClick={handlers.handleAddComment} className={styles.addButton}>Add Point</button>
          </>
        )}
      </div>

      {comments.length > 0 ? (
        <div className={styles.commentListContainer}>
          <h4>Points</h4>
          <ul className={styles.commentList}>
            {comments.map((comment, index) => (
              <li key={comment.id} className={styles.commentListItem}>
                {editingCommentId === comment.id ? (
                  <div className={styles.commentEditForm}>
                    {/* Edit form is now outside the list item */}
                  </div>
                ) : (
                  <>
                    <div className={styles.commentContent}>
                      <span className={styles.bulletPoint}>•</span> {comment.bullet}
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        onClick={() => handlers.handleEditComment(comment.id)}
                        className={styles.smallEditButton}
                        disabled={!!editingCommentId} // Disable if any comment is being edited
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handlers.handleDeleteComment(comment.id)}
                        className={styles.smallDeleteButton}
                        disabled={!!editingCommentId} // Disable if any comment is being edited
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles.emptyState}>
          No points added yet. Please add at least one point.
        </p>
      )}

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

// Props for the container component
interface MandatorySectionsProps {
  background: {
    comments: Comment[];
    bullet: string;
    editingCommentId: string | null;
    editBullet: string;
  };
  tripProgress: {
    comments: Comment[];
    bullet: string;
    editingCommentId: string | null;
    editBullet: string;
  };
  routeConsiderations: {
    comments: Comment[];
    bullet: string;
    editingCommentId: string | null;
    editBullet: string;
  };
  handlers: { // Nested handlers object
      background: MandatorySectionHandlers;
      tripProgress: MandatorySectionHandlers;
      routeConsiderations: MandatorySectionHandlers;
  };
  errors: { // Nested errors object
      background?: string;
      tripProgress?: string;
      routeConsiderations?: string;
  };
}


const MandatorySections: React.FC<MandatorySectionsProps> = ({
  background,
  tripProgress,
  routeConsiderations,
  handlers,
  errors
}) => {
  return (
    <div className={styles.mandatorySectionsContainer}>
      <h2>Required Information</h2>

      <MandatorySection
        title="Background"
        comments={background.comments}
        commentBullet={background.bullet}
        editingCommentId={background.editingCommentId}
        editCommentBullet={background.editBullet}
        handlers={handlers.background} // Pass specific handlers
        error={errors.background}
      />

      <MandatorySection
        title="Trip Progress"
        comments={tripProgress.comments}
        commentBullet={tripProgress.bullet}
        editingCommentId={tripProgress.editingCommentId}
        editCommentBullet={tripProgress.editBullet}
        handlers={handlers.tripProgress} // Pass specific handlers
        error={errors.tripProgress}
      />

      <MandatorySection
        title="Route Considerations"
        comments={routeConsiderations.comments}
        commentBullet={routeConsiderations.bullet}
        editingCommentId={routeConsiderations.editingCommentId}
        editCommentBullet={routeConsiderations.editBullet}
        handlers={handlers.routeConsiderations} // Pass specific handlers
        error={errors.routeConsiderations}
      />
    </div>
  );
};

export default MandatorySections;