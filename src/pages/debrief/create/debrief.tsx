import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { DecodedToken } from '../../../entity/decodedToken';
import { ApiDebriefInput, ApiTask, ApiLesson, ApiParagraph, ApiTable } from '../../../input/debrief/api-types';
import styles from './debrief.module.css';
import BasicInfo from './components/BasicInfo';
import ContentItemsSection from './components/ContentItemsSection';
import TasksSection from './components/TasksSection';
import LessonsSection from './components/LessonsSection';
import MandatorySections from './components/mandatory';
import { useDebriefForm } from './hooks/useDebriefForm';
import { useValidation } from './hooks/useValidation';
import { useAuthCheck } from '../../auth/hooks/Authentication';

const DebriefForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useAuthCheck(['admin', 'leader', 'soldier']);
  
  const {
    formData,
    uiState,
    handlers
  } = useDebriefForm();
  
  const { errors, isValid } = useValidation(formData);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isValid) {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const decoded = jwtDecode<DecodedToken>(token);
        
        // Group content items by type
        const paragraphs: any[] = [];
        const tables: any[] = [];
        
        // Add mandatory sections as paragraphs
        if (formData.backgroundComments.length > 0) {
          paragraphs.push({
            id: null, // Will be set later
            name: 'Background',
            comments: formData.backgroundComments
          });
        }
        if (formData.tripProgressComments.length > 0) {
          paragraphs.push({
            id: null, // Will be set later
            name: 'Trip Progress',
            comments: formData.tripProgressComments
          });
        }
        if (formData.routeConsiderationsComments.length > 0) {
          paragraphs.push({
            id: null, // Will be set later
            name: 'Route Considerations',
            comments: formData.routeConsiderationsComments
          });
        }
        
        // Add other content items
        formData.contentItems.forEach(item => {
          if ('columns' in item) {
            tables.push(item);
          } else if ('comments' in item) {
            // Ensure it's not one of the mandatory sections already added
            if (!['Background', 'Trip Progress', 'Route Considerations'].includes(item.name)) {
              paragraphs.push(item);
            }
          }
        });
        
        // Prepare tasks with null IDs
        const tasksWithNullIds: ApiTask[] = formData.tasks.map(task => ({
          id: null,
          content: task.content,
          startDate: task.startDate,
          deadline: task.deadline,
          user: task.user
        }));
        
        // Prepare lessons with null IDs
        const lessonsWithNullIds: ApiLesson[] = formData.lessons.map(lesson => ({
          id: null,
          content: lesson.content, // Explicitly include required fields
          tasks: lesson.tasks.map(task => ({
            id: null,
            content: task.content,
            startDate: task.startDate,
            deadline: task.deadline,
            user: task.user.id
          }))
        }));
        
        const paragraphsWithNullIds: ApiParagraph[] = paragraphs.map((paragraph, index) => ({
          id: null,
          name: paragraph.name,
          index: index, // Use map index
          comments: paragraph.comments.map((comment: any, commentIndex: number) => ({
            id: null,
            bullet: comment.bullet,
            index: commentIndex // Use map index for comments
          }))
        }));
        
        const tablesWithNullIds: ApiTable[] = tables.map((table, index) => ({
          id: null,
          name: table.name,
          index: index,
          columns: table.columns,
          rows: table.rows.map((row: any) => ({
            id: row.id,
            index: row.index,
            cells: row.cells.map((cell: any) => ({
              row: row.id,
              column: cell.column,
              value: cell.value
            }))
          }))
        }));
        
        const debrief: ApiDebriefInput = {
          id: uuidv4(),
          title: formData.title,
          date: new Date(formData.debriefDate).toISOString(),
          contentItems: {
            paragraphs: paragraphsWithNullIds,
            tables: tablesWithNullIds
          },
          tasks: tasksWithNullIds,
          lessons: lessonsWithNullIds,
        };
        
        console.log('Sending debrief:', debrief);
        
        const response = await axios.post('http://localhost:4000/debrief/create', debrief, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Id': decoded.sub
          }
        });
        
        if (response.status === 201 || response.status === 200) {
          navigate('/debriefs');
        } else {
          console.error('Error response:', response);
        }
      } catch (error) {
        console.error('Error creating debrief:', error);
      }
    } else {
      console.log("Form is invalid:", errors);
      const errorElement = document.querySelector('.'+styles.errorMessage);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (isAuthorized === false) {
    return null;
  }

  return (
    <div className={styles.debriefContainer}>
      <h1 className={styles.title}>Create Debrief</h1>
      
      <BasicInfo 
        title={formData.title}
        debriefDate={formData.debriefDate}
        onTitleChange={handlers.handleTitleChange}
        onDateChange={handlers.handleDateChange}
        errors={errors}
      />
      
      <MandatorySections
        background={{
          comments: formData.backgroundComments,
          bullet: uiState.backgroundBullet,
          editingCommentId: uiState.editingBackgroundCommentId,
          editBullet: uiState.editBackgroundCommentBullet,
        }}
        tripProgress={{
          comments: formData.tripProgressComments,
          bullet: uiState.tripProgressBullet,
          editingCommentId: uiState.editingTripProgressCommentId,
          editBullet: uiState.editTripProgressCommentBullet,
        }}
        routeConsiderations={{
          comments: formData.routeConsiderationsComments,
          bullet: uiState.routeConsiderationsBullet,
          editingCommentId: uiState.editingRouteConsiderationsCommentId,
          editBullet: uiState.editRouteConsiderationsCommentBullet,
        }}
        handlers={handlers.mandatoryHandlers}
        errors={{
          background: errors.background,
          tripProgress: errors.tripProgress,
          routeConsiderations: errors.routeConsiderations
        }}
      />
      
      <ContentItemsSection 
        contentItems={formData.contentItems}
        contentType={uiState.contentType}
        editMode={uiState.editMode}
        currentContentName={uiState.currentContentName}
        columnName={uiState.columnName}
        commentBullet={uiState.commentBullet}
        tableColumns={uiState.tableColumns}
        tableRows={uiState.tableRows}
        paragraphComments={uiState.paragraphComments || []}
        editingContentItemId={uiState.editingContentItemId}
        editingColumnId={uiState.editingColumnId}
        editColumnName={uiState.editColumnName}
        editingCommentId={uiState.editingCommentId}
        editCommentBullet={uiState.editCommentBullet}
        handlers={handlers.contentHandlers}
        errors={errors.contentItems}
      />
      
      <TasksSection 
        tasks={formData.tasks}
        taskContent={uiState.taskContent}
        taskStartDate={uiState.taskStartDate}
        taskDeadline={uiState.taskDeadline}
        taskUser={uiState.taskUser}
        editingTaskId={uiState.editingTaskId}
        editTaskContent={uiState.editTaskContent}
        editTaskStartDate={uiState.editTaskStartDate}
        editTaskDeadline={uiState.editTaskDeadline}
        editTaskUser={uiState.editTaskUser}
        handlers={handlers.taskHandlers}
        errors={errors.tasks}
      />
      
      <LessonsSection 
        lessons={formData.lessons}
        lessonContent={uiState.lessonContent}
        selectedLessonId={uiState.selectedLessonId}
        lessonTaskContent={uiState.lessonTaskContent}
        lessonTaskStartDate={uiState.lessonTaskStartDate}
        lessonTaskDeadline={uiState.lessonTaskDeadline}
        lessonTaskUser={uiState.lessonTaskUser}
        editingLessonId={uiState.editingLessonId}
        editLessonContent={uiState.editLessonContent}
        handlers={handlers.lessonHandlers}
        errors={errors.lessons}
      />
      
      <div className={styles.formActions}>
        <button onClick={handleSubmit} className={styles.submitButton}>Create Debrief</button>
        <button onClick={() => navigate('/debriefs')} className={styles.cancelButton}>Cancel</button>
      </div>
    </div>
  );
};

export default DebriefForm;