'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { SupportWarningBanner } from '@/components/layout/SupportWarningBanner';
import {
  Settings,
  Share2,
  HelpCircle,
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building,
  Mail,
  DollarSign,
  Key,
  Globe,
  Link as LinkIcon,
} from 'lucide-react';


interface CrmSettings {
  companyName: string;
  supportEmail: string;
  defaultCurrency: string;
  metaAccessToken: string;
  metaVerifyToken: string;
  metaPageId: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<CrmSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { user } = useAuth();
  const isSupport = user?.role === 'support';


  // Simulator state
  const [simName, setSimName] = useState('Sarah Jenkins');
  const [simEmail, setSimEmail] = useState('sarah.jenkins@metaads.com');
  const [simPhone, setSimPhone] = useState('+1 (555) 492-0922');
  const [simCompany, setSimCompany] = useState('Jenkins Marketing Group');
  const [simServices, setSimServices] = useState('CRM Integration, Meta Ads');
  const [simulating, setSimulating] = useState(false);
  const [simulatorLog, setSimulatorLog] = useState<string[]>([]);

  // Webhook Callback URL (fallback to localhost display)
  const [callbackUrl, setCallbackUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCallbackUrl(`${window.location.origin}/api/webhooks/meta-leads`);
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setNotification(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, role: user?.role }),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setNotification({ type: 'success', message: 'Settings updated successfully!' });
      } else {
        setNotification({ type: 'error', message: 'Failed to update settings.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'An error occurred while saving.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setSimulatorLog([]);

    const addLog = (msg: string) => {
      setSimulatorLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      addLog('Initializing Meta Webhook Simulator...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      addLog('Constructing payload for Facebook Instant Form (leadgen)...');
      const payload = {
        is_simulator: true,
        form_id: 'form_meta_instant_998',
        mock_lead_data: {
          name: simName,
          email: simEmail,
          phone: simPhone,
          company: simCompany,
          services: simServices.split(',').map((s) => s.trim()).filter(Boolean),
        },
      };
      await new Promise((resolve) => setTimeout(resolve, 600));

      addLog(`Sending POST request to Webhook Endpoint: ${callbackUrl}`);
      const res = await fetch('/api/webhooks/meta-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (res.ok) {
        addLog('✔ Webhook verification successful.');
        addLog(`✔ Meta Lead created: "${resData.lead.userName}" from "${resData.lead.companyName}"`);
        addLog('✔ Activity log recorded in audit database.');
        setNotification({ type: 'success', message: 'Simulated lead processed via Webhook!' });
      } else {
        addLog(`✕ Webhook processing failed: ${resData.message || 'Unknown error'}`);
        setNotification({ type: 'error', message: 'Simulated lead failed to process.' });
      }
    } catch (err) {
      addLog('✕ Connection error failed to send webhook.');
      setNotification({ type: 'error', message: 'Error triggering simulator.' });
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400 flex items-center justify-center min-h-[400px]">
        Loading settings module...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <SupportWarningBanner />
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          CRM Integration Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure Meta Ads webhooks, API tokens, and corporate workspace preferences.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold px-2">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Organization & Meta Config */}
        <div className="space-y-8">
          {/* Org Config */}
          <Card title="Organization Profile" subtitle="General preferences for company information">
            <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
              <Input
                label="Company Workspace Name"
                value={settings?.companyName || ''}
                onChange={(e) => setSettings((s) => s ? { ...s, companyName: e.target.value } : null)}
                disabled={isSupport}
                required
              />
              <Input
                label="Support & Escalation Email"
                type="email"
                value={settings?.supportEmail || ''}
                onChange={(e) => setSettings((s) => s ? { ...s, supportEmail: e.target.value } : null)}
                disabled={isSupport}
                required
              />
              <Input
                label="System Currency Code"
                value={settings?.defaultCurrency || ''}
                onChange={(e) => setSettings((s) => s ? { ...s, defaultCurrency: e.target.value } : null)}
                disabled={isSupport}
                required
              />
              {!isSupport && (
                <div className="pt-2">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </div>
              )}
            </form>
          </Card>

          {/* Meta Integration Config */}
          <Card title="Meta Ads Webhook & Graph API" subtitle="Configure settings for Facebook Page Lead Ads">
            <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
              {/* Webhook Callback Display */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Webhook Callback URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 text-xs font-mono text-indigo-300 break-all select-all flex-1">
                    {callbackUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCallback}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all shrink-0"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Provide this endpoint to Meta App Dashboard Webhook Callback.
                </p>
              </div>

              <Input
                label="Meta Page Access Token"
                type="password"
                value={settings?.metaAccessToken || ''}
                onChange={(e) => setSettings((s) => s ? { ...s, metaAccessToken: e.target.value } : null)}
                placeholder="EAAGb..."
                disabled={isSupport}
                required
              />
              <Input
                label="Meta Webhook Verify Token"
                value={settings?.metaVerifyToken || ''}
                onChange={(e) => setSettings((s) => s ? { ...s, metaVerifyToken: e.target.value } : null)}
                disabled={isSupport}
                required
              />
              <Input
                label="Facebook Page ID"
                value={settings?.metaPageId || ''}
                onChange={(e) => setSettings((s) => s ? { ...s, metaPageId: e.target.value } : null)}
                disabled={isSupport}
                required
              />

              {!isSupport && (
                <div className="pt-2">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Updating Meta Tokens...' : 'Save Meta Credentials'}
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>

        {/* Right Column: Setup Steps & Simulator */}
        <div className="space-y-8">
          {/* Setup Instructions Card */}
          <Card title="Webhook Setup Guide" subtitle="How to bind Facebook Leads with this CRM">
            <div className="mt-4 space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 shrink-0">1</span>
                <div>
                  <p className="font-semibold text-slate-200">Create a Meta App</p>
                  <p className="text-slate-400 mt-0.5">Go to Meta Developers Console, click "Create App" and select "Other" or "Business". Add the "Webhooks" product.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 shrink-0">2</span>
                <div>
                  <p className="font-semibold text-slate-200">Configure Webhook Subscriptions</p>
                  <p className="text-slate-400 mt-0.5">Under Webhooks, select "Page" from the dropdown. Click "Subscribe to this object" and paste the Callback URL and Verify Token from the left.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 shrink-0">3</span>
                <div>
                  <p className="font-semibold text-slate-200">Subscribe to Leadgen Fields</p>
                  <p className="text-slate-400 mt-0.5">Subscribe to the <code className="text-indigo-300 font-mono">leadgen</code> field. Meta will verify the endpoint via GET challenge immediately.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 shrink-0">4</span>
                <div>
                  <p className="font-semibold text-slate-200">Test Your Form</p>
                  <p className="text-slate-400 mt-0.5">Use the Meta Lead Ads Testing Tool to submit a test lead. The lead will show up instantly in your leads list!</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Webhook Lead Simulator Card */}
          <Card
            title="Meta Ads Lead Simulator"
            subtitle="Emulate instant form submissions from Facebook Ads"
            action={<Terminal className="w-4 h-4 text-indigo-400" />}
          >
            <form onSubmit={handleSimulateWebhook} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Simulated Lead Name"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isSupport}
                  required
                />
                <Input
                  label="Simulated Lead Email"
                  type="email"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  disabled={isSupport}
                  required
                />
                <Input
                  label="Simulated Lead Phone"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  disabled={isSupport}
                />
                <Input
                  label="Simulated Lead Company"
                  value={simCompany}
                  onChange={(e) => setSimCompany(e.target.value)}
                  placeholder="Enterprise LLC"
                  disabled={isSupport}
                />
              </div>
              <Input
                label="Simulated Interested Services"
                value={simServices}
                onChange={(e) => setSimServices(e.target.value)}
                placeholder="Cloud Infrastructure, Consulting"
                disabled={isSupport}
              />

              {!isSupport && (
                <div className="pt-2">
                  <Button type="submit" variant="primary" disabled={simulating} className="flex items-center gap-2">
                    <Play className="w-4 h-4 fill-current" />
                    <span>{simulating ? 'Simulating Webhook Event...' : 'Trigger Meta Lead Webhook'}</span>
                  </Button>
                </div>
              )}

              {simulatorLog.length > 0 && (
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Simulator Shell Output</span>
                    <button type="button" onClick={() => setSimulatorLog([])} className="text-slate-500 hover:text-slate-300">Clear</button>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                    {simulatorLog.map((log, index) => (
                      <div key={index} className={log.includes('✕') ? 'text-rose-400' : log.includes('✔') ? 'text-emerald-400' : ''}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
