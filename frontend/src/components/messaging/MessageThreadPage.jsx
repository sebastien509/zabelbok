// ✅ MessageThreadPage.jsx (Offline + Retry + Polish)
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { nanoid } from 'nanoid';
import SyncStatusBadge from '@/components/system/SyncStatusBadge';
import { retrySync } from '@/utils/retrySync';

export default function MessageThreadPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');

  useEffect(() => {
    api.get(`/messages/thread/${id}`)
      .then(res => setMessages(res.data))
      .catch(() => toast({ title: 'Failed to load thread', variant: 'destructive' }));
  }, [id]);

  const handleReply = () => {
    if (!reply) return;

    const newMessage = {
      id: nanoid(),
      thread_id: id,
      content: reply,
      timestamp: new Date().toISOString(),
      sender: 'You',
      offline: !navigator.onLine
    };

    if (navigator.onLine) {
      api.post('/messages/send', {
        thread_id: id,
        content: reply
      })
        .then(() => toast({ title: 'Reply sent ✅' }))
        .catch(() => queueOffline(newMessage));
    } else {
      queueOffline(newMessage);
    }

    setMessages([...messages, newMessage]);
    setReply('');
  };

  const queueOffline = (msg) => {
    const queue = JSON.parse(localStorage.getItem('messageQueue') || '[]');
    queue.push(msg);
    localStorage.setItem('messageQueue', JSON.stringify(queue));
    toast({ title: 'Reply queued for sync', variant: 'default' });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) retrySync('messageQueue', '/api/sync/message');
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Thread <SyncStatusBadge queueKey="messageQueue" /></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto pr-2">
          {messages.map((msg, i) => (
            <div key={i} className="p-2 border rounded bg-white">
              <p className="font-semibold text-sm">{msg.sender || 'Unknown'} <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span></p>
              <p className="text-sm">{msg.content}</p>
            </div>
          ))}
        </div>

        <Input placeholder="Reply..." value={reply} onChange={e => setReply(e.target.value)} />
        <Button onClick={handleReply} className="mt-2 w-full">Send Reply</Button>
      </CardContent>
    </Card>
  );
}
