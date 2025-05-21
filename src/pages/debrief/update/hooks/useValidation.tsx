import { useState, useEffect, useCallback } from 'react';
import { ContentItem } from '../../../../entity/debrief/content/content-item';
import { Task } from '../../../../entity/debrief/task';
import { Lesson } from '../../../../entity/debrief/lesson';
import { Comment } from '../../../../entity/debrief/content/paragraph/comment';

interface FormData {
  title: string;
  debriefDate: string;
  backgroundComments: Comment[];
  tripProgressComments: Comment[];
  routeConsiderationsComments: Comment[];
  contentItems: ContentItem[];
  tasks: Task[];
  lessons: Lesson[];
}

interface Errors {
  title?: string;
  debriefDate?: string;
  background?: string;
  tripProgress?: string;
  routeConsiderations?: string;
  contentItems?: string;
  tasks?: string;
  lessons?: string;
}

export function useValidation(formData: FormData) {
  const [errors, setErrors] = useState<Errors>({});

  // Create memoized validation function to avoid recreation on every render
  const validateForm = useCallback((): boolean => {
    const newErrors: Errors = {};
    
    // Title validation
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    // Date validation
    if (!formData.debriefDate) {
      newErrors.debriefDate = 'Debrief date is required';
    }

    // Only validate mandatory sections if we have form data
    if (formData) {
      // For update forms, we need to ensure these arrays are properly initialized
      const backgroundComments = formData.backgroundComments || [];
      const tripProgressComments = formData.tripProgressComments || [];
      const routeConsiderationsComments = formData.routeConsiderationsComments || [];

      if (backgroundComments.length === 0) {
        newErrors.background = 'Background section must have at least one point';
      }

      if (tripProgressComments.length === 0) {
        newErrors.tripProgress = 'Trip Progress section must have at least one point';
      }

      if (routeConsiderationsComments.length === 0) {
        newErrors.routeConsiderations = 'Route Considerations section must have at least one point';
      }
    }

    setErrors(newErrors);
    
    // Return true if no errors (form is valid)
    return Object.keys(newErrors).length === 0;
  }, [
    formData.title, 
    formData.debriefDate,
    formData.backgroundComments?.length,
    formData.tripProgressComments?.length,
    formData.routeConsiderationsComments?.length
  ]);

  // Run validation when dependencies change
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  return {
    errors,
    validateForm
  };
}