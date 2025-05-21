import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Debrief } from '../../../../entity/debrief/debrief';
import { Comment } from '../../../../entity/debrief/content/paragraph/comment';
import { ContentItem } from '../../../../entity/debrief/content/content-item';
import { Table } from '../../../../entity/debrief/content/table/table';
import { Paragraph } from '../../../../entity/debrief/content/paragraph/paragraph';
import { Column } from '../../../../entity/debrief/content/table/column';
import { Row } from '../../../../entity/debrief/content/table/row';
import { Task } from '../../../../entity/debrief/task';
import { Lesson } from '../../../../entity/debrief/lesson';
import { ApiDebriefInput, ApiTable, ApiParagraph, ApiTask, ApiLesson } from '../../../../input/debrief/api-types';
import axios from 'axios';
import { endpoint } from '../../../../consts';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../../../entity/decodedToken';

export function useDebriefUpdateForm(initialDebrief: Debrief | null) {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>('');
  const [debriefDate, setDebriefDate] = useState<string>('');

  const [backgroundComments, setBackgroundComments] = useState<Comment[]>([]);
  const [tripProgressComments, setTripProgressComments] = useState<Comment[]>([]);
  const [routeConsiderationsComments, setRouteConsiderationsComments] = useState<Comment[]>([]);

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [contentType, setContentType] = useState<'TABLE' | 'PARAGRAPH'>('PARAGRAPH');
  const [currentContentName, setCurrentContentName] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  
  const [columnName, setColumnName] = useState<string>('');
  const [tableColumns, setTableColumns] = useState<Column[]>([]);
  const [tableRows, setTableRows] = useState<Row[]>([]);
  
  const [backgroundCommentBullet, setBackgroundCommentBullet] = useState<string>('');
  const [tripProgressCommentBullet, setTripProgressCommentBullet] = useState<string>('');
  const [routeConsiderationsCommentBullet, setRouteConsiderationsCommentBullet] = useState<string>('');
  const [paragraphCommentBullet, setParagraphCommentBullet] = useState<string>('');
  
  const [paragraphComments, setParagraphComments] = useState<Comment[]>([]);
  
  const [editingContentItemId, setEditingContentItemId] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editColumnName, setEditColumnName] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentBullet, setEditCommentBullet] = useState<string>('');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskContent, setTaskContent] = useState<string>('');
  const [taskStartDate, setTaskStartDate] = useState<string>('');
  const [taskDeadline, setTaskDeadline] = useState<string>('');
  const [taskUser, setTaskUser] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskContent, setEditTaskContent] = useState<string>('');
  const [editTaskStartDate, setEditTaskStartDate] = useState<string>('');
  const [editTaskDeadline, setEditTaskDeadline] = useState<string>('');
  const [editTaskUser, setEditTaskUser] = useState<string>('');

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonTaskContent, setLessonTaskContent] = useState<string>('');
  const [lessonTaskStartDate, setLessonTaskStartDate] = useState<string>('');
  const [lessonTaskDeadline, setLessonTaskDeadline] = useState<string>('');
  const [lessonTaskUser, setLessonTaskUser] = useState<string>('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonContent, setEditLessonContent] = useState<string>('');

  const [initialTaskIds, setInitialTaskIds] = useState<Set<string>>(new Set());
  const [initialLessonIds, setInitialLessonIds] = useState<Set<string>>(new Set());
  const [initialContentItemIds, setInitialContentItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialDebrief) {
      setTitle(initialDebrief.title || '');
      
      if (initialDebrief.date) {
        const date = new Date(initialDebrief.date);
        const formattedDate = date.toISOString().slice(0, 16);
        setDebriefDate(formattedDate);
      }

      const extractMandatorySections = () => {
        const paragraphs = initialDebrief.contentItems.filter(
          item => 'comments' in item
        ) as Paragraph[];
        
        const backgroundParagraph = paragraphs.find(p => p.name === 'Background');
        const tripProgressParagraph = paragraphs.find(p => p.name === 'Trip Progress');
        const routeConsiderationsParagraph = paragraphs.find(p => p.name === 'Route Considerations');
        
        setBackgroundComments(backgroundParagraph?.comments || []);
        setTripProgressComments(tripProgressParagraph?.comments || []);
        setRouteConsiderationsComments(routeConsiderationsParagraph?.comments || []);
      };
      
      extractMandatorySections();
      
      if (initialDebrief.tasks && initialDebrief.lessons) {
        const lessonTaskIds = new Set();
        initialDebrief.lessons.forEach(lesson => {
          if (lesson.tasks && Array.isArray(lesson.tasks)) {
            lesson.tasks.forEach(task => {
              lessonTaskIds.add(task.id);
            });
          }
        });
        
        const filteredTasks = initialDebrief.tasks.filter(task => !lessonTaskIds.has(task.id));
        setTasks(filteredTasks);
      } else {
        setTasks(initialDebrief.tasks || []);
      }
      
      setLessons(initialDebrief.lessons || []);
      
      const nonMandatoryItems = initialDebrief.contentItems.filter(item => 
        !['Background', 'Trip Progress', 'Route Considerations'].includes(item.name)
      );
      setContentItems(nonMandatoryItems || []);

      setInitialTaskIds(new Set((initialDebrief.tasks || []).map(t => t.id)));
      setInitialLessonIds(new Set((initialDebrief.lessons || []).map(l => l.id)));
      setInitialContentItemIds(new Set((initialDebrief.contentItems || []).map(item => item.id)));
    }
  }, [initialDebrief]);

  const filteredTasks = useMemo(() => {
    if (!tasks || !lessons) return [];
    
    // Create a set of all task IDs that are in lessons
    const lessonTaskIds = new Set();
    lessons.forEach(lesson => {
      if (lesson.tasks && Array.isArray(lesson.tasks)) {
        lesson.tasks.forEach(task => {
          if (task && task.id) {
            lessonTaskIds.add(task.id);
          }
        });
      }
    });
    
    // Return only tasks that are not in any lesson
    return tasks.filter(task => !lessonTaskIds.has(task.id));
  }, [tasks, lessons]);

  const getFormData = () => {
    return {
      title,
      debriefDate,
      backgroundComments,
      tripProgressComments,
      routeConsiderationsComments,
      contentItems,
      tasks: filteredTasks,
      lessons
    };
  };

  const formData = getFormData();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebriefDate(e.target.value);
  };

  // Handlers for Comments (separated for each section)
  const handleBackgroundCommentBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBackgroundCommentBullet(e.target.value);
  };
  const handleTripProgressCommentBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTripProgressCommentBullet(e.target.value);
  };
  const handleRouteConsiderationsCommentBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRouteConsiderationsCommentBullet(e.target.value);
  };
  const handleParagraphCommentBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setParagraphCommentBullet(e.target.value);
  };

  const handleEditCommentBulletChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditCommentBullet(e.target.value);
  };

  // Comment handlers for mandatory sections (now use their own bullet)
  const handleAddComment = (section: 'background' | 'tripProgress' | 'routeConsiderations' | 'paragraph') => {
    let bullet = '';
    if (section === 'background') bullet = backgroundCommentBullet;
    else if (section === 'tripProgress') bullet = tripProgressCommentBullet;
    else if (section === 'routeConsiderations') bullet = routeConsiderationsCommentBullet;
    else if (section === 'paragraph') bullet = paragraphCommentBullet;
    if (!bullet.trim()) return;
    const newComment: Comment = {
      id: uuidv4(),
      bullet: bullet.trim()
    };
    if (section === 'background') {
      setBackgroundComments([...backgroundComments, newComment]);
      setBackgroundCommentBullet('');
    } else if (section === 'tripProgress') {
      setTripProgressComments([...tripProgressComments, newComment]);
      setTripProgressCommentBullet('');
    } else if (section === 'routeConsiderations') {
      setRouteConsiderationsComments([...routeConsiderationsComments, newComment]);
      setRouteConsiderationsCommentBullet('');
    } else if (section === 'paragraph') {
      setParagraphComments([...paragraphComments, newComment]);
      setParagraphCommentBullet('');
    }
  };

  const handleEditComment = (id: string | null, section?: 'background' | 'tripProgress' | 'routeConsiderations' | 'paragraph') => {
    setEditingCommentId(id);
    
    if (!id) {
      setEditCommentBullet('');
      return;
    }

    let comment: Comment | undefined;
    
    if (section === 'background') {
      comment = backgroundComments.find(c => c.id === id);
    } else if (section === 'tripProgress') {
      comment = tripProgressComments.find(c => c.id === id);
    } else if (section === 'routeConsiderations') {
      comment = routeConsiderationsComments.find(c => c.id === id);
    } else {
      comment = paragraphComments.find(c => c.id === id);
    }

    if (comment) {
      setEditCommentBullet(comment.bullet);
    }
  };

  const handleUpdateComment = (section: 'background' | 'tripProgress' | 'routeConsiderations' | 'paragraph') => {
    if (!editingCommentId || !editCommentBullet.trim()) return;
  
    const updateComment = (comments: Comment[]): Comment[] => 
      comments.map(c => c.id === editingCommentId ? { ...c, bullet: editCommentBullet.trim() } : c);
  
    if (section === 'background') {
      setBackgroundComments(updateComment(backgroundComments));
    } else if (section === 'tripProgress') {
      setTripProgressComments(updateComment(tripProgressComments));
    } else if (section === 'routeConsiderations') {
      setRouteConsiderationsComments(updateComment(routeConsiderationsComments));
    } else if (section === 'paragraph') {
      setParagraphComments(updateComment(paragraphComments));
    }
  
    setEditingCommentId(null);
    setEditCommentBullet('');
  };
  
  const handleDeleteComment = (id: string, section: 'background' | 'tripProgress' | 'routeConsiderations' | 'paragraph') => {
    const deleteComment = (comments: Comment[]): Comment[] => 
      comments.filter(c => c.id !== id);
  
    if (section === 'background') {
      setBackgroundComments(deleteComment(backgroundComments));
    } else if (section === 'tripProgress') {
      setTripProgressComments(deleteComment(tripProgressComments));
    } else if (section === 'routeConsiderations') {
      setRouteConsiderationsComments(deleteComment(routeConsiderationsComments));
    } else if (section === 'paragraph') {
      setParagraphComments(deleteComment(paragraphComments));
    }
  };

  // Content Item handlers
  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setContentType(e.target.value as 'TABLE' | 'PARAGRAPH');
  };

  const handleContentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentContentName(e.target.value);
  };

  const handleColumnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingColumnId) {
      setEditColumnName(e.target.value);
    } else {
      setColumnName(e.target.value);
    }
  };

  const handleAddColumn = () => {
    if (!columnName.trim()) return;

    const newColumn: Column = {
      id: uuidv4(),
      name: columnName.trim()
    };

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

    setTableColumns(
      tableColumns.map(column => 
        column.id === editingColumnId 
          ? { ...column, name: editColumnName.trim() } 
          : column
      )
    );

    // Update cell values in rows to maintain consistency
    setTableRows(
      tableRows.map(row => {
        const updatedCells = row.cells.map(cell => 
          cell.column === editingColumnId 
            ? { ...cell, column: editingColumnId } 
            : cell
        );
        return { ...row, cells: updatedCells };
      })
    );

    setEditingColumnId(null);
    setEditColumnName('');
  };

  const handleDeleteColumn = (id: string) => {
    setTableColumns(tableColumns.filter(column => column.id !== id));
    
    // Remove cells associated with this column
    setTableRows(tableRows.map(row => ({
      ...row,
      cells: row.cells.filter(cell => cell.column !== id)
    })));
  };

  const handleAddRow = () => {
    if (tableColumns.length === 0) return;

    const newRow: Row = {
      id: uuidv4(),
      cells: tableColumns.map(column => ({
        column: column.id,
        row: '',  // This will be set after we create the row
        value: ''
      }))
    };

    // Set the row id for each cell
    newRow.cells = newRow.cells.map(cell => ({
      ...cell,
      row: newRow.id
    }));

    setTableRows([...tableRows, newRow]);
  };

  const handleCellChange = (rowId: string, columnId: string, value: string) => {
    setTableRows(tableRows.map(row => {
      if (row.id !== rowId) return row;
      
      return {
        ...row,
        cells: row.cells.map(cell => 
          cell.column === columnId && cell.row === rowId
            ? { ...cell, value }
            : cell
        )
      };
    }));
  };

  const handleAddContentItem = () => {
    if (!currentContentName.trim()) return;
  
    const newIndex = contentItems.length;
    
    let newItem: ContentItem;
    
    if (contentType === 'TABLE') {
      newItem = {
        id: uuidv4(),
        name: currentContentName.trim(),
        index: newIndex,
        columns: tableColumns,
        rows: tableRows
      } as Table;
    } else {
      newItem = {
        id: uuidv4(),
        name: currentContentName.trim(),
        index: newIndex,
        comments: paragraphComments
      } as Paragraph;
    }
    
    setContentItems([...contentItems, newItem]);
    resetContentForm();
  };

  const handleEditContentItem = (id: string) => {
    const item = contentItems.find(item => item.id === id);
    if (!item) return;
  
    setEditingContentItemId(id);
    setCurrentContentName(item.name);
    setEditMode(true);
  
    if ('columns' in item) {
      // It's a table
      setContentType('TABLE');
      setTableColumns(item.columns);
      setTableRows(item.rows);
    } else if ('comments' in item) {
      // It's a paragraph
      setContentType('PARAGRAPH');
      setParagraphComments(item.comments);
    }
  };

  const handleUpdateContentItem = () => {
    if (!editingContentItemId || !currentContentName.trim()) return;
  
    setContentItems(contentItems.map(item => {
      if (item.id !== editingContentItemId) return item;
  
      if (contentType === 'TABLE' && 'columns' in item) {
        return {
          ...item,
          name: currentContentName.trim(),
          columns: tableColumns,
          rows: tableRows
        };
      } else if (contentType === 'PARAGRAPH' && 'comments' in item) {
        return {
          ...item,
          name: currentContentName.trim(),
          comments: paragraphComments
        };
      }
  
      return item;
    }));
  
    resetContentForm();
    setEditMode(false);
    setEditingContentItemId(null);
  };

  const handleDeleteContentItem = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
  
    // Reindex remaining items
    setContentItems(prevItems => 
      prevItems.map((item, index) => ({ ...item, index }))
    );
  };

  const handleCancelEdit = () => {
    resetContentForm();
    setEditMode(false);
    setEditingContentItemId(null);
    setEditingColumnId(null);
    setEditingCommentId(null);
  };

  const resetContentForm = () => {
    setCurrentContentName('');
    setColumnName('');
    setEditColumnName('');
    setBackgroundCommentBullet('');
    setTripProgressCommentBullet('');
    setRouteConsiderationsCommentBullet('');
    setParagraphCommentBullet('');
    setEditCommentBullet('');
    setTableColumns([]);
    setTableRows([]);
    setParagraphComments([]);
  };

  // Task handlers
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
      content: taskContent.trim(),
      startDate: taskStartDate,
      deadline: taskDeadline,
      assignedTo: taskUser || null
    };

    setTasks([...tasks, newTask]);
    setTaskContent('');
    setTaskStartDate('');
    setTaskDeadline('');
    setTaskUser('');
  };

  const handleEditTask = (id: string) => {
    setEditingTaskId(id);
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditTaskContent(task.content);
      setEditTaskStartDate(task.startDate);
      setEditTaskDeadline(task.deadline);
      setEditTaskUser(task.assignedTo || '');
    }
  };

  const handleUpdateTask = () => {
    if (!editingTaskId || !editTaskContent.trim() || !editTaskStartDate || !editTaskDeadline) return;

    setTasks(
      tasks.map(task => 
        task.id === editingTaskId 
          ? { 
              ...task, 
              content: editTaskContent.trim(),
              startDate: editTaskStartDate,
              deadline: editTaskDeadline,
              assignedTo: editTaskUser || null
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
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Lesson handlers
  const handleLessonContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editingLessonId) {
      setEditLessonContent(e.target.value);
    } else {
      setLessonContent(e.target.value);
    }
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

  const handleAddLesson = () => {
    if (!lessonContent.trim()) return;

    const newLesson: Lesson = {
      id: uuidv4(),
      content: lessonContent.trim(),
      tasks: []
    };

    setLessons([...lessons, newLesson]);
    setLessonContent('');
  };

  const handleSelectLesson = (id: string | null) => {
    setSelectedLessonId(id);
    
    if (!id) {
      setLessonTaskContent('');
      setLessonTaskStartDate('');
      setLessonTaskDeadline('');
      setLessonTaskUser('');
    }
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

    setLessons(
      lessons.map(lesson => 
        lesson.id === editingLessonId 
          ? { ...lesson, content: editLessonContent.trim() } 
          : lesson
      )
    );

    setEditingLessonId(null);
    setEditLessonContent('');
  };

  const handleDeleteLesson = (id: string) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
    if (selectedLessonId === id) {
      setSelectedLessonId(null);
    }
  };

  const handleAddLessonTask = () => {
    if (!selectedLessonId || !lessonTaskContent.trim() || !lessonTaskStartDate || !lessonTaskDeadline) return;

    const newTask: Task = {
      id: uuidv4(),
      content: lessonTaskContent.trim(),
      startDate: lessonTaskStartDate,
      deadline: lessonTaskDeadline,
      assignedTo: lessonTaskUser || null
    };

    setLessons(
      lessons.map(lesson => 
        lesson.id === selectedLessonId 
          ? { ...lesson, tasks: [...lesson.tasks, newTask] } 
          : lesson
      )
    );

    // Reset task form
    setLessonTaskContent('');
    setLessonTaskStartDate('');
    setLessonTaskDeadline('');
    setLessonTaskUser('');
  };

  const handleDeleteLessonTask = (lessonId: string, taskId: string) => {
    setLessons(
      lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, tasks: lesson.tasks.filter(task => task.id !== taskId) } 
          : lesson
      )
    );
  };

  const prepareApiData = (id: string): ApiDebriefInput => {

    const findMandatoryParagraph = (name: string, comments: Comment[]): ApiParagraph => {
      const existing = initialDebrief?.contentItems.find(item => 'comments' in item && item.name === name) as Paragraph | undefined;
      return {
        id: existing?.id ?? null,
        name,
        index: existing?.index ?? 0,
        comments: comments.map((c, idx) => ({
          id: c.id,
          bullet: c.bullet,
          index: idx
        }))
      };
    };
    
    // Prepare paragraphs (including mandatory sections)
    const apiParagraphs: ApiParagraph[] = [
      findMandatoryParagraph('Background', backgroundComments),
      findMandatoryParagraph('Trip Progress', tripProgressComments),
      findMandatoryParagraph('Route Considerations', routeConsiderationsComments)
    ];
    
    // Add user-defined paragraphs
    contentItems.forEach(item => {
      if ('comments' in item && !['Background', 'Trip Progress', 'Route Considerations'].includes(item.name)) {
        apiParagraphs.push({
          id: initialContentItemIds.has(item.id) ? item.id : null,
          name: item.name,
          index: item.index,
          comments: item.comments.map((c, idx) => ({
            id: c.id,
            bullet: c.bullet,
            index: idx
          }))
        });
      }
    });
    
    // Prepare tables
    const apiTables: ApiTable[] = contentItems
      .filter(item => 'columns' in item)
      .map(item => ({
        id: initialContentItemIds.has(item.id) ? item.id : null,
        name: item.name,
        index: item.index,
        columns: (item as Table).columns,
        rows: (item as Table).rows
      }));

    // Prepare tasks - preserve existing IDs, null for new
    const apiTasks: ApiTask[] = getFormData().tasks.map(task => ({
      id: initialTaskIds.has(task.id) ? task.id : null,
      content: task.content,
      startDate: task.startDate,
      deadline: task.deadline,
      user: typeof task.user === 'string' ? task.user : task.user.id
    }));
    
    // Prepare lessons - preserve existing IDs, null for new; tasks inside similarly
    const apiLessons: ApiLesson[] = lessons.map(lesson => ({
      id: initialLessonIds.has(lesson.id) ? lesson.id : null,
      content: lesson.content,
      tasks: lesson.tasks.map(task => ({
        id: initialTaskIds.has(task.id) ? task.id : null,
        content: task.content,
        startDate: task.startDate,
        deadline: task.deadline,
        user: typeof task.user === 'string' ? task.user : task.user.id
      }))
    }));

    return {
      id,
      title,
      date: debriefDate,
      contentItems: {
        paragraphs: apiParagraphs,
        tables: apiTables
      },
      tasks: apiTasks,
      lessons: apiLessons
    };
  };

  const updateDebrief = async (id: string): Promise<boolean> => {
    const token = localStorage.getItem('accessToken') as string;
    if(!token) {
      navigate('/login');
      return false;
    }
    const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
    
    try {
      const apiData = prepareApiData(id);
      console.log('API Data:', apiData);
      const response = await axios.put(endpoint + `debrief/${id}`,
        apiData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'User-Id': decoded.sub,
          }
        }
      );

      if(response.status !== 200) {
        throw new Error(`Failed to update debrief: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to update debrief (Axios Error):', error.response?.data || error.message);
      } else {
        console.error('Failed to update debrief (Unknown Error):', error);
      }
      return false;
    }
  };

  // Group related handlers
  const contentItemHandlers = {
    handleContentTypeChange,
    handleContentNameChange,
    handleColumnNameChange,
    handleBackgroundCommentBulletChange,
    handleTripProgressCommentBulletChange,
    handleRouteConsiderationsCommentBulletChange,
    handleParagraphCommentBulletChange,
    handleCommentBulletChange: handleParagraphCommentBulletChange,
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
    handleAddComment: () => handleAddComment('paragraph'),
    handleEditComment: (id: string | null) => handleEditComment(id, 'paragraph'),
    handleUpdateComment: () => handleUpdateComment('paragraph'),
    handleDeleteComment: (id: string) => handleDeleteComment(id, 'paragraph'),
    handleDeleteContentItem
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
    handleCancelEdit: () => setEditingTaskId(null)
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
    handleDeleteLessonTask,
    handleCancelEditLesson: () => setEditingLessonId(null)
  };

  return {
    formData,
    title,
    debriefDate,
    backgroundComments,
    tripProgressComments,
    routeConsiderationsComments,
    contentItems,
    contentType,
    currentContentName,
    editMode,
    columnName,
    backgroundCommentBullet,
    tripProgressCommentBullet,
    routeConsiderationsCommentBullet,
    paragraphCommentBullet,
    editCommentBullet,
    tableColumns,
    tableRows,
    paragraphComments,
    editingContentItemId,
    editingColumnId,
    editColumnName,
    editingCommentId,
    tasks: filteredTasks,
    taskContent,
    taskStartDate,
    taskDeadline,
    taskUser,
    editingTaskId,
    editTaskContent,
    editTaskStartDate,
    editTaskDeadline,
    editTaskUser,
    lessons,
    lessonContent,
    selectedLessonId,
    lessonTaskContent,
    lessonTaskStartDate,
    lessonTaskDeadline,
    lessonTaskUser,
    editingLessonId,
    editLessonContent,
    handleTitleChange,
    handleDateChange,
    handleBackgroundCommentBulletChange,
    handleTripProgressCommentBulletChange,
    handleRouteConsiderationsCommentBulletChange,
    handleParagraphCommentBulletChange,
    handleEditCommentBulletChange,
    handleAddComment,
    handleEditComment,
    handleUpdateComment,
    handleDeleteComment,
    contentItemHandlers,
    taskHandlers,
    lessonHandlers,
    updateDebrief
  };
}