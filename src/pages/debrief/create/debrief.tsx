import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { DecodedToken } from '../../../entity/decodedToken';
import { ApiDebriefInput, ApiTask, ApiLesson, ApiParagraph, ApiTable } from '../../../input/debrief/api-types';
import styles from './debrief.module.css';

// Import components
import BasicInfo from './components/BasicInfo';
import ContentItemsSection from './components/ContentItemsSection';
import TasksSection from './components/TasksSection';
import LessonsSection from './components/LessonsSection';

// Import hooks
import { useDebriefForm } from './hooks/useDebriefForm';
import { useValidation } from './hooks/useValidation';
import { useAuthCheck } from '../../auth/hooks/Authentication';

const DebriefForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useAuthCheck();
  
  const {
    formData,
    uiState,
    handlers
  } = useDebriefForm();
  
  const { errors, validateForm } = useValidation(formData);

  const handleSubmit = async () => {
    if (!validateForm()) {
      const errorElement = document.querySelector('.'+styles.errorMessage);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    
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
      
      formData.contentItems.forEach(item => {
        if ('columns' in item) {
          tables.push(item);
        } else if ('comments' in item) {
          paragraphs.push(item);
        }
      });
      
      // Prepare tasks with null IDs
      const tasksWithNullIds: ApiTask[] = formData.tasks.map(task => ({
        ...task,
        id: null
      }));
      
      // Prepare lessons with null IDs
      const lessonsWithNullIds: ApiLesson[] = formData.lessons.map(lesson => ({
        ...lesson,
        id: null,
        tasks: lesson.tasks.map(task => ({
          ...task,
          id: null
        }))
      }));
      
      // Prepare paragraphs with null IDs
      const paragraphsWithNullIds: ApiParagraph[] = paragraphs.map(paragraph => ({
        ...paragraph,
        id: null,
        comments: paragraph.comments
      }));
      
      // Prepare tables with null IDs
      const tablesWithNullIds: ApiTable[] = tables.map(table => ({
        ...table,
        id: null,
        columns: table.columns,
        rows: table.rows
      }));
      
      // Create the API-specific debrief object
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
      
      <ContentItemsSection 
        contentItems={formData.contentItems}
        contentType={uiState.contentType}
        editMode={uiState.editMode}
        currentContentName={uiState.currentContentName}
        columnName={uiState.columnName}
        commentBullet={uiState.commentBullet}
        tableColumns={uiState.tableColumns}
        tableRows={uiState.tableRows}
        paragraphComments={uiState.paragraphComments || []} // Add null fallback
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