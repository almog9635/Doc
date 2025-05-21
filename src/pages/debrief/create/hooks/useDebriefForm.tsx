import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ContentItem } from '../../../../entity/debrief/content/content-item';
import { Task } from '../../../../entity/debrief/task';
import { Lesson } from '../../../../entity/debrief/lesson';
import { Table } from '../../../../entity/debrief/content/table/table';
import { Column } from '../../../../entity/debrief/content/table/column';
import { Row } from '../../../../entity/debrief/content/table/row';
import { Paragraph } from '../../../../entity/debrief/content/paragraph/paragraph';
import { Comment } from '../../../../entity/debrief/content/paragraph/comment';
import { Cell } from '../../../../entity/debrief/content/table/cell';
import { User } from '../../../../entity/user';
import { DecodedToken } from '../../../../entity/decodedToken';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export function useDebriefForm() {
  // Form data
  const [title, setTitle] = useState<string>('');
  const [debriefDate, setDebriefDate] = useState<string>('');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [usersGroup, setUsersGroup] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mandatory Sections State
  const [backgroundComments, setBackgroundComments] = useState<Comment[]>([]);
  const [tripProgressComments, setTripProgressComments] = useState<Comment[]>([]);
  const [routeConsiderationsComments, setRouteConsiderationsComments] = useState<Comment[]>([]);

  const [backgroundBullet, setBackgroundBullet] = useState<string>('');
  const [tripProgressBullet, setTripProgressBullet] = useState<string>('');
  const [routeConsiderationsBullet, setRouteConsiderationsBullet] = useState<string>('');

  const [editingBackgroundCommentId, setEditingBackgroundCommentId] = useState<string | null>(null);
  const [editBackgroundCommentBullet, setEditBackgroundCommentBullet] = useState<string>('');
  const [editingTripProgressCommentId, setEditingTripProgressCommentId] = useState<string | null>(null);
  const [editTripProgressCommentBullet, setEditTripProgressCommentBullet] = useState<string>('');
  const [editingRouteConsiderationsCommentId, setEditingRouteConsiderationsCommentId] = useState<string | null>(null);
  const [editRouteConsiderationsCommentBullet, setEditRouteConsiderationsCommentBullet] = useState<string>('');

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
  const [paragraphComments, setParagraphComments] = useState<Comment[]>([]);
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

  // Set default date on mount
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16);
    setDebriefDate(formattedDate);
  }, []);

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

  // Basic Info Handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebriefDate(e.target.value);
  };

  // --- Mandatory Section Comment Handlers ---

  // Background
  const handleBackgroundBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setBackgroundBullet(e.target.value);
  const handleEditBackgroundBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setEditBackgroundCommentBullet(e.target.value);
  const handleAddBackgroundComment = () => {
    if (!backgroundBullet.trim()) return;
    const newComment: Comment = { id: uuidv4(), bullet: backgroundBullet, index: backgroundComments.length };
    setBackgroundComments([...backgroundComments, newComment]);
    setBackgroundBullet('');
  };
  const handleEditBackgroundComment = (id: string | null) => {
    setEditingBackgroundCommentId(id);
    if (id) {
      const comment = backgroundComments.find(c => c.id === id);
      setEditBackgroundCommentBullet(comment ? comment.bullet : '');
    } else {
      setEditBackgroundCommentBullet('');
    }
  };
  const handleUpdateBackgroundComment = () => {
    if (!editingBackgroundCommentId || !editBackgroundCommentBullet.trim()) return;
    setBackgroundComments(prev =>
      prev.map(comment => (comment.id === editingBackgroundCommentId ? { ...comment, bullet: editBackgroundCommentBullet } : comment))
    );
    setEditingBackgroundCommentId(null);
    setEditBackgroundCommentBullet('');
  };
  const handleDeleteBackgroundComment = (id: string) => {
    setBackgroundComments(prev => prev.filter(comment => comment.id !== id).map((comment, index) => ({ ...comment, index })));
  };

  // Trip Progress
  const handleTripProgressBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setTripProgressBullet(e.target.value);
  const handleEditTripProgressBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setEditTripProgressCommentBullet(e.target.value);
  const handleAddTripProgressComment = () => {
    if (!tripProgressBullet.trim()) return;
    const newComment: Comment = { id: uuidv4(), bullet: tripProgressBullet, index: tripProgressComments.length };
    setTripProgressComments([...tripProgressComments, newComment]);
    setTripProgressBullet('');
  };
  const handleEditTripProgressComment = (id: string | null) => {
    setEditingTripProgressCommentId(id);
    if (id) {
      const comment = tripProgressComments.find(c => c.id === id);
      setEditTripProgressCommentBullet(comment ? comment.bullet : '');
    } else {
      setEditTripProgressCommentBullet('');
    }
  };
  const handleUpdateTripProgressComment = () => {
    if (!editingTripProgressCommentId || !editTripProgressCommentBullet.trim()) return;
    setTripProgressComments(prev =>
      prev.map(comment => (comment.id === editingTripProgressCommentId ? { ...comment, bullet: editTripProgressCommentBullet } : comment))
    );
    setEditingTripProgressCommentId(null);
    setEditTripProgressCommentBullet('');
  };
  const handleDeleteTripProgressComment = (id: string) => {
    setTripProgressComments(prev => prev.filter(comment => comment.id !== id).map((comment, index) => ({ ...comment, index })));
  };

  // Route Considerations
  const handleRouteConsiderationsBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setRouteConsiderationsBullet(e.target.value);
  const handleEditRouteConsiderationsBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setEditRouteConsiderationsCommentBullet(e.target.value);
  const handleAddRouteConsiderationsComment = () => {
    if (!routeConsiderationsBullet.trim()) return;
    const newComment: Comment = { id: uuidv4(), bullet: routeConsiderationsBullet, index: routeConsiderationsComments.length };
    setRouteConsiderationsComments([...routeConsiderationsComments, newComment]);
    setRouteConsiderationsBullet('');
  };
  const handleEditRouteConsiderationsComment = (id: string | null) => {
    setEditingRouteConsiderationsCommentId(id);
    if (id) {
      const comment = routeConsiderationsComments.find(c => c.id === id);
      setEditRouteConsiderationsCommentBullet(comment ? comment.bullet : '');
    } else {
      setEditRouteConsiderationsCommentBullet('');
    }
  };
  const handleUpdateRouteConsiderationsComment = () => {
    if (!editingRouteConsiderationsCommentId || !editRouteConsiderationsCommentBullet.trim()) return;
    setRouteConsiderationsComments(prev =>
      prev.map(comment => (comment.id === editingRouteConsiderationsCommentId ? { ...comment, bullet: editRouteConsiderationsCommentBullet } : comment))
    );
    setEditingRouteConsiderationsCommentId(null);
    setEditRouteConsiderationsCommentBullet('');
  };
  const handleDeleteRouteConsiderationsComment = (id: string) => {
    setRouteConsiderationsComments(prev => prev.filter(comment => comment.id !== id).map((comment, index) => ({ ...comment, index })));
  };

  // --- Content Item Handlers (User Added) ---
  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setContentType(e.target.value as 'TABLE' | 'PARAGRAPH');

  const handleContentNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCurrentContentName(e.target.value);

  const handleColumnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingColumnId) {
      setEditColumnName(e.target.value);
    } else {
      setColumnName(e.target.value);
    }
  };

  const handleCommentBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editingCommentId) {
      setEditCommentBullet(e.target.value);
    } else {
      setCommentBullet(e.target.value);
    }
  };

  const handleAddColumn = () => {
    if (!columnName.trim()) return;
    const newColumn: Column = { id: uuidv4(), name: columnName, index: tableColumns.length };
    setTableColumns([...tableColumns, newColumn]);
    setColumnName('');
  };

  const handleEditColumn = (id: string) => {
    setEditingColumnId(id);
    const column = tableColumns.find(c => c.id === id);
    if (column) {
      setEditColumnName(column.name);
    }
  };

  const handleUpdateColumn = () => {
    if (!editingColumnId || !editColumnName.trim()) return;
    setTableColumns(prev =>
      prev.map(col => (col.id === editingColumnId ? { ...col, name: editColumnName } : col))
    );
    setEditingColumnId(null);
    setEditColumnName('');
  };

  const handleDeleteColumn = (id: string) => {
    setTableColumns(prev => prev.filter(col => col.id !== id));
    setTableRows(prevRows => prevRows.map(row => ({
      ...row,
      cells: row.cells.filter(cell => cell.column !== id)
    })));
  };

  const handleAddRow = () => {
    const newRow: Row = {
      id: uuidv4(),
      index: tableRows.length,
      cells: tableColumns.map(col => ({ id: uuidv4(), column: col.id, value: '' }))
    };
    setTableRows([...tableRows, newRow]);
  };

  const handleCellChange = (rowId: string, columnId: string, value: string) => {
    setTableRows(prevRows =>
      prevRows.map(row => {
        if (row.id === rowId) {
          const cellIndex = row.cells.findIndex(cell => cell.column === columnId);
          const updatedCells = [...row.cells];
          if (cellIndex > -1) {
            updatedCells[cellIndex] = { ...updatedCells[cellIndex], value };
          } else {
            updatedCells.push({ id: uuidv4(), column: columnId, value });
          }
          return { ...row, cells: updatedCells };
        }
        return row;
      })
    );
  };

  const handleDeleteContentItem = (id: string) => {
    setContentItems(prev => prev.filter(item => item.id !== id).map((item, index) => ({ ...item, index })));
  };

  const handleAddComment = () => {
    if (!commentBullet.trim()) return;
    const newComment: Comment = { id: uuidv4(), bullet: commentBullet, index: paragraphComments.length };
    setParagraphComments([...paragraphComments, newComment]);
    setCommentBullet('');
  };

  const handleEditComment = (id: string | null) => {
    setEditingCommentId(id);
    if (id) {
      const comment = paragraphComments.find(c => c.id === id);
      setEditCommentBullet(comment ? comment.bullet : '');
    } else {
      setEditCommentBullet('');
    }
  };

  const handleUpdateComment = () => {
    if (!editingCommentId || !editCommentBullet.trim()) return;
    setParagraphComments(prev =>
      prev.map(comment => (comment.id === editingCommentId ? { ...comment, bullet: editCommentBullet } : comment))
    );
    setEditingCommentId(null);
    setEditCommentBullet('');
  };

  const handleDeleteComment = (id: string) => {
    setParagraphComments(prev => prev.filter(comment => comment.id !== id).map((comment, index) => ({ ...comment, index })));
  };

  const handleAddContentItem = () => {
    if (!currentContentName.trim()) return;

    if (contentItems.some(item => item.name === currentContentName)) {
      alert(`Content item name "${currentContentName}" already exists.`);
      return;
    }

    const newItemId = uuidv4();
    let newItem: ContentItem;

    if (contentType === 'TABLE') {
      if (tableColumns.length === 0) {
        alert("Tables must have at least one column.");
        return;
      }
      newItem = {
        id: newItemId,
        name: currentContentName,
        index: contentItems.length,
        columns: tableColumns.map((col, idx) => ({ ...col, index: idx })),
        rows: tableRows.map((row, idx) => ({
          ...row,
          index: idx,
          cells: row.cells.map(cell => ({ ...cell }))
        })),
        type: 'table'
      } as Table;
    } else {
      if (paragraphComments.length === 0) {
        alert("Paragraphs must have at least one comment.");
        return;
      }
      newItem = {
        id: newItemId,
        name: currentContentName,
        index: contentItems.length,
        comments: paragraphComments.map((comment, idx) => ({ ...comment, index: idx })),
        type: 'paragraph'
      } as Paragraph;
    }

    setContentItems([...contentItems, newItem]);

    setCurrentContentName('');
    setTableColumns([]);
    setTableRows([]);
    setParagraphComments([]);
    setContentType('PARAGRAPH');
  };

  const handleEditContentItem = (id: string) => {
    const contentItem = contentItems.find(item => item.id === id);
    if (!contentItem) return;

    setEditingContentItemId(id);
    setEditMode(true);
    setCurrentContentName(contentItem.name);

    if ('columns' in contentItem) {
      setContentType('TABLE');
      setTableColumns((contentItem as Table).columns || []);
      setTableRows((contentItem as Table).rows || []);
      setParagraphComments([]);
    } else if ('comments' in contentItem) {
      setContentType('PARAGRAPH');
      setParagraphComments((contentItem as Paragraph).comments || []);
      setTableColumns([]);
      setTableRows([]);
    }
  };

  const handleUpdateContentItem = () => {
    if (!editingContentItemId) return;

    const originalItem = contentItems.find(item => item.id === editingContentItemId);
    if (!originalItem) return;

    if (currentContentName.trim() && currentContentName !== originalItem.name) {
      if (contentItems.some(item => item.id !== editingContentItemId && item.name === currentContentName)) {
        alert(`Content item name "${currentContentName}" already exists.`);
        return;
      }
    }

    setContentItems(prev =>
      prev.map(item => {
        if (item.id === editingContentItemId) {
          const updatedName = currentContentName.trim() || item.name;

          if (contentType === 'PARAGRAPH') {
            return {
              ...item,
              name: updatedName,
              comments: paragraphComments.map((comment, idx) => ({ ...comment, index: idx })),
              type: 'paragraph'
            } as Paragraph;
          } else if (contentType === 'TABLE') {
            return {
              ...item,
              name: updatedName,
              columns: tableColumns.map((col, idx) => ({ ...col, index: idx })),
              rows: tableRows.map((row, idx) => ({ ...row, index: idx })),
              type: 'table'
            } as Table;
          }
        }
        return item;
      })
    );

    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditingContentItemId(null);
    setEditingColumnId(null);
    setEditingCommentId(null);
    setEditingLessonId(null);
    setEditingTaskId(null);
    setEditMode(false);
    setCurrentContentName('');
    setTableColumns([]);
    setTableRows([]);
    setParagraphComments([]);
    setColumnName('');
    setCommentBullet('');
    setEditColumnName('');
    setEditCommentBullet('');
    setEditLessonContent('');
    setEditTaskContent('');
    setEditTaskStartDate('');
    setEditTaskDeadline('');
    setEditTaskUser('');
    setSelectedLessonId(null);
    setLessonTaskContent('');
    setLessonTaskStartDate('');
    setLessonTaskDeadline('');
    setLessonTaskUser('');

    setEditingBackgroundCommentId(null);
    setEditBackgroundCommentBullet('');
    setEditingTripProgressCommentId(null);
    setEditTripProgressCommentBullet('');
    setEditingRouteConsiderationsCommentId(null);
    setEditRouteConsiderationsCommentBullet('');

    setBackgroundBullet('');
    setTripProgressBullet('');
    setRouteConsiderationsBullet('');
  };

  const contentHandlers = {
    handleContentTypeChange,
    handleContentNameChange,
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
    handleDeleteComment,
    handleDeleteContentItem
  };

  const mandatoryHandlers = {
    background: {
      handleCommentBulletChange: handleBackgroundBulletChange,
      handleAddComment: handleAddBackgroundComment,
      handleEditComment: handleEditBackgroundComment,
      handleUpdateComment: handleUpdateBackgroundComment,
      handleDeleteComment: handleDeleteBackgroundComment,
      handleEditCommentBulletChange: handleEditBackgroundBulletChange
    },
    tripProgress: {
      handleCommentBulletChange: handleTripProgressBulletChange,
      handleAddComment: handleAddTripProgressComment,
      handleEditComment: handleEditTripProgressComment,
      handleUpdateComment: handleUpdateTripProgressComment,
      handleDeleteComment: handleDeleteTripProgressComment,
      handleEditCommentBulletChange: handleEditTripProgressBulletChange
    },
    routeConsiderations: {
      handleCommentBulletChange: handleRouteConsiderationsBulletChange,
      handleAddComment: handleAddRouteConsiderationsComment,
      handleEditComment: handleEditRouteConsiderationsComment,
      handleUpdateComment: handleUpdateRouteConsiderationsComment,
      handleDeleteComment: handleDeleteRouteConsiderationsComment,
      handleEditCommentBulletChange: handleEditRouteConsiderationsBulletChange
    }
  };

  const handleTaskContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editingTaskId) {
      setEditTaskContent(e.target.value);
    } else {
      setTaskContent(e.target.value);
    }
  };

  const handleTaskStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingTaskId) {
      setEditTaskStartDate(e.target.value);
    } else {
      setTaskStartDate(e.target.value);
    }
  };

  const handleTaskDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingTaskId) {
      setEditTaskDeadline(e.target.value);
    } else {
      setTaskDeadline(e.target.value);
    }
  };

  const handleTaskUserChange = (userId: string) => {
    if (editingTaskId) {
      setEditTaskUser(userId);
    } else {
      setTaskUser(userId);
    }
  };

  const handleAddTask = () => {
    if (!taskContent.trim() || !taskStartDate || !taskDeadline) return;
    const newTask: Task = {
      id: uuidv4(),
      content: taskContent,
      startDate: taskStartDate,
      deadline: taskDeadline,
      user: taskUser || null,
      index: tasks.length
    };
    setTasks([...tasks, newTask]);
    setTaskContent('');
    setTaskStartDate('');
    setTaskDeadline('');
    setTaskUser('');
  };

  const handleEditTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setEditingTaskId(id);
    setEditTaskContent(task.content);
    setEditTaskStartDate(task.startDate);
    setEditTaskDeadline(task.deadline);
    setEditTaskUser(task.user || '');
  };

  const handleUpdateTask = () => {
    if (!editingTaskId || !editTaskContent.trim() || !editTaskStartDate || !editTaskDeadline) return;
    setTasks(prev =>
      prev.map(task =>
        task.id === editingTaskId
          ? {
              ...task,
              content: editTaskContent,
              startDate: editTaskStartDate,
              deadline: editTaskDeadline,
              user: editTaskUser || null
            }
          : task
      )
    );
    setEditingTaskId(null);
    setEditTaskContent('');
    setEditTaskStartDate('');
    setEditTaskDeadline('');
    setEditTaskUser('');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id).map((task, index) => ({ ...task, index })));
    setLessons(prevLessons => prevLessons.map(lesson => ({
      ...lesson,
      tasks: lesson.tasks.filter(task => task.id !== id)
    })));
  };

  const taskHandlers = {
    handleTaskContentChange,
    handleTaskStartDateChange,
    handleTaskDeadlineChange,
    handleTaskUserChange,
    handleAddTask,
    handleEditTask,
    handleUpdateTask,
    handleDeleteTask,
    handleCancelEdit
  };

  const handleLessonContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLessonContent(e.target.value);
  };

  const handleEditLessonContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditLessonContent(e.target.value);
  };

  const handleAddLesson = () => {
    if (!lessonContent.trim()) return;
    const newLesson: Lesson = {
      id: uuidv4(),
      content: lessonContent,
      index: lessons.length,
      tasks: []
    };
    setLessons([...lessons, newLesson]);
    setLessonContent('');
  };

  const handleEditLesson = (id: string) => {
    const lesson = lessons.find(l => l.id === id);
    if (!lesson) return;
    setEditingLessonId(id);
    setEditLessonContent(lesson.content);
    setSelectedLessonId(null);
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
    setLessons(prev => prev.filter(lesson => lesson.id !== id).map((lesson, index) => ({ ...lesson, index })));
  };

  const handleSelectLesson = (id: string) => {
    setSelectedLessonId(prevId => (prevId === id ? null : id));
    setEditingLessonId(null);
  };

  const handleCancelLessonTask = () => {
    setSelectedLessonId(null);
    setLessonTaskContent('');
    setLessonTaskStartDate('');
    setLessonTaskDeadline('');
    setLessonTaskUser('');
  };

  const handleLessonTaskContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLessonTaskContent(e.target.value);
  };

  const handleLessonTaskStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLessonTaskStartDate(e.target.value);
  };

  const handleLessonTaskDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLessonTaskDeadline(e.target.value);
  };

  const handleLessonTaskUserChange = (userId: string) => {
    setLessonTaskUser(userId);
  };

  const handleAddLessonTask = () => {
    if (!selectedLessonId || !lessonTaskContent.trim() || !lessonTaskStartDate || !lessonTaskDeadline) return;

    const selectedUser = usersGroup.find(user => user.id === lessonTaskUser);

    const newTaskForLesson: Task = {
      id: uuidv4(),
      content: lessonTaskContent,
      startDate: lessonTaskStartDate,
      deadline: lessonTaskDeadline,
      user: selectedUser as User,
      completed: false
    };

    setLessons(prevLessons =>
      prevLessons.map(lesson => {
        if (lesson.id === selectedLessonId) {
          if (!lesson.tasks.some(t => t.id === newTaskForLesson.id)) {
            const updatedTasks = [...lesson.tasks, newTaskForLesson];
            return { ...lesson, tasks: updatedTasks };
          }
        }
        return lesson;
      })
    );

    handleCancelLessonTask();
  };

  const handleRemoveLessonTask = (lessonId: string, taskId: string) => {
    setLessons(prevLessons =>
      prevLessons.map(lesson => {
        if (lesson.id === lessonId) {
          const updatedTasks = lesson.tasks.filter(task => task.id !== taskId).map((task, index) => ({ ...task, index }));
          return { ...lesson, tasks: updatedTasks };
        }
        return lesson;
      })
    );
  };

  const lessonHandlers = {
    handleLessonContentChange,
    handleAddLesson,
    handleEditLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleSelectLesson,
    handleLessonTaskContentChange,
    handleLessonTaskStartDateChange,
    handleLessonTaskDeadlineChange,
    handleLessonTaskUserChange,
    handleAddLessonTask,
    handleRemoveLessonTask,
    handleCancelLessonTask,
    handleCancelEdit,
    handleEditLessonContentChange
  };

  return {
    formData: {
      title,
      debriefDate,
      backgroundComments,
      tripProgressComments,
      routeConsiderationsComments,
      contentItems,
      tasks,
      lessons
    },
    uiState: {
      backgroundBullet,
      editingBackgroundCommentId,
      editBackgroundCommentBullet,
      tripProgressBullet,
      editingTripProgressCommentId,
      editTripProgressCommentBullet,
      routeConsiderationsBullet,
      editingRouteConsiderationsCommentId,
      editRouteConsiderationsCommentBullet,
      contentType,
      editMode,
      currentContentName,
      columnName,
      commentBullet,
      tableColumns,
      tableRows,
      paragraphComments,
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
      editTaskUser
    },
    handlers: {
      handleTitleChange,
      handleDateChange,
      mandatoryHandlers,
      contentHandlers,
      taskHandlers,
      lessonHandlers
    }
  };
}
