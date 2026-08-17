import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentStockLevels } from '@/api/inventory';
import type { StockLevel } from '@/types/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/data-display/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/utils/formatters';
import { Eye, Warning, CheckCircle, Package } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const StockLevelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [summary, setSummary] = useState({
    total_raw_grains: 0,
    total_finished_flours: 0,
    low_stock_alerts_count: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RAW_GRAIN' | 'FINISHED_FLOUR'>('ALL');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await getCurrentStockLevels({
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        low_stock_only: lowStockFilter || undefined
      });
      if (res.success) {
        setStockLevels(res.data.stock_levels);
        setSummary(res.data.summary);
      }
    } catch {
      toast.error('Failed to load stock levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [typeFilter, lowStockFilter]);

  const columns = [
    {
      header: 'Product Name',
      accessorKey: 'product_name',
      cell: (row: StockLevel) => (
        <span className="font-semibold text-foreground">{row.product_name}</span>
      )
    },
    {
      header: 'Type',
      accessorKey: 'product_type',
      cell: (row: StockLevel) => (
        <Badge variant="outline" className="rounded-lg capitalize font-medium">
          {row.product_type.replace('_', ' ').toLowerCase()}
        </Badge>
      )
    },
    {
      header: 'Current Balance',
      accessorKey: 'current_stock',
      cell: (row: StockLevel) => (
        <span className={`font-semibold ${row.is_low_stock ? 'text-red-700 dark:text-red-400 font-bold' : 'text-foreground'}`}>
          {formatNumber(row.current_stock)} {row.unit_of_measure}
        </span>
      )
    },
    {
      header: 'Safety Threshold',
      accessorKey: 'low_stock_threshold',
      cell: (row: StockLevel) => `${formatNumber(row.low_stock_threshold)} ${row.unit_of_measure}`
    },
    {
      header: 'Status',
      accessorKey: 'is_low_stock',
      cell: (row: StockLevel) => (
        row.is_low_stock ? (
          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-400 px-2 py-0.5 rounded-lg text-xs font-semibold ring-1 ring-inset ring-red-700/10">
            <Warning size={14} />
            Low Stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 dark:bg-green-950/20 dark:text-green-400 px-2 py-0.5 rounded-lg text-xs font-semibold ring-1 ring-inset ring-green-700/10">
            <CheckCircle size={14} />
            Healthy
          </span>
        )
      )
    },
    {
      header: 'Actions',
      cell: (row: StockLevel) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/inventory/stock-movements/${row.product_id}`)}
          className="rounded-xl flex items-center gap-1.5 h-9"
        >
          <Eye size={16} />
          View Movements
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Levels"
        description="Monitor real-time inventory balances of raw grains and finished flours."
      />

      {/* Summary grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-gray-400">
            <Package size={24} className="text-[#5A3E2B]" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Raw Grain Items</p>
            <h4 className="text-2xl font-bold text-foreground">{summary.total_raw_grains}</h4>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-gray-400">
            <Package size={24} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Flour Products</p>
            <h4 className="text-2xl font-bold text-foreground">{summary.total_finished_flours}</h4>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-gray-400">
            <Warning size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
            <h4 className="text-2xl font-bold text-red-700 dark:text-red-400">{summary.low_stock_alerts_count}</h4>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-accent p-1 rounded-xl">
          {(['ALL', 'RAW_GRAIN', 'FINISHED_FLOUR'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === t
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              {t === 'ALL' ? 'All Types' : t.replace('_', ' ').toLowerCase()}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockFilter}
            onChange={(e) => setLowStockFilter(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-[#5A3E2B] focus:ring-[#5A3E2B]"
          />
          <span className="text-base text-foreground font-medium">Show Low Stock Only</span>
        </label>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={stockLevels}
        loading={loading}
      />
    </div>
  );
};

export default StockLevelsPage;
