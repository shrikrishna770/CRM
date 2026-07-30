'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '@/components/ui';
import { USER_ROLES } from '@/lib/constants';
import { User, UserRole } from '@/types';
import { ShieldCheck, UserPlus, CheckCircle2, AlertCircle, Users, Trash, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('sales_rep');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingRoles, setPendingRoles] = useState<{ [userId: string]: UserRole }>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.replace('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);


  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users/assign-role');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setNotification(null);

    try {
      const res = await fetch('/api/users/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: selectedRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({ type: 'success', message: data.message });
        setEmail('');
        fetchUsers();
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to assign role' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUserRole = async (userId: string, targetEmail: string, role: UserRole) => {
    setLoading(true);
    setNotification(null);

    try {
      const res = await fetch('/api/users/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim(), role }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({ type: 'success', message: data.message });
        setPendingRoles(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
        fetchUsers();
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to update role' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, targetEmail: string) => {
    if (!confirm(`Are you sure you want to remove user '${targetEmail}' from the CRM?`)) {
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/users/assign-role?id=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({ type: 'success', message: data.message });
        fetchUsers();
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to delete user' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'warning';
      case 'sales_rep':
        return 'info';
      case 'support':
        return 'default';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (

    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Console</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
          User Role Assignment
        </h1>
        <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
          Assign system permissions, manage user privileges, and control access across your CRM workspace.
        </p>
      </div>

      {/* Notification Alert Banner */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-md transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold hover:opacity-75 px-2 py-1">
            ✕
          </button>
        </div>
      )}

      {/* Role Assignment Form Card */}
      <Card title="Assign or Update User Role" subtitle="Enter user email and select their assigned CRM role">
        <form onSubmit={handleAssignRole} className="mt-4 flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <Input
              label="User Email Address"
              type="email"
              placeholder="e.g. member@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="w-full md:w-64 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Select CRM Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
              {USER_ROLES.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                  {r.label} ({r.id})
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary" disabled={loading} className="w-full md:w-auto h-[42px] px-6">
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Assigning...' : 'Assign Role'}</span>
          </Button>
        </form>
      </Card>

      {/* Role Definitions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {USER_ROLES.map((role) => (
          <div key={role.id} className="p-4 bg-slate-900/70 border border-slate-800/80 rounded-xl hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-sm">{role.label}</span>
              <Badge variant={getRoleBadgeVariant(role.id as UserRole)}>{role.id}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{role.description}</p>
          </div>
        ))}
      </div>

      {/* Team Roster Table Card */}
      <Card className="overflow-hidden p-0">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Team Members & Active Roles</h3>
              <p className="text-xs text-slate-400 mt-0.5">List of registered CRM users and assigned permission levels</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-full">
            Total Users: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400">
              <tr>
                <th className="px-6 py-3.5 font-medium">User Details</th>
                <th className="px-6 py-3.5 font-medium">Email</th>
                <th className="px-6 py-3.5 font-medium">Assigned Role</th>
                <th className="px-6 py-3.5 font-medium">Last Updated</th>
                <th className="px-6 py-3.5 font-medium text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span>{u.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">ID: {u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-cyan-400 font-mono text-xs">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getRoleBadgeVariant(u.role)}>{u.role.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(u.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={pendingRoles[u.id] || u.role}
                        disabled={loading}
                        onChange={(e) => {
                          const val = e.target.value as UserRole;
                          setPendingRoles(prev => ({ ...prev, [u.id]: val }));
                        }}
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        {USER_ROLES.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={loading || (pendingRoles[u.id] || u.role) === u.role}
                        onClick={() => handleSaveUserRole(u.id, u.email, pendingRoles[u.id] || u.role)}
                        title="Save role changes"
                        className={`p-2 rounded-lg border transition-all ${
                          (pendingRoles[u.id] || u.role) !== u.role
                            ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white hover:border-transparent cursor-pointer'
                            : 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
                        }`}
                      >
                        <Save className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        title="Remove user from CRM"
                        className="p-2 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent transition-all disabled:opacity-50"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
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
