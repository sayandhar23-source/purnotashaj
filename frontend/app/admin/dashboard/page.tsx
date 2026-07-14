'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import AdminLayout from '@/components/AdminLayout';
import { api } from '@/lib/api';

type Period = 'week' | 'month' | 'year' | 'custom';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [period, setPeriod] = useState<Period>('month');
  const [compareData, setCompareData] = useState<any>(null);
  const [customA, setCustomA] = useState({ start: '', end: '' });
  const [customB, setCustomB] = useState({ start: '', end: '' });

  useEffect(() => {
    api.get('/admin/analytics/summary').then((res) => setSummary(res.data));
  }, []);

  const loadCompare = async (p: Period) => {
    setPeriod(p);
    if (p === 'custom') {
      if (!customA.start || !customA.end || !customB.start || !customB.end) return;
      const res = await api.get('/admin/analytics/compare', {
        params: { period: 'custom', aStart: customA.start, aEnd: customA.end, bStart: customB.start, bEnd: customB.end },
      });
      setCompareData(res.data);
    } else {
      const res = await api.get('/admin/analytics/compare', { params: { period: p } });
      setCompareData(res.data);
    }
  };

  useEffect(() => {
    loadCompare('month');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Merge current & previous series by index for side-by-side chart
  const chartData =
    compareData &&
    compareData.current.series.map((point: any, i: number) => ({
      label: point.date,
      current: point.revenue,
      previous: compareData.previous.series[i]?.revenue ?? 0,
    }));

  return (
    <AdminLayout>
      <h1 className="text-2xl font-serif font-semibold mb-8">Revenue Overview</h1>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Last 7 Days" value={`₹${summary.last7Days.revenue}`} sub={`${summary.last7Days.orders} orders`} />
          <StatCard label="Last 30 Days" value={`₹${summary.last30Days.revenue}`} sub={`${summary.last30Days.orders} orders`} />
          <StatCard label="Total Users" value={summary.totalUsers} />
          <StatCard label="Total Orders" value={summary.totalOrders} />
        </div>
      )}

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="font-semibold">Compare Revenue</h2>
          <div className="flex gap-2 text-sm">
            {(['week', 'month', 'year', 'custom'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => loadCompare(p)}
                className={`px-3 py-1.5 rounded-full border capitalize ${
                  period === p ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-300'
                }`}
              >
                {p === 'week' ? 'vs Last Week' : p === 'month' ? 'vs Last Month' : p === 'year' ? 'vs Last Year' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
            <div className="border rounded-lg p-3">
              <p className="font-medium mb-2">Period A (current)</p>
              <div className="flex gap-2">
                <input type="date" className="input" value={customA.start} onChange={(e) => setCustomA({ ...customA, start: e.target.value })} />
                <input type="date" className="input" value={customA.end} onChange={(e) => setCustomA({ ...customA, end: e.target.value })} />
              </div>
            </div>
            <div className="border rounded-lg p-3">
              <p className="font-medium mb-2">Period B (compare against)</p>
              <div className="flex gap-2">
                <input type="date" className="input" value={customB.start} onChange={(e) => setCustomB({ ...customB, start: e.target.value })} />
                <input type="date" className="input" value={customB.end} onChange={(e) => setCustomB({ ...customB, end: e.target.value })} />
              </div>
            </div>
            <button onClick={() => loadCompare('custom')} className="btn-primary sm:col-span-2 w-fit">
              Compare
            </button>
          </div>
        )}

        {compareData && (
          <>
            <div className="flex gap-8 mb-6 text-sm">
              <div>
                <p className="text-gray-500">Current period</p>
                <p className="text-xl font-semibold">₹{compareData.current.revenue}</p>
              </div>
              <div>
                <p className="text-gray-500">Previous period</p>
                <p className="text-xl font-semibold">₹{compareData.previous.revenue}</p>
              </div>
              <div>
                <p className="text-gray-500">Growth</p>
                <p className={`text-xl font-semibold ${compareData.growthPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {compareData.growthPercent}%
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="current" stroke="#c85a28" name="Current period" strokeWidth={2} />
                <Line type="monotone" dataKey="previous" stroke="#94a3b8" name="Previous period" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
