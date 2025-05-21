import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDebriefData } from './hooks/useDebriefData';
import { useDebriefUpdateForm } from './hooks/useDebriefUpdateForm';
import { useValidation } from './hooks/useValidation';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import styles from '../create/debrief.module.css';

import BasicInfo from '../create/components/BasicInfo';
import MandatorySections from '../create/components/mandatory';
import ContentItemsSection from '../create/components/ContentItemsSection';
import TasksSection from '../create/components/TasksSection';
import LessonsSection from '../create/components/LessonsSection';

const UpdateDebriefPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { debrief, isLoading, error: fetchError } = useDebriefData(id);
    const form = useDebriefUpdateForm(debrief);
    const { errors, validateForm } = useValidation(form.formData);
    
    const tasksToDisplay = useMemo(() => {
        if (!form.tasks || form.tasks.length === 0) {
            return [];
        }
        return form.tasks;
    }, [form.tasks]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validateForm()) {
            window.scrollTo(0, 0);
            return;
        }

        try {
            const success = await form.updateDebrief(id!);
            if (success) {
                navigate(`/debrief/${id}`);
            } else {
                throw new Error('Failed to update debrief');
            }
        } catch (error) {
            setSubmitError('Failed to update debrief. Please try again.');
            window.scrollTo(0, 0);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (fetchError) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>{fetchError}</p>
                <button onClick={() => navigate('/debriefs')} className={styles.backButton}>
                    Back to Debriefs
                </button>
            </div>
        );
    }

    if (!isLoading && !debrief) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>Debrief not found or could not be loaded.</p>
                <button onClick={() => navigate('/debriefs')} className={styles.backButton}>
                    Back to Debriefs
                </button>
            </div>
        );
    }

    return (
        <div className={styles.debriefContainer}>
            <h1>Update Debrief</h1>
            {(submitError || Object.values(errors).some(Boolean)) && (
                <div className={styles.errorSummary}>
                    {submitError && <p className={styles.submitError}>{submitError}</p>}
                    {Object.entries(errors).map(([key, value]) =>
                        value ? <p key={key} className={styles.validationError}>{value}</p> : null
                    )}
                </div>
            )}
            <form noValidate onSubmit={handleSubmit} className={styles.debriefForm}>
                <BasicInfo
                    title={form.title}
                    debriefDate={form.debriefDate}
                    onTitleChange={form.handleTitleChange}
                    onDateChange={form.handleDateChange}
                    errors={errors}
                />
                <MandatorySections
                    background={{
                        comments: form.backgroundComments || [],
                        bullet: form.backgroundCommentBullet,
                        editingCommentId: form.editingCommentId,
                        editBullet: form.editCommentBullet,
                    }}
                    tripProgress={{
                        comments: form.tripProgressComments || [],
                        bullet: form.tripProgressCommentBullet,
                        editingCommentId: form.editingCommentId,
                        editBullet: form.editCommentBullet,
                    }}
                    routeConsiderations={{
                        comments: form.routeConsiderationsComments || [],
                        bullet: form.routeConsiderationsCommentBullet,
                        editingCommentId: form.editingCommentId,
                        editBullet: form.editCommentBullet,
                    }}
                    handlers={{
                        background: {
                            handleCommentBulletChange: form.handleBackgroundCommentBulletChange,
                            handleAddComment: () => form.handleAddComment('background'),
                            handleEditComment: (id) => form.handleEditComment(id, 'background'),
                            handleUpdateComment: () => form.handleUpdateComment('background'),
                            handleDeleteComment: (id) => form.handleDeleteComment(id, 'background'),
                            handleEditCommentBulletChange: form.handleEditCommentBulletChange,
                        },
                        tripProgress: {
                            handleCommentBulletChange: form.handleTripProgressCommentBulletChange,
                            handleAddComment: () => form.handleAddComment('tripProgress'),
                            handleEditComment: (id) => form.handleEditComment(id, 'tripProgress'),
                            handleUpdateComment: () => form.handleUpdateComment('tripProgress'),
                            handleDeleteComment: (id) => form.handleDeleteComment(id, 'tripProgress'),
                            handleEditCommentBulletChange: form.handleEditCommentBulletChange,
                        },
                        routeConsiderations: {
                            handleCommentBulletChange: form.handleRouteConsiderationsCommentBulletChange,
                            handleAddComment: () => form.handleAddComment('routeConsiderations'),
                            handleEditComment: (id) => form.handleEditComment(id, 'routeConsiderations'),
                            handleUpdateComment: () => form.handleUpdateComment('routeConsiderations'),
                            handleDeleteComment: (id) => form.handleDeleteComment(id, 'routeConsiderations'),
                            handleEditCommentBulletChange: form.handleEditCommentBulletChange,
                        },
                    }}
                    errors={{
                        background: errors.background,
                        tripProgress: errors.tripProgress,
                        routeConsiderations: errors.routeConsiderations,
                    }}
                    requireField={false}
                />
                <ContentItemsSection
                    contentItems={form.contentItems}
                    contentType={form.contentType}
                    editMode={form.editMode}
                    currentContentName={form.currentContentName}
                    columnName={form.columnName}
                    commentBullet={form.paragraphCommentBullet}
                    tableColumns={form.tableColumns}
                    tableRows={form.tableRows}
                    paragraphComments={form.paragraphComments}
                    editingContentItemId={form.editingContentItemId}
                    editingColumnId={form.editingColumnId}
                    editColumnName={form.editColumnName}
                    editingCommentId={form.editingCommentId}
                    editCommentBullet={form.editCommentBullet}
                    handlers={form.contentItemHandlers}
                    errors={errors.contentItems}
                />
                <TasksSection
                    tasks={tasksToDisplay}
                    taskContent={form.taskContent}
                    taskStartDate={form.taskStartDate}
                    taskDeadline={form.taskDeadline}
                    taskUser={form.taskUser}
                    editingTaskId={form.editingTaskId}
                    editTaskContent={form.editTaskContent}
                    editTaskStartDate={form.editTaskStartDate}
                    editTaskDeadline={form.editTaskDeadline}
                    editTaskUser={form.editTaskUser}
                    handlers={form.taskHandlers}
                    errors={errors.tasks || ''}
                />
                <LessonsSection
                    lessons={form.lessons}
                    lessonContent={form.lessonContent}
                    selectedLessonId={form.selectedLessonId}
                    lessonTaskContent={form.lessonTaskContent}
                    lessonTaskStartDate={form.lessonTaskStartDate}
                    lessonTaskDeadline={form.lessonTaskDeadline}
                    lessonTaskUser={form.lessonTaskUser}
                    editingLessonId={form.editingLessonId}
                    editLessonContent={form.editLessonContent}
                    handlers={form.lessonHandlers}
                    errors={errors.lessons}
                />
                <div className={styles.formButtons}>
                    <button type="submit" className={styles.submitButton}>
                        Update Debrief
                    </button>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => navigate(`/debrief/${id}`)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateDebriefPage;