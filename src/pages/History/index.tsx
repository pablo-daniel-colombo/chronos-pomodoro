import { TrashIcon } from 'lucide-react';
import { Container } from '../../components/Container';
import { DefaultButton } from '../../components/DefaultButton';
import { Heading } from '../../components/Heading';
import { MainTemplate } from '../../templates/MainTemplate';

import styles from './styles.module.css';
import { useTaskContext } from '../../contexts/TaskContext/useTaskContext';
import { formatDate } from '../../utils/formatDate';
import { getTaskStatus } from '../../utils/getTaskStatus';
import { sortTasks, type SortTasksOptions } from '../../utils/sortTasks';
import { useEffect, useState, useMemo } from 'react';
import { showMessage } from '../../adapters/showMessage';
import { TaskActionTypes } from '../../contexts/TaskContext/taskAction';


export function History() {
  const { state, dispatch } = useTaskContext();
  const hasTasks = state.tasks.length > 0;

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortField, setSortField] = useState<SortTasksOptions['field']>('startDate');

  // Usar useMemo para derivar o estado ordenado ao invés de useEffect
  const sortedTasks = useMemo(() => {
    return sortTasks({
      tasks: state.tasks,
      direction: sortDirection,
      field: sortField,
    });
  }, [state.tasks, sortDirection, sortField]);

  // Define o título da página
  useEffect(() => {
    document.title = 'Histórico - Chronos Pomodoro';
  }, []);

  // Cleanup do showMessage ao desmontar
  useEffect(() => {
    return () => {
      showMessage.dismiss();
    };
  }, []);

  function handleSortTasks({ field }: Pick<SortTasksOptions, 'field'>) {
    const newDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    setSortDirection(newDirection);
    setSortField(field);
  }

  function handleResetHistory() {
    showMessage.dismiss();
    showMessage.confirm('Tem certeza?', confirmation => {
      if (confirmation) {
        dispatch({ type: TaskActionTypes.RESET_STATE });
      }
    });
  }

  return (
    <MainTemplate>
      <Container>
        <Heading>
          <span>History</span>
          {hasTasks && (
            <span className={styles.buttonContainer}>
              <DefaultButton
                icon={<TrashIcon />}
                color='red'
                aria-label='Apagar todo o histórico'
                title='Apagar histórico'
                onClick={handleResetHistory}
              />
            </span>
          )}
        </Heading>
      </Container>

      <Container>
        {hasTasks && (
          <div className={styles.responsiveTable}>
            <table>
              <thead>
                <tr>
                  <th
                    onClick={() => handleSortTasks({ field: 'name' })}
                    className={styles.thSort}
                  >
                    Tarefa ↕
                  </th>
                  <th
                    onClick={() => handleSortTasks({ field: 'duration' })}
                    className={styles.thSort}
                  >
                    Duração ↕
                  </th>
                  <th
                    onClick={() => handleSortTasks({ field: 'startDate' })}
                    className={styles.thSort}
                  >
                    Data ↕
                  </th>
                  <th>Status</th>
                  <th>Tipo</th>
                </tr>
              </thead>

              <tbody>
                {sortedTasks.map(task => {
                  const taskTypeDictionary = {
                    workTime: 'Foco',
                    shortBreakTime: 'Descanso curto',
                    longBreakTime: 'Descanso longo',
                  };

                  return (
                    <tr key={task.id}>
                      <td>{task.name}</td>
                      <td>{task.duration}min</td>
                      <td>{formatDate(task.startDate)}</td>
                      <td>{getTaskStatus(task, state.activeTask)}</td>
                      <td>{taskTypeDictionary[task.type]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!hasTasks && (
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
            Ainda não existem tarefas criadas.
          </p>
        )}
      </Container>
    </MainTemplate>
  );
}