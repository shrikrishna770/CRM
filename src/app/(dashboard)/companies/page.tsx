import React from 'react';
import { Card, Button } from '@/components/ui';
import { CompanyService } from '@/services/companyService';
import { SupportWarningBanner } from '@/components/layout/SupportWarningBanner';
import { HideForRole } from '@/components/layout/HideForRole';

export const revalidate = 0;

export default async function CompaniesPage() {
  const companies = await CompanyService.getCompanies();

  return (
    <div className="space-y-8">
      <SupportWarningBanner />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Companies</h1>
          <p className="text-slate-400 text-sm mt-1">Track organizations, enterprise clients, and account insights.</p>
        </div>
        <HideForRole roles={['support']}>
          <Button variant="primary">+ Add Company</Button>
        </HideForRole>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400">
              <tr>
                <th className="px-6 py-3.5 font-medium">Company</th>
                <th className="px-6 py-3.5 font-medium">Domain</th>
                <th className="px-6 py-3.5 font-medium">Industry</th>
                <th className="px-6 py-3.5 font-medium">Employees</th>
                <th className="px-6 py-3.5 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-200">{company.name}</td>
                  <td className="px-6 py-4 text-cyan-400 font-mono text-xs">{company.domain}</td>
                  <td className="px-6 py-4 text-slate-200">{company.industry}</td>
                  <td className="px-6 py-4 text-slate-400">{company.employeeCount}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-400">
                    ${(company.annualRevenue ? company.annualRevenue / 1000000 : 0)}M
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
