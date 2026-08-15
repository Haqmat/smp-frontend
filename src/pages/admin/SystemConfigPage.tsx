import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const SystemConfigPage: React.FC = () => {
  const [vatRate, setVatRate] = useState('15');
  const [companyName, setCompanyName] = useState('Haqmat Manufacturing PLC');
  const [companyTin, setCompanyTin] = useState('0001234567');
  const [address, setAddress] = useState('Addis Ababa, Ethiopia');
  const [saving, setSaving] = useState(false);

  const isMockActive = import.meta.env.VITE_USE_MOCK_API !== 'false';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System configuration updated successfully!');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <PageHeader
        title="System Settings"
        description="Global parameters, tax rates, and environment configuration."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Environment Status Card */}
        <Card className="rounded-2xl border-border shadow-sm bg-card">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database size={24} className="text-[#a38413]" />
                <div>
                  <h3 className="font-bold text-foreground text-lg">API Backend Mode</h3>
                  <p className="text-sm text-gray-500">Current API connection state for Haqmat SMP</p>
                </div>
              </div>
              <Badge variant="outline" className={`rounded-xl px-3 py-1 text-sm font-bold ${
                isMockActive ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-green-50 text-green-700 border-green-300'
              }`}>
                {isMockActive ? 'Mock Adapter (In-Memory)' : 'Production Server'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card className="rounded-2xl border-border shadow-sm bg-card">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-gray-100 border-border pb-3">
              Company & Tax Invoice Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="compName">Company Legal Name</Label>
                <Input
                  id="compName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="compTin">Company TIN</Label>
                <Input
                  id="compTin"
                  value={companyTin}
                  onChange={(e) => setCompanyTin(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="compAddr">Business Address</Label>
                <Input
                  id="compAddr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vat">Default VAT Rate (%)</Label>
                <Input
                  id="vat"
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                className="rounded-xl h-11 px-6 bg-[#a38413] hover:bg-[#85690F] text-white font-bold"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default SystemConfigPage;
