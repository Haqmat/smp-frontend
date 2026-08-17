import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MagnifyingGlass,
  Package,
  ShoppingCart,
  Wallet,
  ChartBar,
  PhoneCall
} from '@phosphor-icons/react';

export const HelpPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const guides = [
    {
      icon: Package,
      category: 'Inventory & Production',
      title: 'Grain Intake & Milling Management',
      content: 'Learn how to log raw grain arrivals, track supplier TIN details, calculate flour milling extraction yields, and inspect automated yield loss reports.'
    },
    {
      icon: ShoppingCart,
      category: 'Sales & POS',
      title: 'Processing Sales & Tax Invoices',
      content: 'Instructions on using the New Sale POS module, applying transport or packaging extra fees, automatically calculating 15% VAT, and printing cash vouchers.'
    },
    {
      icon: Wallet,
      category: 'Financial Operations',
      title: 'Recording Operating Expenses (OpEx)',
      content: 'How to categorize operational expenses (Transport, Salary, Utilities) and optionally link expenses directly to raw grain intake batches.'
    },
    {
      icon: ChartBar,
      category: 'Reporting & Analytics',
      title: 'Annual Sales Registers & Profit/Loss',
      content: 'Generate annual Ethiopian fiscal year reports, audit tax breakdowns, analyze net income margins, and export official reports to PDF or Excel.'
    }
  ];

  const filteredGuides = guides.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.content.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Help & User Documentation"
        description="Comprehensive guides, platform workflows, and system support resources."
      />

      {/* Search Header */}
      <div className="bg-[#5A3E2B] text-white p-8 rounded-2xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold">How can we help you today?</h2>
        <div className="relative max-w-xl">
          <Input
            placeholder="Search guides, modules, or features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-white/95 text-gray-900 border-none placeholder:text-gray-500 font-medium"
          />
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Guide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGuides.map((guide, idx) => {
          const Icon = guide.icon;
          return (
            <Card key={idx} className="rounded-2xl border-border shadow-sm bg-card hover:border-[#5A3E2B] transition-colors">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-[#5A3E2B] flex items-center justify-center">
                    <Icon size={22} />
                  </div>
                  <Badge variant="outline" className="rounded-lg text-xs font-bold text-[#5A3E2B]">
                    {guide.category}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-foreground">{guide.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {guide.content}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Technical Support Box */}
      <Card className="rounded-2xl border-border shadow-sm bg-card">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 flex items-center justify-center">
              <PhoneCall size={24} />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-base">Need Technical Support?</h4>
              <p className="text-sm text-gray-500">Contact Haqmat Platform Administrator or IT Desk</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-[#5A3E2B] text-lg block">+251 (0) 11 123 4567</span>
            <span className="text-xs text-gray-400">support@haqmat.com</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;
