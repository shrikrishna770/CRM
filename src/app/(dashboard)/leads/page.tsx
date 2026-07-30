'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { Lead, LeadStatus, FollowUpStatus } from '@/types';
import { ImportLeadModal } from '@/components/leads/ImportLeadModal';
import { useAuth } from '@/context/AuthContext';
import { SupportWarningBanner } from '@/components/layout/SupportWarningBanner';
import { Building2, User, Mail, Phone, Calendar, Clock, Tag, MessageSquare, Plus, Edit3, UploadCloud, Eye } from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const isSupport = user?.role === 'support';


  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads/import', { method: 'GET' }).catch(() => null);
      if (!res || !res.ok) {
        // Fallback to fetching lead details or page reload
        const directRes = await fetch('/api/leads/ld_1');
        if (directRes.ok) {
          // If we have single lead route, we can fetch all leads via route or service
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAllLeads();
  }, []);

  const loadAllLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads/list');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Error fetching leads list', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case 'Closed Won':
        return 'success';
      case 'Proposal Sent':
      case 'Negotiation':
      case 'Qualified':
        return 'info';
      case 'Contacted':
      case 'New':
        return 'warning';
      case 'Closed Lost':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getFollowUpBadgeVariant = (status: FollowUpStatus) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Scheduled':
        return 'info';
      case 'Pending':
        return 'warning';
      case 'No Answer':
      case 'Needs Reschedule':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-8">
      <SupportWarningBanner />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Lead Management Directory</h1>
          <p className="text-slate-400 text-sm mt-1">Track inbound prospects, assigned services, follow-up dates, and activity remarks.</p>
        </div>
        {!isSupport && (
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Capture / Import Leads (CSV & Excel)</span>
          </Button>
        )}
      </div>


      {/* Leads Table */}
      <Card className="overflow-hidden p-0 border-slate-800/80">
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Leads ({leads.length})
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading leads directory...</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[1300px]">
              <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Company Name</th>
                  <th className="px-5 py-3.5 font-medium">User Name</th>
                  <th className="px-5 py-3.5 font-medium">Email</th>
                  <th className="px-5 py-3.5 font-medium">Phone Number</th>
                  <th className="px-5 py-3.5 font-medium">Lead Status</th>
                  <th className="px-5 py-3.5 font-medium">Services</th>
                  <th className="px-5 py-3.5 font-medium">Lead Assign Date</th>
                  <th className="px-5 py-3.5 font-medium">Last Follow Date</th>
                  <th className="px-5 py-3.5 font-medium">Follow-Up Status</th>
                  <th className="px-5 py-3.5 font-medium">Remark</th>
                  <th className="px-5 py-3.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Company Name */}
                    <td className="px-5 py-4 font-semibold text-slate-200">
                      <Link href={`/leads/${lead.id}`} className="hover:text-indigo-400 flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{lead.companyName}</span>
                      </Link>
                    </td>

                    {/* User Name */}
                    <td className="px-5 py-4 text-slate-200">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.userName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-cyan-400 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span>{lead.email}</span>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="px-5 py-4 text-slate-300 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.phoneNumber}</span>
                      </div>
                    </td>

                    {/* Lead Status */}
                    <td className="px-5 py-4">
                      <Badge variant={getStatusBadgeVariant(lead.leadStatus)}>
                        {lead.leadStatus}
                      </Badge>
                    </td>

                    {/* Services */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(lead.services || []).map((svc, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                            <Tag className="w-2.5 h-2.5" />
                            {svc}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Lead Assign Date */}
                    <td className="px-5 py-4 text-slate-400 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{lead.leadAssignDate}</span>
                      </div>
                    </td>

                    {/* Last Follow Date */}
                    <td className="px-5 py-4 text-slate-400 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{lead.lastFollowDate}</span>
                      </div>
                    </td>

                    {/* Follow-up Status */}
                    <td className="px-5 py-4">
                      <Badge variant={getFollowUpBadgeVariant(lead.followUpStatus)}>
                        {lead.followUpStatus}
                      </Badge>
                    </td>

                    {/* Remark */}
                    <td className="px-5 py-4 text-slate-300 text-xs max-w-xs truncate">
                      <div className="flex items-center gap-2" title={lead.remark}>
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{lead.remark}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-semibold text-indigo-300 hover:text-white transition-all"
                      >
                        {isSupport ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Details</span>
                          </>
                        )}
                      </Link>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        <ImportLeadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadAllLeads}
        />
      </Card>
    </div>
  );
}
