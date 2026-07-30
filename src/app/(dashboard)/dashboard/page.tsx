import React from 'react';
import { Card, Badge } from '@/components/ui';
import { ContactService } from '@/services/contactService';
import { DealService } from '@/services/dealService';
import { LeadService } from '@/services/leadService';
import { TaskService } from '@/services/taskService';
import { formatCurrency } from '@/lib/utils';
import { Users, DollarSign, Target, CheckSquare } from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const [contacts, deals, leads, tasks] = await Promise.all([
    ContactService.getContacts(),
    DealService.getDeals(),
    LeadService.getLeads(),
    TaskService.getTasks(),
  ]);

  const totalPipelineValue = deals.reduce((acc, deal) => acc + deal.value, 0);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Executive Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Real-time metrics, pipeline health, and lead activity overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pipeline</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(totalPipelineValue)}</p>
            <p className="text-xs text-slate-500 mt-1">{deals.length} Active Deals</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contacts</p>
            <p className="text-2xl font-bold text-white mt-2">{contacts.length}</p>
            <p className="text-xs text-slate-500 mt-1">Managed Accounts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leads</p>
            <p className="text-2xl font-bold text-white mt-2">{leads.length}</p>
            <p className="text-xs text-slate-500 mt-1">Inbound Prospects</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Target className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasks</p>
            <p className="text-2xl font-bold text-white mt-2">{tasks.length}</p>
            <p className="text-xs text-slate-500 mt-1">Action Items</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CheckSquare className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deals */}
        <Card className="lg:col-span-2 p-6" title="Recent High-Value Deals" subtitle="Active opportunities closing this month">
          <div className="mt-4 space-y-3">
            {deals.slice(0, 4).map((deal) => (
              <div key={deal.id} className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700/80 transition-all">
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">{deal.title}</h4>
                  <span className="text-xs text-slate-400 capitalize mt-0.5 inline-block">Stage: {deal.stage.replace('_', ' ')}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400 text-sm">{formatCurrency(deal.value, deal.currency)}</p>
                  <div className="mt-1">
                    <Badge variant="info">{deal.probability}% Win Rate</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Priority Activities */}
        <Card className="p-6" title="Priority Tasks" subtitle="Pending follow-ups">
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{task.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <Badge variant={task.priority === 'urgent' ? 'danger' : 'warning'}>{task.priority}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
