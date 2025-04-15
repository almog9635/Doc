import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ContentItem } from '../../../../entity/debrief/content/content-item';
import { Task } from '../../../../entity/debrief/task';
import { Lesson } from '../../../../entity/debrief/lesson';
import { Table } from '../../../../entity/debrief/content/table/table';
import { Column } from '../../../../entity/debrief/content/table/column';
import { Row } from '../../../../entity/debrief/content/table/row';
import { Paragraph } from '../../../../entity/debrief/content/paragraph/paragraph';
import { Comment } from '../../../../entity/debrief/content/paragraph/comment';

export function useDebriefForm() {
  // Form data
  const [title, setTitle] = useState<string>('');
  const [debriefDate, setDebriefDate] = useState<string>('');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  // UI state
  const [editMode, setEditMode] = useState<boolean>(false);
  const [contentType, setContentType] = useState<'TABLE' | 'PARAGRAPH'>('PARAGRAPH');
  const [currentContentName, setCurrentContentName] = useState<string>('');
  const [columnName, setColumnName] = useState<string>('');
  const [commentBullet, setCommentBullet] = useState<string>('');
  
  // Edit mode state
  const [editingContentItemId, setEditingContentItemId] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editColumnName, setEditColumnName] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentBullet, setEditCommentBullet] = useState<string>('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonContent, setEditLessonContent] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskContent, setEditTaskContent] = useState<string>('');
  const [editTaskStartDate, setEditTaskStartDate] = useState<string>('');
  const [editTaskDeadline, setEditTaskDeadline] = useState<string>('');
  const [editTaskUser, setEditTaskUser] = useState<string>('');
  
  // Form fields state
  const [tableColumns, setTableColumns] = useState<Column[]>([]);
  const [tableRows, setTableRows] = useState<Row[]>([]);
  const [taskContent, setTaskContent] = useState<string>('');
  const [taskStartDate, setTaskStartDate] = useState<string>('');
  const [taskDeadline, setTaskDeadline] = useState<string>('');
  const [taskUser, setTaskUser] = useState<string>('');
  const [lessonContent, setLessonContent] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonTaskContent, setLessonTaskContent] = useState<string>('');
  const [lessonTaskStartDate, setLessonTaskStartDate] = useState<string>('');
  const [lessonTaskDeadline, setLessonTaskDeadline] = useState<string>('');
  const [lessonTaskUser, setLessonTaskUser] = useState<string>('');
  
  // Add this missing state variable
  const [paragraphComments, setParagraphComments] = useState<Comment[]>([]);
  
  // Set default date on mount
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16);
    setDebriefDate(formattedDate);
  }, []);
  
  // Handlers for each section
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebriefDate(e.target.value);
  };
  
  // Content handlers
  const handleAddContentItem = () => {
    if (!currentContentName.trim()) return;
    
    const newItem: ContentItem = {
      id: uuidv4(),
      name: currentContentName,
      index: contentItems.length + 1 // Add index here
    };
    
    if (contentType === 'TABLE') {
      const newTable: Table = {
        ...newItem,
        columns: tableColumns,
        rows: tableRows
      };
      setContentItems([...contentItems, newTable]);
    } else {
      const newParagraph: Paragraph = {
        ...newItem,
        comments: paragraphComments
      };
      setContentItems([...contentItems, newParagraph]);
    }
    
    // Reset form fields
    setCurrentContentName('');
    setTableColumns([]);
    setTableRows([]);
    setParagraphComments([]);
  };
  
  const handleCancelEdit = () => {
    setEditingContentItemId(null);
    setEditingColumnId(null);
    setEditingCommentId(null);
    setEditingLessonId(null);
    setEditingTaskId(null);
    setEditMode(false);
    setEditColumnName('');
    setEditCommentBullet('');
    setEditLessonContent('');
    setEditTaskContent('');
    setEditTaskStartDate('');
    setEditTaskDeadline('');
    setEditTaskUser('');
    setSelectedLessonId(null);
  };
  
  const handleEditContentItem = (id: string) => {
    const contentItem = contentItems.find(item => item.id === id);
    if (!contentItem) return;

    setEditingContentItemId(id);
    setEditMode(true);
    
    if ('columns' in contentItem) {
      // If it's a table
      setContentType('TABLE');
      setTableColumns((contentItem as Table).columns);
      setTableRows((contentItem as Table).rows);
    } else if ('comments' in contentItem) {
      // If it's a paragraph
      setContentType('PARAGRAPH');
      setParagraphComments((contentItem as Paragraph).comments);
    }
    
    setCurrentContentName(contentItem.name);
  };
  
  const handleUpdateContentItem = () => {
    if (!editingContentItemId || !currentContentName.trim()) return;
    
    setContentItems(prev => 
      prev.map(item => {
        if (item.id === editingContentItemId) {
          if (contentType === 'TABLE' && 'columns' in item) {
            return {
              ...item,
              name: currentContentName,
              columns: tableColumns,
              rows: tableRows
            } as Table;
          } else if (contentType === 'PARAGRAPH' && 'comments' in item) {
            return {
              ...item,
              name: currentContentName,
              comments: paragraphComments
            } as Paragraph;
          }
        }
        return item;
      })
    );
    
    // Reset edit mode
    handleCancelEdit();
    
    // Reset form state
    setCurrentContentName('');
    setTableColumns([]);
    setTableRows([]);
    setParagraphComments([]);
  };
  
  const handleAddColumn = () => {
    if (!columnName.trim()) return;
    
    const newColumn: Column = {
      id: uuidv4(),
      name: columnName,
      index: tableColumns.length
    };
    
    setTableColumns([...tableColumns, newColumn]);
    setColumnName('');
  };
  
  const handleEditColumn = (id: string) => {
    setEditingColumnId(id);
    const column = tableColumns.find(col => col.id === id);
    if (column) {
      setEditColumnName(column.name);
    }
  };
  
  const handleUpdateColumn = () => {
    if (!editingColumnId || !editColumnName.trim()) return;
    
    setTableColumns(prev => 
      prev.map(col => 
        col.id === editingColumnId ? { ...col, name: editColumnName } : col
      )
    );
    
    setEditingColumnId(null);
    setEditColumnName('');
  };
  
  const handleDeleteColumn = (id: string) => {
    setTableColumns(prev => prev.filter(col => col.id !== id));
    
    // Also update rows to remove cells for this column
    setTableRows(prev => 
      prev.map(row => ({
        ...row,
        cells: row.cells.filter(cell => cell.column !== id)
      }))
    );
  };
  
  const handleAddRow = () => {
    if (tableColumns.length === 0) {
      alert('Please add at least one column first');
      return;
    }
    
    const rowId = uuidv4();
    const newRow: Row = {
      id: rowId,
      index: tableRows.length,
      cells: tableColumns.map(col => ({
        value: '',
        column: col.id,
        row: rowId
      }))
    };
    
    setTableRows([...tableRows, newRow]);
  };
  
  const handleCellChange = (rowId: string, columnId: string, value: string) => {
    setTableRows(prev => 
      prev.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            cells: row.cells.map(cell => {
              if (cell.column === columnId) {
                return { ...cell, value };
              }
              return cell;
            })
          };
        }
        return row;
      })
    );
  };
  
  const handleAddComment = () => {
    if (!commentBullet.trim()) return;
    
    const newComment: Comment = {
      id: uuidv4(),
      bullet: commentBullet,
      index: paragraphComments.length
    };
    
    setParagraphComments([...paragraphComments, newComment]);
    setCommentBullet('');
  };
  
  const handleEditComment = (id: string) => {
    setEditingCommentId(id);
    const comment = paragraphComments.find(c => c.id === id);
    if (comment) {
      setEditCommentBullet(comment.bullet);
    }
  };
  
  const handleUpdateComment = () => {
    if (!editingCommentId || !editCommentBullet.trim()) return;
    
    setParagraphComments(prev => 
      prev.map(comment => 
        comment.id === editingCommentId ? { ...comment, bullet: editCommentBullet } : comment
      )
    );
    
    setEditingCommentId(null);
    setEditCommentBullet('');
  };
  
  const handleDeleteComment = (id: string) => {
    setParagraphComments(prev => prev.filter(comment => comment.id !== id));
  };
  
  const handleAddTask = () => {
    if (!taskContent.trim()) {
      alert("Task content is required");
      return;
    }
    
    if (!taskStartDate || !taskDeadline) {
      alert("Start date and deadline are required");
      return;
    }
    
    const newTask: Task = {
      id: uuidv4(),
      content: taskContent,
      startDate: taskStartDate,
      deadline: taskDeadline,
      user: taskUser
    };
    
    setTasks([...tasks, newTask]);
    
    // Reset fields
    setTaskContent('');
    setTaskUser('');
  };
  
  const handleEditTask = (id: string) => {
    setEditingTaskId(id);
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditTaskContent(task.content);
      setEditTaskStartDate(task.startDate);
      setEditTaskDeadline(task.deadline);
      setEditTaskUser(task.user);
    }
  };
  
  const handleUpdateTask = () => {
    if (!editingTaskId || !editTaskContent.trim()) return;
    
    setTasks(prev => 
      prev.map(task => 
        task.id === editingTaskId ? { 
          ...task, 
          content: editTaskContent,
          startDate: editTaskStartDate,
          deadline: editTaskDeadline,
          user: editTaskUser
        } : task
      )
    );
    
    setEditingTaskId(null);
    setEditTaskContent('');
    setEditTaskStartDate('');
    setEditTaskDeadline('');
    setEditTaskUser('');
  };
  
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };
  
  const handleTaskUserChange = (userId: string) => {
    setTaskUser(userId);
  };

  const handleEditTaskUserChange = (userId: string) => {
    setEditTaskUser(userId);
  };
  
  const handleAddLesson = () => {
    if (!lessonContent.trim()) {
      alert("Lesson content is required");
      return;
    }
    
    const newLesson: Lesson = {
      id: uuidv4(),
      content: lessonContent,
      tasks: []
    };
    
    setLessons([...lessons, newLesson]);
    setLessonContent('');
  };
  
  const handleEditLesson = (id: string) => {
    setEditingLessonId(id);
    const lesson = lessons.find(l => l.id === id);
    if (lesson) {
      setEditLessonContent(lesson.content);
    }
  };
  
  const handleUpdateLesson = () => {
    if (!editingLessonId || !editLessonContent.trim()) return;
    
    setLessons(prev => 
      prev.map(lesson => 
        lesson.id === editingLessonId ? { ...lesson, content: editLessonContent } : lesson
      )
    );
    
    setEditingLessonId(null);
    setEditLessonContent('');
  };
  
  const handleDeleteLesson = (id: string) => {
    setLessons(prev => prev.filter(lesson => lesson.id !== id));
    if (selectedLessonId === id) {
      setSelectedLessonId(null);
    }
  };
  
  const handleSelectLesson = (id: string) => {
    setSelectedLessonId(id === selectedLessonId ? null : id);
    setLessonTaskContent('');
    setLessonTaskStartDate('');
    setLessonTaskDeadline('');
    setLessonTaskUser('');
  };
  
  const handleAddLessonTask = () => {
    if (!selectedLessonId || !lessonTaskContent.trim()) {
      alert("Task content is required");
      return;
    }
    
    if (!lessonTaskStartDate || !lessonTaskDeadline) {
      alert("Start date and deadline are required");
      return;
    }
    
    const newTask: Task = {
      id: uuidv4(),
      content: lessonTaskContent,
      startDate: lessonTaskStartDate,
      deadline: lessonTaskDeadline,
      user: lessonTaskUser
    };
    
    setLessons(prev => 
      prev.map(lesson => 
        lesson.id === selectedLessonId 
          ? { ...lesson, tasks: [...lesson.tasks, newTask] } 
          : lesson
      )
    );
    
    // Reset fields
    setLessonTaskContent('');
    setLessonTaskUser('');
  };
  
  const handleRemoveLessonTask = (lessonId: string, taskId: string) => {
    setLessons(prev => 
      prev.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, tasks: lesson.tasks.filter(task => task.id !== taskId) } 
          : lesson
      )
    );
  };
  
  const handleCancelLessonTask = () => {
    setSelectedLessonId(null);
    setLessonTaskContent('');
    setLessonTaskStartDate('');
    setLessonTaskDeadline('');
    setLessonTaskUser('');
  };
  
  const handleColumnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColumnName(e.target.value);
  };

  const handleCommentBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentBullet(e.target.value);
  };

  const handleLessonTaskUserChange = (userId: string) => {
    setLessonTaskUser(userId);
  };
  
  // Grouped handlers for easier passing to components
  const contentHandlers = {
    handleContentTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => 
      setContentType(e.target.value as 'TABLE' | 'PARAGRAPH'),
    handleContentNameChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      setCurrentContentName(e.target.value),
    handleColumnNameChange,
    handleCommentBulletChange,
    handleAddContentItem,
    handleEditContentItem,
    handleUpdateContentItem,
    handleCancelEdit,
    handleAddColumn,
    handleEditColumn,
    handleUpdateColumn,
    handleDeleteColumn,
    handleAddRow,
    handleCellChange,
    handleAddComment,
    handleEditComment,
    handleUpdateComment,
    handleDeleteComment
  };
  
  const taskHandlers = {
    handleTaskContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => 
      setTaskContent(e.target.value),
    handleTaskStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => 
      setTaskStartDate(e.target.value),
    handleTaskDeadlineChange: (e: React.ChangeEvent<HTMLInputElement>) => 
      setTaskDeadline(e.target.value),
    handleTaskUserChange,
    handleAddTask,
    handleEditTask,
    handleUpdateTask,
    handleDeleteTask,
    handleCancelEdit,
    handleEditTaskUserChange
  };
  
  const lessonHandlers = {
    handleLessonContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => 
      setLessonContent(e.target.value),
    handleAddLesson,
    handleEditLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleSelectLesson,
    handleLessonTaskContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => 
      setLessonTaskContent(e.target.value),
    handleLessonTaskStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => 
      setLessonTaskStartDate(e.target.value),
    handleLessonTaskDeadlineChange: (e: React.ChangeEvent<HTMLInputElement>) => 
      setLessonTaskDeadline(e.target.value),
    handleLessonTaskUserChange,
    handleAddLessonTask,
    handleRemoveLessonTask,
    handleCancelLessonTask,
    handleCancelEdit,
    handleEditLessonContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => 
      setEditLessonContent(e.target.value),
    handleEditTaskContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => 
      setEditTaskContent(e.target.value),
    handleEditTaskStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => 
      setEditTaskStartDate(e.target.value),
    handleEditTaskDeadlineChange: (e: React.ChangeEvent<HTMLInputElement>) => 
      setEditTaskDeadline(e.target.value),
    handleEditTaskUserChange,
    handleCommentBulletChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => 
      setEditCommentBullet(e.target.value)
  };
  
  return {
    formData: {
      title,
      debriefDate,
      contentItems,
      tasks,
      lessons
    },
    uiState: {
      contentType,
      editMode,
      currentContentName,
      columnName,
      commentBullet,
      tableColumns,
      tableRows,
      taskContent,
      taskStartDate,
      taskDeadline,
      taskUser,
      lessonContent,
      selectedLessonId,
      lessonTaskContent,
      lessonTaskStartDate,
      lessonTaskDeadline,
      lessonTaskUser,
      editingContentItemId,
      editingColumnId,
      editColumnName,
      editingCommentId,
      editCommentBullet,
      editingLessonId,
      editLessonContent,
      editingTaskId,
      editTaskContent,
      editTaskStartDate,
      editTaskDeadline,
      editTaskUser,
      paragraphComments // Add this to the returned state
    },
    handlers: {
      handleTitleChange,
      handleDateChange,
      contentHandlers,
      taskHandlers,
      lessonHandlers
    }
  };
}
