'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Input } from '@/components/ui';
import { UserRole, LeadStatus, FollowUpStatus, Lead, Deal, DealStage, LeadLog } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { SupportWarningBanner } from '@/components/layout/SupportWarningBanner';

import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Tag,
  Clock,
  MessageSquare,
  Save,
  DollarSign,
  Trophy,
  X,
  Briefcase,
  Calendar,
  Lock,
  ExternalLink,
  History,
  Plus,
  Settings,
  FileText,
} from 'lucide-react';

const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

const FOLLOWUP_STATUS_OPTIONS: FollowUpStatus[] = [
  'Pending',
  'Scheduled',
  'Completed',
  'No Answer',
  'Needs Reschedule',
];

const getLogIconAndColor = (type: string) => {
  switch (type) {
    case 'creation':
      return {
        icon: <Plus className="w-3.5 h-3.5 text-emerald-400" />,
        bg: 'bg-emerald-500/10 border-emerald-500/20',
      };
    case 'status_change':
      return {
        icon: <Tag className="w-3.5 h-3.5 text-indigo-400" />,
        bg: 'bg-indigo-500/10 border-indigo-500/20',
      };
    case 'followup_change':
      return {
        icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
        bg: 'bg-amber-500/10 border-amber-500/20',
      };
    case 'remark_change':
      return {
        icon: <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />,
        bg: 'bg-cyan-500/10 border-cyan-500/20',
      };
    case 'field_update':
      return {
        icon: <Settings className="w-3.5 h-3.5 text-slate-400" />,
        bg: 'bg-slate-800 border-slate-700',
      };
    case 'deal_converted':
      return {
        icon: <Trophy className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />,
        bg: 'bg-yellow-500/10 border-yellow-500/20',
      };
    case 'manual_note':
    default:
      return {
        icon: <FileText className="w-3.5 h-3.5 text-indigo-400" />,
        bg: 'bg-indigo-500/10 border-indigo-500/20',
      };
  }
};

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [lead, setLead] = useState<Lead | null>(null);
  const [associatedDeals, setAssociatedDeals] = useState<Deal[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('sales_rep'); // Default: Regular user
  const { user } = useAuth();
  const isSupport = user?.role === 'support';

  useEffect(() => {
    if (user) {
      setCurrentRole(user.role);
    }
  }, [user]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Log history states
  const [logs, setLogs] = useState<LeadLog[]>([]);
  const [newLogDescription, setNewLogDescription] = useState('');
  const [loggingLog, setLoggingLog] = useState(false);

  // Modal State for Convert to Deal
  const [showDealModal, setShowDealModal] = useState(false);
  const [creatingDeal, setCreatingDeal] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('50000');
  const [dealStage, setDealStage] = useState<DealStage>('closed_won');
  const [dealProbability, setDealProbability] = useState('100');
  const [dealCloseDate, setDealCloseDate] = useState(new Date().toISOString().split('T')[0]);
  const [createdDealSuccess, setCreatedDealSuccess] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('New');
  const [initialLeadStatus, setInitialLeadStatus] = useState<LeadStatus>('New');
  const [leadAssignDate, setLeadAssignDate] = useState('');
  const [lastFollowDate, setLastFollowDate] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>('Pending');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    fetchLeadAndDeals();
    fetchLogs();
  }, [id]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/leads/${id}/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load lead logs', err);
    }
  };

  const fetchLeadAndDeals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leads/${id}`);
      if (res.ok) {
        const data = await res.json();
        const l: Lead = data.lead;
        setLead(l);
        setCompanyName(l.companyName || '');
        setUserName(l.userName || '');
        setEmail(l.email || '');
        setPhoneNumber(l.phoneNumber || '');
        setServicesInput((l.services || []).join(', '));
        setLeadStatus(l.leadStatus);
        setInitialLeadStatus(l.leadStatus);
        setLeadAssignDate(l.leadAssignDate || '');
        setLastFollowDate(l.lastFollowDate || '');
        setFollowUpStatus(l.followUpStatus);
        setRemark(l.remark || '');

        setDealTitle(`${l.companyName} - Enterprise Contract`);

        // Fetch associated deals
        await fetchAssociatedDeals(l.id);
      }
    } catch (err) {
      console.error('Failed to load lead', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociatedDeals = async (leadId: string) => {
    try {
      const dealsRes = await fetch('/api/deals');
      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        const allDeals: Deal[] = dealsData.deals || [];
        const filtered = allDeals.filter((d) => d.leadId === leadId);
        setAssociatedDeals(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch deals', err);
    }
  };

  const handleAddCustomLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogDescription.trim()) return;

    setLoggingLog(true);
    try {
      const res = await fetch(`/api/leads/${id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'manual_note',
          creatorRole: currentRole,
          creatorName: currentRole === 'admin' ? 'Admin User' : 'John Doe',
          description: newLogDescription.trim(),
        }),
      });

      if (res.ok) {
        setNewLogDescription('');
        await fetchLogs();
      } else {
        alert('Failed to add log entry');
      }
    } catch (err) {
      console.error('Error adding custom log', err);
      alert('Error adding custom log');
    } finally {
      setLoggingLog(false);
    }
  };

  const isDealAlreadyCreated = associatedDeals.length > 0 || initialLeadStatus === 'Closed Won';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    const servicesArr = servicesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      role: currentRole,
      data: {
        companyName,
        userName,
        email,
        phoneNumber,
        services: servicesArr,
        leadStatus,
        leadAssignDate,
        lastFollowDate,
        followUpStatus,
        remark,
      },
    };

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', message: resData.message });
        setLead(resData.lead);
        setInitialLeadStatus(resData.lead.leadStatus);

        // Refresh activity logs
        await fetchLogs();

        // If status was changed to "Closed Won" and no deal was created yet, open popup modal!
        if (leadStatus === 'Closed Won' && associatedDeals.length === 0) {
          setDealTitle(`${companyName || 'Enterprise'} - Deal`);
          setShowDealModal(true);
        }
      } else {
        setNotification({ type: 'error', message: resData.message || 'Failed to update lead' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingDeal(true);

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: user?.role,
          title: dealTitle,
          value: Number(dealValue) || 0,
          currency: 'USD',
          stage: dealStage,
          companyName,
          userName,
          email,
          phoneNumber,
          leadId: id,
          ownerId: 'usr_1',
          probability: Number(dealProbability) || 100,
          expectedCloseDate: dealCloseDate,
        }),
      });

      if (res.ok) {
        setCreatedDealSuccess(true);
        await fetchAssociatedDeals(id);
        // Refresh activity logs

        await fetchLogs();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to create deal');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating deal');
    } finally {
      setCreatingDeal(false);
    }
  };

  const isAdmin = currentRole === 'admin';

  if (loading) {
    return (
      <div className="p-8 text-slate-400 flex items-center justify-center min-h-[400px]">
        Loading lead details...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-slate-400 space-y-4">
        <p>Lead not found.</p>
        <Link href="/leads">
          <Button variant="secondary">Back to Leads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      <SupportWarningBanner />
      {/* Top Bar with Back Button & Role Simulator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leads Directory</span>
        </Link>

        {/* Role Simulator Banner */}
        {!isSupport && (
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
            <span className="text-xs text-slate-400 pl-2">Current Active Role:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentRole('sales_rep')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  !isAdmin
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Standard User
              </button>

              <button
                type="button"
                onClick={() => setCurrentRole('admin')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  isAdmin
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Mode
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Permission Context Banner */}
      {!isSupport && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
          isAdmin
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {isAdmin ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
            <span>
              {isAdmin
                ? '⚡ Administrator Mode: You have permission to edit ALL lead fields.'
                : '🔒 Standard User Mode: You are allowed to update Lead Status, Follow-Up Status, and Remarks only.'}
            </span>
          </div>
        </div>
      )}


      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold px-2">✕</button>
        </div>
      )}

      {/* Responsive layout: left side form, right side logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Lead Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Section 1: Lead Activity & Status (Editable by Everyone unless deal is created) */}
            <Card title="Lead Status & Activity Log" subtitle="Editable by all assigned CRM users and admins">
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lead Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      Lead Status
                    </span>
                    {isDealAlreadyCreated ? (
                      <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked (Deal Created)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">* (Editable)</span>
                    )}
                  </label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                    disabled={isDealAlreadyCreated || isSupport}
                    className={`px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none transition-all ${
                      (isDealAlreadyCreated || isSupport)
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                    }`}
                  >
                    {LEAD_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {isDealAlreadyCreated && (
                    <p className="text-[11px] text-amber-400/90 mt-1">
                      🔒 Lead is Closed Won with an active deal. Status cannot be modified to prevent duplicate deals.
                    </p>
                  )}
                </div>

                {/* Follow-up Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Follow-Up Status
                    <span className="text-emerald-400 font-bold">* (Editable)</span>
                  </label>
                  <select
                    value={followUpStatus}
                    onChange={(e) => setFollowUpStatus(e.target.value as FollowUpStatus)}
                    disabled={isSupport}
                    className={`px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none transition-all ${
                      isSupport
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                    }`}
                  >
                    {FOLLOWUP_STATUS_OPTIONS.map((fst) => (
                      <option key={fst} value={fst}>
                        {fst}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Activity Remark / Notes */}
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    Activity Remark / Notes
                    <span className="text-emerald-400 font-bold">* (Editable)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    disabled={isSupport}
                    placeholder="Enter latest call notes, follow-up remarks, or client updates..."
                    className={`px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none transition-all placeholder:text-slate-600 ${
                      isSupport
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                    }`}
                  />
                </div>

              </div>
            </Card>

            {/* Section 2: Account & Contact Details (Admin Only for Editing) */}
            <Card
              title="Company & Contact Information"
              subtitle={isAdmin ? 'Editable by Administrator' : 'Read-only for standard users (Admin access required)'}
            >
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <Input
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={!isAdmin}
                    required
                  />
                  {!isAdmin && <p className="text-[11px] text-slate-500 mt-1">Admin restricted field</p>}
                </div>

                {/* Contact / User Name */}
                <div>
                  <Input
                    label="Contact / User Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    disabled={!isAdmin}
                    required
                  />
                  {!isAdmin && <p className="text-[11px] text-slate-500 mt-1">Admin restricted field</p>}
                </div>

                {/* Email */}
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isAdmin}
                    required
                  />
                  {!isAdmin && <p className="text-[11px] text-slate-500 mt-1">Admin restricted field</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <Input
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!isAdmin}
                  />
                  {!isAdmin && <p className="text-[11px] text-slate-500 mt-1">Admin restricted field</p>}
                </div>

                {/* Services */}
                <div className="md:col-span-2">
                  <Input
                    label="Services Interested (comma separated)"
                    value={servicesInput}
                    onChange={(e) => setServicesInput(e.target.value)}
                    disabled={!isAdmin}
                    placeholder="e.g. Cloud Migration, CRM Integration"
                  />
                  {!isAdmin && <p className="text-[11px] text-slate-500 mt-1">Admin restricted field</p>}
                </div>

                {/* Lead Assign Date */}
                <div>
                  <Input
                    label="Lead Assign Date"
                    type="date"
                    value={leadAssignDate}
                    onChange={(e) => setLeadAssignDate(e.target.value)}
                    disabled={!isAdmin}
                  />
                  {!isAdmin && <p className="text-[11px] text-slate-500 mt-1">Admin restricted field</p>}
                </div>

                {/* Last Follow Date */}
                <div>
                  <Input
                    label="Last Follow-Up Date"
                    type="date"
                    value={lastFollowDate}
                    onChange={(e) => setLastFollowDate(e.target.value)}
                    disabled={!isAdmin}
                  />
                  {!isAdmin && <p className="text-[11px] text-slate-500 mt-1">Admin restricted field</p>}
                </div>
              </div>
            </Card>

            {/* Section 3: Associated Deals & Opportunities */}
            <Card
              title="Associated Sales Deals & Opportunities"
              subtitle="Deals created from this lead"
              action={
                <Link href="/deals" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold">
                  <span>View All Deals</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              }
            >
              {associatedDeals.length > 0 ? (
                <div className="mt-4 divide-y divide-slate-800/80 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
                  {associatedDeals.map((deal) => (
                    <div key={deal.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{deal.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Contact: {deal.userName || userName}</span>
                            <span>•</span>
                            <span>Email: {deal.email || email}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400 font-mono">
                            {formatCurrency(deal.value, deal.currency)}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>Close: {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'N/A'}</span>
                          </p>
                        </div>

                        <Badge variant={deal.stage === 'closed_won' ? 'success' : 'info'}>
                          {deal.stage.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-center">
                  <p className="text-xs text-slate-400">No deals created for this lead yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Updating Lead Status to <span className="text-emerald-400 font-semibold">Closed Won</span> will launch the deal creation wizard.
                  </p>
                </div>
              )}
            </Card>

            {/* Submit Bar */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Link href="/leads">
                <Button type="button" variant="secondary">Cancel</Button>
              </Link>
              {!isSupport && (
                <Button type="submit" variant="primary" disabled={saving} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Lead Updates'}</span>
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Lead Log History */}
        <div className="lg:col-span-1">
          <Card 
            title="Lead Activity History" 
            subtitle="Change logs and manual updates"
            action={<History className="w-4 h-4 text-slate-400" />}
          >
            {/* Form to add a manual note */}
            {!isSupport && (
              <form onSubmit={handleAddCustomLog} className="mb-6 space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Add Custom Note
                  </label>
                  <textarea
                    rows={2}
                    value={newLogDescription}
                    onChange={(e) => setNewLogDescription(e.target.value)}
                    placeholder="Type updates (e.g. called client, sent pricing info)..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 resize-none transition-all"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="sm" 
                    disabled={loggingLog || !newLogDescription.trim()} 
                    className="flex items-center gap-1 py-1 px-3"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{loggingLog ? 'Logging...' : 'Log Activity'}</span>
                  </Button>
                </div>
              </form>
            )}


            {/* Timeline list of logs */}
            <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-6 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const style = getLogIconAndColor(log.type);
                  return (
                    <div key={log.id} className="relative group">
                      {/* Bullet Icon */}
                      <span className={`absolute -left-[37px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 border text-slate-400 shadow-md ${style.bg}`}>
                        {style.icon}
                      </span>

                      {/* Log details */}
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-200 leading-tight">
                            {log.description}
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium shrink-0 pt-0.5">
                            {new Date(log.timestamp).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {log.details && (
                          <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 leading-normal font-mono break-all whitespace-pre-wrap">
                            {log.details}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            log.creatorRole === 'admin'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {log.creatorName}
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            {new Date(log.timestamp).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-500">No activity logs recorded yet.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* POPUP MODAL: CREATE DEAL WHEN CLOSED WON */}
      {showDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => {
                setShowDealModal(false);
                setCreatedDealSuccess(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {!createdDealSuccess ? (
              <form onSubmit={handleCreateDeal} className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">🎉 Lead Closed Won!</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Fill in details to convert this lead into a Deal.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Deal Title"
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Deal Value ($)"
                      type="number"
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      required
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-slate-300">Pipeline Stage</label>
                      <select
                        value={dealStage}
                        onChange={(e) => setDealStage(e.target.value as DealStage)}
                        className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="closed_won">Closed Won</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="proposal">Proposal</option>
                        <option value="qualification">Qualification</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Win Probability (%)"
                      type="number"
                      min="0"
                      max="100"
                      value={dealProbability}
                      onChange={(e) => setDealProbability(e.target.value)}
                    />

                    <Input
                      label="Expected Close Date"
                      type="date"
                      value={dealCloseDate}
                      onChange={(e) => setDealCloseDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowDealModal(false);
                      setCreatedDealSuccess(false);
                    }}
                  >
                    Skip & Close
                  </Button>

                  <Button type="submit" variant="primary" disabled={creatingDeal} className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{creatingDeal ? 'Creating Deal...' : 'Create Deal'}</span>
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Deal Created Successfully!</h3>
                  <p className="text-sm text-slate-400 mt-1">The opportunity has been added to your Sales Pipeline.</p>
                </div>
                <div className="pt-4 flex justify-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDealModal(false);
                      setCreatedDealSuccess(false);
                    }}
                  >
                    Stay on Lead Page
                  </Button>
                  <Link href="/deals">
                    <Button variant="primary">View Sales Pipeline (/deals)</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
