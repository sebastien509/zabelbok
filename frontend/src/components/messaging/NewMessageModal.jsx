import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/services/api';

export default function NewMessageModal({ contacts = [], onSent }) {
  const [open, setOpen] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [content, setContent] = useState('');

  const handleSend = async () => {
    if (!recipientId || !content.trim()) {
      toast({ title: 'All fields are required', variant: 'destructive' });
      return;
    }

    try {
      await api.post('/messages/send', { recipient_id: recipientId, content });
      toast({ title: 'Message sent ✅' });
      onSent?.();
      setOpen(false);
      setRecipientId('');
      setContent('');
    } catch (err) {
      toast({ title: 'Failed to send message', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>➕ New Message</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Select Recipient</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.name} ({contact.role})
              </option>
            ))}
          </select>

          <Input
            placeholder="Write your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSend}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
