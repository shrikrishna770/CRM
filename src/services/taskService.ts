import { Task } from '@/types';
import { readJsonData, writeJsonData } from '@/lib/json-db';

export class TaskService {
  private static FILENAME = 'tasks.json';

  static async getTasks(): Promise<Task[]> {
    return await readJsonData<Task[]>(this.FILENAME);
  }

  static async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      ...taskData,
      id: `tsk_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    await writeJsonData(this.FILENAME, tasks);
    return newTask;
  }
}
