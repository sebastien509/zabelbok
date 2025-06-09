// ✅ MessageInbox.jsx (Full Messaging Inbox)
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export default function MessageInbox() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/messages/inbox')
      .then(res => setMessages(res.data))
      .catch(() => toast({ title: 'Failed to load inbox', variant: 'destructive' }));
  }, []);

  const filtered = messages.filter(m => m.sender?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inbox</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2 mb-2">
          <Input placeholder="Search by sender..." value={search} onChange={e => setSearch(e.target.value)} />
          <Button onClick={() => navigate('/messages/compose')}>Compose</Button>
        </div>

        {filtered.length === 0 && <p className="text-muted-foreground text-sm">No messages found</p>}
        {filtered.map((msg, i) => (
          <div key={i} onClick={() => navigate(`/messages/thread/${msg.thread_id}`)} className="p-2 border rounded cursor-pointer hover:bg-muted">
            <p className="font-semibold">From: {msg.sender || 'Unknown'}</p>
            <p className="text-sm truncate">{msg.content}</p>
            <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
