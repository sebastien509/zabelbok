// ProfessorMessageDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from '@/components/ui/use-toast';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import SyncStatusBadge from '@/components/system/SyncStatusBadge';
import { retrySync } from '@/utils/retrySync';

export default function ProfessorMessageDashboard() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [conversations, setConversations] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [availableContacts, setAvailableContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load conversations and contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [contactsRes, conversationsRes] = await Promise.all([
          api.get('/messages/contacts'),
          api.get('/messages/conversations')
        ]);
        setAvailableContacts(contactsRes.data);
        setConversations(conversationsRes.data);
      } catch (error) {
        toast({
          title: 'Failed to load messages',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up offline sync
    const interval = setInterval(() => {
      if (navigator.onLine) retrySync('messageQueue', '/api/sync/message');
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Load messages when thread is selected
  useEffect(() => {
    if (selectedThread) {
      api.get(`/messages/thread/${selectedThread}`)
        .then(res => setMessages(res.data))
        .catch(() => toast({
          title: 'Failed to load thread',
          variant: 'destructive'
        }));
    }
  }, [selectedThread]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const messageData = {
      receiver_id: selectedThread || selectedContact,
      content: newMessage
    };

    if (navigator.onLine) {
      api.post('/messages', messageData)
        .then(() => {
          toast({ title: 'Message sent successfully' });
          setNewMessage('');
          // Refresh conversations
          api.get('/messages/conversations')
            .then(res => setConversations(res.data));
        })
        .catch(() => queueOffline(messageData));
    } else {
      queueOffline(messageData);
      toast({ title: 'Message queued for offline delivery' });
      setNewMessage('');
    }
  };

  const queueOffline = (message) => {
    const queue = JSON.parse(localStorage.getItem('messageQueue') || '[]');
    queue.push({
      ...message,
      timestamp: new Date().toISOString(),
      offline: true
    });
    localStorage.setItem('messageQueue', JSON.stringify(queue));
  };

  const startNewConversation = (contactId) => {
    setSelectedContact(contactId);
    setSelectedThread(null);
    setActiveTab('compose');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
      {/* Left sidebar - Contacts/Conversations */}
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {isLoading ? (
                <p>Loading contacts...</p>
              ) : (
                <ul className="space-y-2">
                  {availableContacts.map(contact => (
                    <li 
                      key={contact.id}
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => startNewConversation(contact.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{contact.name}</span>
                        <span className="text-xs text-gray-500">{contact.role}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {isLoading ? (
                <p>Loading conversations...</p>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-gray-500">No conversations yet</p>
              ) : (
                <ul className="space-y-2">
                  {conversations.map(conv => (
                    <li 
                      key={conv.thread_id}
                      className={`p-2 hover:bg-gray-100 rounded cursor-pointer ${selectedThread === conv.thread_id ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setSelectedThread(conv.thread_id);
                        setActiveTab('thread');
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{conv.other_user_name}</p>
                          <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(conv.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      {conv.unread_count > 0 && (
                        <Badge className="mt-1">{conv.unread_count} unread</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main content area */}
      <div className="md:col-span-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="thread">Thread</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox">
            <Card>
              <CardHeader>
                <CardTitle>Inbox <SyncStatusBadge queueKey="messageQueue" /></CardTitle>
              </CardHeader>
              <CardContent>
                {conversations.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages yet</p>
                ) : (
                  <div className="space-y-2">
                    {conversations.map(conv => (
                      <div 
                        key={conv.thread_id}
                        className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedThread(conv.thread_id);
                          setActiveTab('thread');
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{conv.other_user_name}</p>
                            <p className="text-sm text-gray-600">{conv.last_message}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(conv.last_message_at).toLocaleDateString()}
                          </div>
                        </div>
                        {conv.unread_count > 0 && (
                          <Badge className="mt-1">{conv.unread_count} unread</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thread">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedThread ? `Conversation with ${conversations.find(c => c.thread_id === selectedThread)?.other_user_name || 'User'}` : 'Select a conversation'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedThread ? (
                  <p className="text-sm text-gray-500">Select a conversation from the sidebar</p>
                ) : (
                  <>
                    <ScrollArea className="h-96 mb-4 border rounded p-4">
                      {messages.length === 0 ? (
                        <p className="text-sm text-gray-500">No messages in this thread</p>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((msg, i) => (
                            <div 
                              key={i} 
                              className={`p-3 rounded max-w-[80%] ${msg.sender_id === getCurrentUserId() ? 'ml-auto bg-blue-100' : 'mr-auto bg-gray-100'}`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(msg.timestamp).toLocaleString()}
                                {msg.offline && <span className="ml-2 text-yellow-600">(Pending sync)</span>}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compose">
            <Card>
              <CardHeader>
                <CardTitle>New Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">To:</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={selectedContact}
                      onChange={(e) => setSelectedContact(e.target.value)}
                    >
                      <option value="">Select a contact</option>
                      {availableContacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name} ({contact.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Message:</label>
                    <Input
                      as="textarea"
                      rows={4}
                      placeholder="Write your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!selectedContact || !newMessage.trim()}
                  >
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}