// ✅ ComposeMessage.jsx (Full Messaging UI - Compose Form)
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { nanoid } from 'nanoid';

export default function ComposeMessage() {
  const [users, setUsers] = useState([]);
  const [receiver, setReceiver] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    api.get('/users/list')
      .then(res => setUsers(res.data))
      .catch(() => toast({ title: 'Failed to load users', variant: 'destructive' }));
  }, []);

  const handleSend = () => {
    if (!receiver || !content) return toast({ title: 'Fill all fields', variant: 'destructive' });

    const message = {
      id: nanoid(),
      receiver_id: receiver,
      content,
      timestamp: new Date().toISOString(),
      offline: !navigator.onLine
    };

    if (navigator.onLine) {
      api.post('/messages/send', message)
        .then(() => toast({ title: 'Message sent ✅' }))
        .catch(() => queueOffline(message));
    } else {
      queueOffline(message);
    }

    setReceiver('');
    setContent('');
  };

  const queueOffline = (msg) => {
    const queue = JSON.parse(localStorage.getItem('messageQueue') || '[]');
    queue.push(msg);
    localStorage.setItem('messageQueue', JSON.stringify(queue));
    toast({ title: 'Message queued for sync', variant: 'default' });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Compose Message</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <select value={receiver} onChange={e => setReceiver(e.target.value)} className="w-full border rounded p-2">
          <option value="">Select Recipient</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
        </select>

        <Textarea placeholder="Message content..." value={content} onChange={e => setContent(e.target.value)} />

        <Button onClick={handleSend} className="w-full">Send Message</Button>
      </CardContent>
    </Card>
  );
}
