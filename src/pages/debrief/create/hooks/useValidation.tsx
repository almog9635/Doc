import { useState, useEffect } from 'react';
import { Lesson } from '../../../../entity/debrief/lesson';
import { ContentItem } from '../../../../entity/debrief/content/content-item';
import { Task } from '../../../../entity/debrief/task';

interface FormData {
  title: string;
  debriefDate: string;
  contentItems: ContentItem[];
  tasks: Task[];
  lessons: Lesson[];
}

export function useValidation(formData: FormData) {
  const [errors, setErrors] = useState({
    title: '',
    debriefDate: '',
    contentItems: '',
    tasks: '',
    lessons: ''
  });
  
  // Initial validation
  useEffect(() => {
    const newErrors = {
      title: '',
      debriefDate: '',
      contentItems: '',
      tasks: '',
      lessons: ''
    };
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.debriefDate) {
      newErrors.debriefDate = 'Date and time are required';
    }
    
    setErrors(newErrors);
  }, [formData.title, formData.debriefDate]);
  
  const validateForm = () => {
    const newErrors = {
      title: '',
      debriefDate: '',
      contentItems: '',
      tasks: '',
      lessons: ''
    };
    
    let isValid = true;
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!formData.debriefDate) {
      newErrors.debriefDate = 'Date and time are required';
      isValid = false;
    }
    
    if (formData.contentItems.length === 0) {
      newErrors.contentItems = 'At least one content item is required';
      isValid = false;
    } else {
      // Validate content items
      for (const item of formData.contentItems) {
        if (!item.name || item.name.trim() === '') {
          newErrors.contentItems = 'All content items must have a name';
          isValid = false;
          break;
        }
        
        if ('columns' in item && Array.isArray(item.columns)) {
          // Table validation
          if (item.columns.length === 0) {
            newErrors.contentItems = 'Tables must have at least one column';
            isValid = false;
            break;
          }
        } else if ('comments' in item && Array.isArray(item.comments)) {
          // Paragraph validation
          if (item.comments.length === 0) {
            newErrors.contentItems = 'Paragraphs must have at least one comment';
            isValid = false;
            break;
          }
        }
      }
    }
    
    if (formData.tasks.length === 0) {
      newErrors.tasks = 'At least one task is required';
      isValid = false;
    } else {
      // Validate tasks
      for (const task of formData.tasks) {
        if (!task.content || task.content.trim() === '') {
          newErrors.tasks = 'All tasks must have content';
          isValid = false;
          break;
        }
        
        if (!task.startDate) {
          newErrors.tasks = 'All tasks must have a start date';
          isValid = false;
          break;
        }
        
        if (!task.deadline) {
          newErrors.tasks = 'All tasks must have a deadline';
          isValid = false;
          break;
        }
      }
    }
    
    if (formData.lessons.length === 0) {
      newErrors.lessons = 'At least one lesson is required';
      isValid = false;
    } else {
      // Validate lessons
      for (const lesson of formData.lessons) {
        if (!lesson.content || lesson.content.trim() === '') {
          newErrors.lessons = 'All lessons must have content';
          isValid = false;
          break;
        }
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  return { errors, validateForm };
}
