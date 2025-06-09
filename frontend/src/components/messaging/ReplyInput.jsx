import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ReplyInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="flex gap-2 mt-4">
      <Input
        placeholder="Type your reply..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  );
}
