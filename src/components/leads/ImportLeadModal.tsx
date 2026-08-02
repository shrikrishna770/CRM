'use client';

import React, { useState, useRef } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { LeadStatus, FollowUpStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  Table as TableIcon,
} from 'lucide-react';

interface ImportLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportLeadModal({ isOpen, onClose, onSuccess }: ImportLeadModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Form State
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [services, setServices] = useState('');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('New');
  const [leadAssignDate, setLeadAssignDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastFollowDate, setLastFollowDate] = useState(new Date().toISOString().split('T')[0]);
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>('Pending');
  const [remark, setRemark] = useState('');

  if (!isOpen) return null;

  // Simple CSV Parser supporting quotes and comma/tab/semicolon delimiters
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], data: [] };

    // Determine delimiter
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

    const parseLine = (line: string) => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const parsedHeaders = parseLine(lines[0]);
    const dataRows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseLine(lines[i]);
      if (row.length === 0 || (row.length === 1 && !row[0])) continue;

      const obj: any = {};
      parsedHeaders.forEach((h, index) => {
        obj[h] = row[index] || '';
      });
      dataRows.push(obj);
    }

    return { headers: parsedHeaders, data: dataRows };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const { headers: parsedHdrs, data: rows } = parseCSVText(content);

        if (rows.length === 0) {
          setError('No lead data found in the uploaded file.');
          return;
        }

        setHeaders(parsedHdrs);
        setParsedRows(rows);
      } catch (err: any) {
        setError('Failed to parse file. Please ensure it is a valid CSV or Excel text file.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const downloadSampleTemplate = () => {
    const sampleHeaders = 'Company Name,User Name,Email,Phone Number,Lead Status,Services,Lead Assign Date,Last Follow Date,Follow Up Status,Remark\n';
    const sampleRow1 = '"Apex Industries","Robert Chen","robert@apexind.com","+1 (555) 234-5678","Qualified","Cloud Migration, DevOps","2026-07-20","2026-07-25","Scheduled","Client requested proposal for Q3."\n';
    const sampleRow2 = '"Starlight Corp","Elena Rostova","elena@starlight.io","+1 (555) 876-5432","New","CRM Integration","2026-07-22","2026-07-26","Pending","Initial inquiry from website contact form."\n';

    const blob = new Blob([sampleHeaders + sampleRow1 + sampleRow2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'crm_leads_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) {
      setError('Please select a valid CSV/Excel file with lead rows to import.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: parsedRows, role: user?.role }),
      });

      const resData = await res.json();
      if (res.ok) {
        setSuccessMsg(`🎉 ${resData.message}`);
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 1200);
      } else {
        setError(resData.message || 'Failed to import leads.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred during import.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const servicesArr = services.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: user?.role,
          leads: [
            {
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
          ],
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setSuccessMsg('🎉 Lead captured successfully!');
        // Reset form fields
        setCompanyName(''); setUserName(''); setEmail('');
        setPhoneNumber(''); setServices(''); setRemark('');
        setLeadStatus('New'); setFollowUpStatus('Pending');
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 1000);
      } else {
        setError(resData.message || 'Failed to capture lead.');
      }
    } catch (err: any) {
      setError('Failed to capture lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Capture & Import Leads</h2>
              <p className="text-xs text-slate-400">Upload CSV / Excel spreadsheet or enter manually</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload CSV / Excel File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Manual Lead Entry</span>
          </button>
        </div>

        {/* Alert Notifications */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: CSV / EXCEL UPLOAD */}
        {activeTab === 'upload' && (
          <div className="mt-5 space-y-5">
            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-slate-950/60 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-slate-950/80 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-200">
                {file ? file.name : 'Click to select or drag CSV / Excel file'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports .csv, .xlsx, .xls formats</p>
            </div>

            {/* Template Download Option */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <TableIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300">Need standard headers template?</span>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Parsed Lead Rows ({parsedRows.length})
                  </span>
                  <span className="text-[11px] text-slate-500">Showing first 5 rows</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 custom-scrollbar max-h-48">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <tr>
                        {headers.slice(0, 6).map((h, i) => (
                          <th key={i} className="px-3 py-2 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {parsedRows.slice(0, 5).map((row, index) => (
                        <tr key={index} className="hover:bg-slate-800/30">
                          {headers.slice(0, 6).map((h, i) => (
                            <td key={i} className="px-3 py-2 text-slate-300">
                              {row[h] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={loading || parsedRows.length === 0}
                onClick={handleImportSubmit}
                className="flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{loading ? 'Importing...' : `Import ${parsedRows.length} Lead(s)`}</span>
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL ENTRY FORM */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company Name *"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <Input
                label="User / Contact Name *"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <Input
              label="Services Interested (comma separated)"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="e.g. Cloud Migration, CRM Integration"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Lead Status</label>
                <select
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                  className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Follow-Up Status</label>
                <select
                  value={followUpStatus}
                  onChange={(e) => setFollowUpStatus(e.target.value as FollowUpStatus)}
                  className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Activity Remark / Notes</label>
              <textarea
                rows={2}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Enter initial inquiry notes..."
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Capturing...' : 'Capture Lead'}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
