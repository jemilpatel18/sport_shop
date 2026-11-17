'use client';

import { useQuery } from '@tanstack/react-query';
import { Mail, Phone } from 'lucide-react';
import { adminService, ContactMessageAdmin } from '@/services/adminService';
import { formatDateTime } from '@/lib/utils';
import { PageHeader, Badge } from '@/components/admin/AdminUI';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';

const statusColor: Record<string, 'gray' | 'green' | 'yellow' | 'red'> = {
  UNREAD: 'yellow',
  READ: 'blue' as any,
  RESOLVED: 'green',
};

export default function AdminMessagesPage() {
  const { data: messages = [], isLoading } = useQuery<ContactMessageAdmin[]>({
    queryKey: ['admin-messages'],
    queryFn: () => adminService.getContactMessages(),
  });

  return (
    <div>
      <PageHeader title="Contact Messages" subtitle={`${messages.length} messages received`} />
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100"><EmptyState title="No messages" description="Contact form submissions will appear here." /></div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm">{m.name}</p>
                    <Badge color={statusColor[m.status] || 'gray'}>{m.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{m.subject}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">{formatDateTime(m.createdAt)}</p>
              </div>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{m.message}</p>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {m.email}</span>
                {m.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {m.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
