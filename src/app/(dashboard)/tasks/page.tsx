import React from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { TaskService } from '@/services/taskService';
import { SupportWarningBanner } from '@/components/layout/SupportWarningBanner';
import { HideForRole } from '@/components/layout/HideForRole';

export const revalidate = 0;

export default async function TasksPage() {
  const tasks = await TaskService.getTasks();

  return (
    <div className="space-y-8">
      <SupportWarningBanner />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Tasks & Activities</h1>
          <p className="text-slate-400 text-sm mt-1">Track calls, meetings, follow-ups, and sales action items.</p>
        </div>
        <HideForRole roles={['support']}>
          <Button variant="primary">+ Create Task</Button>
        </HideForRole>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400">
              <tr>
                <th className="px-6 py-3.5 font-medium">Task Description</th>
                <th className="px-6 py-3.5 font-medium">Type</th>
                <th className="px-6 py-3.5 font-medium">Due Date</th>
                <th className="px-6 py-3.5 font-medium">Priority</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-200">{task.title}</td>
                  <td className="px-6 py-4 text-slate-300 capitalize">{task.type}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{new Date(task.dueDate).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'info'}>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'default'}>
                      {task.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
