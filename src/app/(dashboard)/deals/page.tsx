'use client';

import React, { useState, useEffect } from 'react';

import { Card, Badge, Button, Pagination } from '@/components/ui';
import { DEAL_STAGES } from '@/lib/constants';
import { Deal, DealStage } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { SupportWarningBanner } from '@/components/layout/SupportWarningBanner';
import {
  LayoutList,
  Kanban,
  Plus,
  DollarSign,
  Calendar,
  TrendingUp,
  Briefcase,
  Building2,
  User as UserIcon,
  Mail,
  Phone,
  Clock,
} from 'lucide-react';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { user } = useAuth();
  const isSupport = user?.role === 'support';
  const paginatedDeals = deals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    fetchDeals();
  }, []);


  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/deals');
      if (res.ok) {
        const data = await res.json();
        setDeals(data.deals || []);
      }
    } catch (err) {
      console.error('Failed to fetch deals', err);
    } finally {
      setLoading(false);
    }
  };

  const getStageBadgeVariant = (stage: DealStage) => {
    switch (stage) {
      case 'closed_won':
        return 'success';
      case 'negotiation':
      case 'proposal':
        return 'info';
      case 'qualification':
      case 'needs_analysis':
        return 'warning';
      case 'closed_lost':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStageLabel = (stageId: string) => {
    const stageObj = DEAL_STAGES.find((s) => s.id === stageId);
    return stageObj ? stageObj.label : stageId.replace('_', ' ');
  };

  const totalValue = deals.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-8">
      <SupportWarningBanner />
      {/* Header with Title & View Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Sales Pipeline & Deals Directory</h1>
          <p className="text-slate-400 text-sm mt-1">Track company accounts, contacts, deal values, and pipeline stages.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban View</span>
            </button>
          </div>

          {!isSupport && (
            <Button variant="primary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>+ New Deal</span>
            </Button>
          )}
        </div>
      </div>


      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Opportunities</p>
            <p className="text-xl font-bold text-slate-100 mt-1">{deals.length} Active Deals</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Pipeline Value</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(totalValue)}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Average Win Rate</p>
            <p className="text-xl font-bold text-cyan-400 mt-1">
              {deals.length > 0
                ? Math.round(deals.reduce((a, b) => a + b.probability, 0) / deals.length)
                : 0}
              %
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading deals data...</div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW WITH ALL 4 CONTACT & COMPANY DETAILS */
        <Card className="overflow-hidden p-0 border-slate-800/80">
          <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              All Deals Directory ({deals.length})
            </span>
          </div>

          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
              <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Company Name</th>
                  <th className="px-5 py-3.5 font-medium">User Name</th>
                  <th className="px-5 py-3.5 font-medium">Email</th>
                  <th className="px-5 py-3.5 font-medium">Phone Number</th>
                  <th className="px-5 py-3.5 font-medium">Deal Title</th>
                  <th className="px-5 py-3.5 font-medium">Deal Value</th>
                  <th className="px-5 py-3.5 font-medium">Expected Close Date</th>
                  <th className="px-5 py-3.5 font-medium">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Company Name */}
                    <td className="px-5 py-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{deal.companyName || 'N/A'}</span>
                      </div>
                    </td>

                    {/* User Name */}
                    <td className="px-5 py-4 text-slate-200">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{deal.userName || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-cyan-400 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span>{deal.email || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="px-5 py-4 text-slate-300 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{deal.phoneNumber || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Deal Title */}
                    <td className="px-5 py-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{deal.title}</span>
                      </div>
                    </td>

                    {/* Deal Value */}
                    <td className="px-5 py-4 font-bold text-emerald-400 font-mono text-sm">
                      {formatCurrency(deal.value, deal.currency)}
                    </td>

                    {/* Expected Close Date */}
                    <td className="px-5 py-4 text-slate-400 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>
                          {deal.expectedCloseDate
                            ? new Date(deal.expectedCloseDate).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-4 text-slate-400 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{new Date(deal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={deals.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </Card>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {DEAL_STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            return (
              <div key={stage.id} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 min-h-[500px]">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/80">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{stage.label}</h3>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageDeals.map((deal) => (
                    <Card key={deal.id} className="bg-slate-950/80 p-4 border-slate-800 hover:border-indigo-500/50">
                      <p className="font-semibold text-sm text-slate-200">{deal.title}</p>
                      {deal.companyName && (
                        <p className="text-xs text-slate-400 mt-1 font-medium">{deal.companyName}</p>
                      )}
                      <div className="mt-3 flex justify-between items-center">
                        <span className="font-bold text-emerald-400 text-sm">
                          {formatCurrency(deal.value, deal.currency)}
                        </span>
                        <Badge variant="info">{deal.probability}%</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
