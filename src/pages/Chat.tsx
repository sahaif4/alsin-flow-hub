import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/user';
import { Message } from '@/types/message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ChatPage = () => {
    const { user, token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const ws = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch all users to create a contact list
    useEffect(() => {
        api.get('/users/').then(response => {
            setUsers(response.data.filter((u: User) => u.id !== user?.id));
        });
    }, [user]);

    // Fetch message history when a user is selected
    useEffect(() => {
        if (selectedUser) {
            api.get(`/chat/history/${selectedUser.id}`).then(response => {
                setMessages(response.data);
            });
        }
    }, [selectedUser]);

    // Manage WebSocket connection
    useEffect(() => {
        if (!token || !user) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = (import.meta.env.VITE_API_BASE_URL || `${window.location.host}`).replace(/^https?:\/\//, '');

        ws.current = new WebSocket(`${wsProtocol}//${wsUrl}/chat/ws?token=${token}`);

        ws.current.onmessage = (event) => {
            const receivedMessage: Message = JSON.parse(event.data);
            if ((receivedMessage.sender_id === selectedUser?.id && receivedMessage.receiver_id === user.id) ||
                (receivedMessage.sender_id === user.id && receivedMessage.receiver_id === selectedUser?.id)) {
                setMessages(prevMessages => [...prevMessages, receivedMessage]);
            }
        };

        ws.current.onclose = () => console.log('WebSocket Disconnected');
        ws.current.onerror = (error) => console.log('WebSocket Error: ', error);

        return () => {
            ws.current?.close();
        };
    }, [token, user, selectedUser]);

    // Auto-scroll to the bottom of the chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() && selectedUser && ws.current && ws.current.readyState === WebSocket.OPEN) {
            const messagePayload = {
                receiver_id: selectedUser.id,
                content: newMessage.trim(),
            };
            ws.current.send(JSON.stringify(messagePayload));
            setNewMessage('');
        }
    };

    const formatMessageTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        if (isToday(date)) return format(date, 'HH:mm');
        if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
        return format(date, 'dd/MM/yy HH:mm');
    };

    return (
        <Card className="h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full">
            {/* User List */}
            <div className="col-span-1 border-r flex flex-col">
                <CardHeader>
                    <CardTitle>Kontak</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-grow">
                    {users.map(u => (
                        <div key={u.id} onClick={() => setSelectedUser(u)}
                             className={cn("flex items-center gap-4 p-4 border-b cursor-pointer hover:bg-muted", selectedUser?.id === u.id && "bg-muted")}>
                            <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${u.full_name}`} />
                                <AvatarFallback>{u.full_name[0]}</AvatarFallback>
                            </Avatar>
                             <div>
                                <p className="font-semibold">{u.full_name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{u.role.replace(/_/g, " ")}</p>
                             </div>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Chat Window */}
            <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-4">
                             <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${selectedUser.full_name}`} />
                                <AvatarFallback>{selectedUser.full_name[0]}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-semibold">{selectedUser.full_name}</h2>
                        </div>
                        <ScrollArea className="flex-grow p-4 bg-muted/20">
                            {messages.map(msg => (
                                <div key={msg.id} className={cn("flex mb-4", msg.sender_id === user?.id ? "justify-end" : "justify-start")}>
                                    <div className={cn("p-3 rounded-lg max-w-lg", msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-card border")}>
                                        <p>{msg.content}</p>
                                        <p className="text-xs opacity-70 mt-1 text-right">{formatMessageTimestamp(msg.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </ScrollArea>
                        <div className="p-4 border-t bg-background">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                                       placeholder="Type a message..." autoComplete="off" />
                                <Button type="submit">Send</Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <p className="text-lg font-semibold">Selamat Datang di Ruang Konsultasi</p>
                            <p className="text-muted-foreground">Pilih kontak di sebelah kiri untuk memulai percakapan.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </Card>
    );
};

export default ChatPage;
