import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, Star, Users, Search, Info, AtSign, Send, Bold, Italic, ListOrdered, Menu, Loader2 } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useChannels } from '@/hooks/useChannels';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChannelWelcome } from './ChannelWelcome';
import { MessageItem } from './MessageItem';
import { FileUpload } from './FileUpload';
import { EmojiPicker } from './EmojiPicker';
import { supabase } from '@/integrations/supabase/client';

export const MessageArea = () => {
  const { activeChannel, toggleSidebar, sidebarCollapsed, setActiveChannel } = useWorkspaceStore();
  const { channels } = useChannels();
  const { user } = useAuth();
  const { messages, loading, sendMessage, deleteMessage } = useMessages(activeChannel);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [seededMessages, setSeededMessages] = useState(false);

  // Sync URL param with active channel
  useEffect(() => {
    if (channelId && channelId !== activeChannel) {
      setActiveChannel(channelId);
    }
  }, [channelId, activeChannel, setActiveChannel]);

  // Seed sample messages across all channels once
  useEffect(() => {
    if (seededMessages || !user || channels.length === 0) return;
    
    const seed = async () => {
      const key = 'workspace_messages_seeded';
      if (localStorage.getItem(key)) {
        setSeededMessages(true);
        return;
      }

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
      
      if ((count || 0) > 0) {
        localStorage.setItem(key, '1');
        setSeededMessages(true);
        return;
      }

      const now = Date.now();
      const samples = channels.flatMap((ch, i) => [
        { channel_id: ch.id, user_id: user.id, content: `Welcome to #${ch.name}! 👋`, created_at: new Date(now - 180000 - i*60000).toISOString() },
        { channel_id: ch.id, user_id: user.id, content: ch.description ? `${ch.description}` : 'This is your space for collaboration.', created_at: new Date(now - 120000 - i*60000).toISOString() },
        { channel_id: ch.id, user_id: user.id, content: 'Feel free to start chatting!', created_at: new Date(now - 60000 - i*60000).toISOString() },
      ]);

      await supabase.from('messages').insert(samples);
      localStorage.setItem(key, '1');
      setSeededMessages(true);
    };

    seed();
  }, [user, channels, seededMessages]);

  const channel = channels.find((c) => c.id === activeChannel);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = messageInput.trim();
    
    if ((!trimmedMessage && selectedFiles.length === 0) || !user) return;

    // TODO: Upload files to storage before sending message
    if (trimmedMessage) {
      await sendMessage(trimmedMessage, user.id);
    }
    setMessageInput('');
    setSelectedFiles([]);
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const insertFormatting = (before: string, after: string = before) => {
    if (!inputRef.current) return;
    
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const text = messageInput;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setMessageInput(newText);
    
    setTimeout(() => {
      inputRef.current?.focus();
      const newPos = start + before.length + selectedText.length + after.length;
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleEmojiSelect = (emoji: string) => {
    const cursorPos = inputRef.current?.selectionStart || messageInput.length;
    const newText = messageInput.slice(0, cursorPos) + emoji + messageInput.slice(cursorPos);
    setMessageInput(newText);
    setTimeout(() => {
      inputRef.current?.focus();
      const newPos = cursorPos + emoji.length;
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Select a channel to start messaging</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Channel Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[49px] border-b border-border flex items-center justify-between px-4 bg-card flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-2"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {channel.type === 'channel' ? (
            <Hash className="h-[18px] w-[18px] text-muted-foreground" />
          ) : (
            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-sm">👤</div>
          )}
          <h2 className="font-black text-[15px]">{channel.name}</h2>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Star className="h-[15px] w-[15px] text-muted-foreground hover:text-yellow-500 transition-colors" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs font-semibold">
            <Users className="h-3.5 w-3.5" />
            <span>2</span>
          </Button>
          <div className="w-px h-5 bg-border" />
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </motion.div>
          </div>
        ) : messages.length === 0 ? (
          <ChannelWelcome channelName={channel.name} />
        ) : (
          <div className="p-5 space-y-2 max-w-6xl">
            {/* Channel Topic */}
            {channel.description && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pb-4 mb-4 border-b border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-[15px] mb-1">#{channel.name}</h3>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">{channel.description}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Messages */}
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const showAvatar = !prevMessage || 
                prevMessage.user_id !== message.user_id ||
                new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000;

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  showAvatar={showAvatar}
                  onDelete={async (id) => {
                    await deleteMessage(id);
                  }}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-5 border-t border-border flex-shrink-0">
        <form onSubmit={handleSendMessage}>
          <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-muted"
                onClick={() => insertFormatting('**')}
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-muted"
                onClick={() => insertFormatting('_')}
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-muted"
                onClick={() => {
                  const lines = messageInput.split('\n');
                  const newText = lines.map(line => line.trim() ? `• ${line}` : line).join('\n');
                  setMessageInput(newText);
                }}
                title="Bulleted list"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </Button>
              <div className="flex-1" />
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-muted"
                onClick={() => {
                  const cursorPos = inputRef.current?.selectionStart || 0;
                  const newText = messageInput.slice(0, cursorPos) + '@' + messageInput.slice(cursorPos);
                  setMessageInput(newText);
                  setTimeout(() => {
                    inputRef.current?.focus();
                    inputRef.current?.setSelectionRange(cursorPos + 1, cursorPos + 1);
                  }, 0);
                }}
                title="Mention someone"
              >
                <AtSign className="h-3.5 w-3.5" />
              </Button>
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFiles={selectedFiles}
                onFileRemove={handleFileRemove}
              />
            </div>

            {/* Input Field */}
            <div className="relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message #${channel.name}`}
                className="w-full px-3 py-3 bg-transparent border-none outline-none text-[15px] placeholder:text-muted-foreground resize-none min-h-[60px] max-h-[200px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                rows={1}
              />
              {messageInput.trim() && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-2 bottom-2 h-8 w-8 bg-primary hover:bg-primary/90 rounded transition-all hover:scale-105"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
