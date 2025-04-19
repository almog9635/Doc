import { useState, useEffect } from 'react';
import { ContentItem } from '../../../../entity/debrief/content/content-item';
import { Task } from '../../../../entity/debrief/task';
import { Lesson } from '../../../../entity/debrief/lesson';
import { Paragraph } from '../../../../entity/debrief/content/paragraph/paragraph';
import { Comment } from '../../../../entity/debrief/content/paragraph/comment'; // Import Comment

interface FormData {
  title: string;
  debriefDate: string;
  // Add mandatory section comments
  backgroundComments: Comment[];
  tripProgressComments: Comment[];
  routeConsiderationsComments: Comment[];
  // User-added content items
  contentItems: ContentItem[];
  tasks: Task[];
  lessons: Lesson[];
}

interface Errors {
  title?: string;
  debriefDate?: string;
  // Add errors for mandatory sections
  background?: string;
  tripProgress?: string;
  routeConsiderations?: string;
  contentItems?: string;
  tasks?: string;
  lessons?: string;
}

export function useValidation(formData: FormData) {
  const [errors, setErrors] = useState<Errors>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    const validate = () => {
      const newErrors: Errors = {};
      let currentIsValid = true;

      // Validate title
      if (!formData.title || formData.title.trim() === '') {
        newErrors.title = 'Title is required';
        currentIsValid = false;
      }

      // Validate debrief date
      if (!formData.debriefDate) {
        newErrors.debriefDate = 'Debrief date is required';
        currentIsValid = false;
      }

      // Validate Mandatory Sections
      if (!formData.backgroundComments || formData.backgroundComments.length === 0) {
        newErrors.background = 'Background must have at least one point.';
        currentIsValid = false;
      }
      if (!formData.tripProgressComments || formData.tripProgressComments.length === 0) {
        newErrors.tripProgress = 'Trip Progress must have at least one point.';
        currentIsValid = false;
      }
      if (!formData.routeConsiderationsComments || formData.routeConsiderationsComments.length === 0) {
        newErrors.routeConsiderations = 'Route Considerations must have at least one point.';
        currentIsValid = false;
      }

      // Validate user-added content items
      for (const item of formData.contentItems) {
        if (!item.name || item.name.trim() === '') {
          newErrors.contentItems = 'All user-added content items must have a name';
          currentIsValid = false;
          break;
        }

        // Check user-added paragraphs for comments
        if (item.type === 'paragraph') {
           if (!(item as Paragraph).comments || (item as Paragraph).comments.length === 0) {
             newErrors.contentItems = `Paragraph "${item.name}" must have at least one comment.`;
             currentIsValid = false;
             break;
           }
        }
        // Add validation for tables if needed (e.g., at least one column/row)
        // else if (item.type === 'table') { ... }
      }

      // Validate tasks (example: content is required)
      for (const task of formData.tasks) {
        if (!task.content || task.content.trim() === '') {
          newErrors.tasks = 'All tasks must have content';
          currentIsValid = false;
          break;
        }
        // Add more task validations (dates, user assignment) if needed
      }

      // Validate lessons (example: content is required)
      for (const lesson of formData.lessons) {
        if (!lesson.content || lesson.content.trim() === '') {
          newErrors.lessons = 'All lessons must have content';
          currentIsValid = false;
          break;
        }
      }

      setErrors(newErrors);
      setIsValid(currentIsValid);
    };

    validate();
  }, [JSON.stringify(formData)]); // Re-validate only when formData content changes

  return { errors, isValid };
}
