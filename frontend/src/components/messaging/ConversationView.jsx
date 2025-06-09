// src/pages/messages/ConversationView.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ConversationView() {
  const { threadId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    api.get(`/messages/thread/${threadId}`)
      .then(res => setMessages(res.data))
      .catch(() => toast({ title: 'Failed to load messages', variant: 'destructive' }));
  }, [threadId]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const payload = {
      recipient_id: threadId,
      content: newMessage
    };

    api.post('/messages/send', payload)
      .then(() => {
        setMessages([...messages, {
          sender_id: 'me',
          content: newMessage,
          created_at: new Date().toISOString()
        }]);
        setNewMessage('');
      })
      .catch(() => toast({ title: 'Failed to send message', variant: 'destructive' }));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Conversation</h2>
      <ScrollArea className="h-[400px] border rounded p-4 mb-4 bg-white">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 p-2 rounded ${msg.sender_id === 'me' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <p className="text-sm">{msg.content}</p>
            <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
          </div>
        ))}
      </ScrollArea>
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
