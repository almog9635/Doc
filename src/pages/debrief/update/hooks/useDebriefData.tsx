import { useState, useEffect } from 'react';
import { Debrief } from '../../../../entity/debrief/debrief';
import { useAuthCheck } from '../../../auth/hooks/Authentication';
import { endpoint } from '../../../../consts';
import axios, { AxiosError } from 'axios';

export function useDebriefData(debriefId: string | undefined) {
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthorized, getAuthHeader } = useAuthCheck();

  useEffect(() => {
    if (!debriefId) {
      setError('No debrief ID provided');
      setIsLoading(false);
      return;
    }
    if(isAuthorized){
      fetchDebrief();
    }

    async function fetchDebrief() {
      try {
        const authHeader = getAuthHeader();
        const response = await axios.get(endpoint + `debrief/${debriefId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader as Record<string, string>)
          },
        });

        const data: Debrief = response.data.debriefs[0]; 
        console.log('Fetched debrief data:', data);

        if (data && typeof data === 'object' && data.id) { 
          
          if (data.tasks && data.lessons) {
            const lessonTaskIds = new Set();
            data.lessons.forEach(lesson => {
              if (lesson.tasks && Array.isArray(lesson.tasks)) {
                lesson.tasks.forEach(task => {
                  if (task && task.id) {
                    lessonTaskIds.add(task.id);
                  }
                });
              }
            });
            
            
            // Filter the main tasks list to remove any task that appears in lessons
            const filteredTasks = data.tasks.filter(task => {
              const shouldKeep = !lessonTaskIds.has(task.id);
              return shouldKeep;
            });
            console.log('Filtered tasks:', filteredTasks);
            data.tasks = filteredTasks;
          }
          setDebrief(data);
        } else {
          // If the structure is different or data is missing, throw an error
          throw new Error('Invalid or missing debrief data in response');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError;
          setError(`Error ${axiosError.response?.status}: ${axiosError.message}`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching debrief data');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchDebrief();
  }, [debriefId, getAuthHeader]);

  return { debrief, isLoading, error };
}