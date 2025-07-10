import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageSquare, Mail, User, Send, RefreshCw, PlusCircle } from 'lucide-react';
import SyncStatusBadge from '@/components/system/SyncStatusBadge';
import { retrySync } from '@/utils/retrySync';
import { Skeleton } from '@/components2/ui/skeleton';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';


export default function MessageDashboard({ role = 'student' }) {
  const [conversations, setConversations] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [availableContacts, setAvailableContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [isLoading, setIsLoading] = useState({ threads: true, messages: false });
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();


  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(prev => ({ ...prev, threads: true }));
        const [contactsRes, conversationsRes] = await Promise.all([
          api.get('/messages/contacts'),
          api.get('/messages/threads')
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
        setIsLoading(prev => ({ ...prev, threads: false }));
      }
    };

    fetchData();

    const interval = setInterval(() => {
      if (navigator.onLine) retrySync('messageQueue', '/api/sync/message');
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadThreadMessages(selectedThread);
    } else if (selectedContact && isComposing) {
      // Check if there's an existing thread with this contact
      const existingThread = conversations.find(
        conv => conv.contact_id === selectedContact
      );
      if (existingThread) {
        setSelectedThread(existingThread.thread_id);
        loadThreadMessages(existingThread.thread_id);
      }
    }
  }, [selectedThread, selectedContact, isComposing]);

  const loadThreadMessages = (threadId) => {
    setIsLoading(prev => ({ ...prev, messages: true }));
    api.get(`/messages/thread/${threadId}`)
      .then(res => {
        setMessages(res.data);
        // Mark as read when opening thread
        if (conversations.find(c => c.thread_id === threadId)?.unread_count > 0) {
          api.post(`/messages/mark-read/${threadId}`);
        }
      })
      .catch(() => toast({ 
        title: 'Failed to load thread', 
        variant: 'destructive' 
      }))
      .finally(() => setIsLoading(prev => ({ ...prev, messages: false })));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const recipientId = selectedThread 
      ? conversations.find(c => c.thread_id === selectedThread)?.contact_id 
      : selectedContact;
    
    if (!recipientId) return;

    const messageData = { 
      recipient_id: recipientId, 
      content: newMessage 
    };

    // Optimistic update
    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      content: newMessage,
      is_me: true,
      created_at: new Date().toISOString(),
      offline: !navigator.onLine,
      sender_id: 'me' // Temporary identifier
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    scrollToBottom();

    if (navigator.onLine) {
      api.post('/messages/send', messageData)
        .then(() => {
          toast({ title: 'Message sent successfully' });
          refreshConversations();
          // If this was a new conversation, we need to get the new thread ID
          if (!selectedThread) {
            refreshConversations().then(() => {
              const newThread = conversations.find(c => c.contact_id === selectedContact);
              if (newThread) {
                setSelectedThread(newThread.thread_id);
              }
            });
          }
        })
        .catch(() => {
          // Revert optimistic update if failed
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
          queueOffline(messageData);
        });
    } else {
      queueOffline(messageData);
      toast({ title: 'Message queued for offline delivery' });
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

  const refreshConversations = async () => {
    try {
      const res = await api.get('/messages/threads');
      setConversations(res.data);
      
      // If we have a selected thread, refresh its messages
      if (selectedThread) {
        loadThreadMessages(selectedThread);
      }
      
      return res.data;
    } catch (error) {
      toast({ 
        title: 'Failed to refresh conversations', 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const getContactName = (id) => {
    const found = availableContacts.find(c => c.id === id);
    return found ? found.name : 'Unknown User';
  };

  const getContactRole = (id) => {
    const found = availableContacts.find(c => c.id === id);
    return found ? found.role : 'Unknown';
  };

  const startNewMessage = () => {
    if (selectedContact) {
      // Check if there's an existing conversation with this contact
      const existingThread = conversations.find(
        conv => conv.contact_id === selectedContact
      );
      
      if (existingThread) {
        setSelectedThread(existingThread.thread_id);
        setIsComposing(false);
      } else {
        setSelectedThread(null);
        setMessages([]);
        setIsComposing(true);
      }
      setNewMessage('');
    }
  };

  if (isLoading.threads) {


    return (
      <div className="flex h-[calc(100vh-64px)] p-6 gap-6">
        {/* Sidebar Skeleton */}
        <Card className="w-80 p-4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>

        {/* Main Content Skeleton */}
        <Card className="flex-1 p-6">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton 
                key={i} 
                className={`h-16 w-3/4 ${i % 2 === 0 ? 'ml-auto' : 'mr-auto'}`} 
              />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
  <div className="flex h-[calc(100vh-64px)] p-6 gap-6">
    {/* Sidebar */}
    <Card className="w-80 p-4 flex flex-col">
      <CardHeader className="p-0 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span>{t('inbox')}</span>
            <SyncStatusBadge queueKey="messageQueue" />
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={refreshConversations}
            disabled={isLoading.threads}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading.threads ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t('noMessagesYet')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <div
                key={conv.thread_id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedThread === conv.thread_id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setSelectedThread(conv.thread_id);
                  setIsComposing(false);
                }}
              >
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {getContactName(conv.contact_id).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{getContactName(conv.contact_id)}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.timestamp ? format(new Date(conv.timestamp), 'MMM d') : '—'}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {getContactRole(conv.contact_id)}
                    </p>
                    <p className="text-sm truncate mt-1">
                      {conv.last_message || t('noMessages')}
                    </p>
                    {conv.unread_count > 0 && (
                      <Badge className="mt-1 text-xs">{conv.unread_count} {t('unread')}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-medium flex items-center gap-2 mb-3">
          <PlusCircle className="h-4 w-4" />
          {t('newMessage')}
        </h3>
        <Select onValueChange={setSelectedContact} value={selectedContact}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectContact')} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {availableContacts.map(contact => (
              <SelectItem key={contact.id} value={contact.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-muted">
                      {contact.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {contact.name} <span className="text-muted-foreground">({contact.role})</span>
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          className="mt-2 w-full" 
          onClick={startNewMessage}
          disabled={!selectedContact}
        >
          {t('startConversation')}
        </Button>
      </div>
    </Card>

    {/* Main Content */}
    <Card className="flex-1 flex flex-col">
      {selectedThread || isComposing ? (
        <>
          <CardHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {(selectedThread
                    ? getContactName(conversations.find(c => c.thread_id === selectedThread)?.contact_id)
                    : getContactName(selectedContact)
                  ).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>
                  {selectedThread
                    ? getContactName(conversations.find(c => c.thread_id === selectedThread)?.contact_id)
                    : getContactName(selectedContact)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedThread
                    ? getContactRole(conversations.find(c => c.thread_id === selectedThread)?.contact_id)
                    : getContactRole(selectedContact)}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden">
            {isLoading.messages ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="flex flex-col space-y-4">
                    {messages.length === 0 && !isComposing ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">{t('noMessagesInThread')}</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex gap-3 max-w-[85%] ${
                              msg.is_me ? 'ml-auto' : 'mr-auto'
                            }`}
                          >
                            {!msg.is_me && (
                              <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                                <AvatarFallback className="text-xs">
                                  {getContactName(msg.sender_id).charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`p-3 rounded-lg break-words ${
                                msg.is_me ? 'bg-blue-500 text-white' : 'bg-muted'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <p className={`text-xs mt-1 ${msg.is_me ? 'text-blue-100' : 'text-muted-foreground'}`}>
                                {msg.created_at ? format(new Date(msg.created_at), 'MMM d, h:mm a') : '—'}
                                {msg.offline && <span className="ml-2">{t('pendingSync')}</span>}
                              </p>
                            </div>
                            {msg.is_me && (
                              <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                                <AvatarFallback className="text-xs">{t('you')}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('typeMessage')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                {t('send')}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-medium">{t('selectConversation')}</h3>
          <p className="text-muted-foreground max-w-md px-6">
            {role === 'professor'
              ? t('selectOrStartProfessor')
              : t('selectOrStartStudent')}
          </p>
        </div>
      )}
    </Card>
  </div>
);

}