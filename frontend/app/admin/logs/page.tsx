'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/admin/registration-logs').then((res) => {
      setLogs(res.data.logs);
      setTotal(res.data.total);
    });
  }, []);

  return (
    <>
      <h1 className="text-2xl font-serif font-semibold mb-2">User Registration Logs</h1>
      <p className="text-sm text-gray-500 mb-8">{total} registrations recorded</p>

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Location</th>
              <th className="p-3">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log._id}>
                <td className="p-3">{log.email}</td>
                <td className="p-3 font-mono text-xs">{log.ip}</td>
                <td className="p-3">{log.location || 'Unknown'}</td>
                <td className="p-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  </>
  );
}
