import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Star, Users, Search, Info, AtSign, Send, Bold, Italic, Strikethrough, Link2, List, ListOrdered, Code, Code2, Quote, Menu, Loader2, Paperclip, Type, Smile, Video, Mic } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useChannels } from '@/hooks/useChannels';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
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
  const { profile } = useProfile(user?.id);
  const { messages, loading, sendMessage, deleteMessage } = useMessages(activeChannel, profile?.username);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionUsers, setMentionUsers] = useState<Array<{ id: string; username: string; display_name?: string }>>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { channelId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (channelId && channelId !== activeChannel) {
      setActiveChannel(channelId);
    } else if (!channelId && activeChannel) {
      navigate(`/c/${activeChannel}`, { replace: true });
    }
  }, [channelId, activeChannel, setActiveChannel, navigate]);

  // Seed sample messages across all channels on first load
  useEffect(() => {
    const seed = async () => {
      if (!user || channels.length === 0) return;
      if (localStorage.getItem('seeded_messages_v1')) return;
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
      if (error) return;
      if ((count || 0) > 0) {
        localStorage.setItem('seeded_messages_v1', '1');
        return;
      }
      const now = Date.now();
      const sampleMessages = channels.flatMap((channel, idx) => ([
        { channel_id: channel.id, user_id: user.id, content: `Welcome to #${channel.name}! 👋`, created_at: new Date(now - 60000*(idx*3+3)).toISOString() },
        { channel_id: channel.id, user_id: user.id, content: `This is the ${channel.name} space${channel.description ? ` — ${channel.description}` : ''}.`, created_at: new Date(now - 60000*(idx*3+2)).toISOString() },
        { channel_id: channel.id, user_id: user.id, content: 'Share your first message to get started!', created_at: new Date(now - 60000*(idx*3+1)).toISOString() },
      ]));
      await supabase.from('messages').insert(sampleMessages);
      localStorage.setItem('seeded_messages_v1', '1');
    };
    seed();
  }, [channels, user]);

  const channel = channels.find((c) => c.id === activeChannel);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = messageInput.trim();
    
    if ((!trimmedMessage && selectedFiles.length === 0) || !user) return;

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

  // Fetch users for mentions
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .ilike('username', `%${mentionSearch}%`)
        .limit(5);
      
      if (data) {
        setMentionUsers(data);
      }
    };

    if (showMentions && mentionSearch.length > 0) {
      fetchUsers();
    }
  }, [mentionSearch, showMentions]);

  // Handle mention input
  const handleInputChange = (value: string) => {
    setMessageInput(value);
    
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1 && lastAtSymbol === cursorPos - 1) {
      setShowMentions(true);
      setMentionSearch('');
      setSelectedMentionIndex(0);
    } else if (lastAtSymbol !== -1) {
      const searchText = textBeforeCursor.slice(lastAtSymbol + 1);
      if (!searchText.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(searchText);
        setSelectedMentionIndex(0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username: string) => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = messageInput.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    const newText = 
      messageInput.slice(0, lastAtSymbol) + 
      `@${username} ` + 
      messageInput.slice(cursorPos);
    
    setMessageInput(newText);
    setShowMentions(false);
    
    setTimeout(() => {
      inputRef.current?.focus();
      const newPos = lastAtSymbol + username.length + 2;
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
          <ChannelWelcome channelName={channel.name} channelType={channel.type} />
        ) : (
          <div className="p-5 space-y-2 max-w-6xl">
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
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
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
                onClick={() => insertFormatting('~~')}
                title="Strikethrough"
              >
                <Strikethrough className="h-3.5 w-3.5" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-muted"
                onClick={() => insertFormatting('[', '](url)')}
                title="Link"
              >
                <Link2 className="h-3.5 w-3.5" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-muted"
                onClick={() => {
                  const lines = messageInput.split('\n');
                  const newText = lines.map((line, idx) => line.trim() ? `${idx + 1}. ${line}` : line).join('\n');
                  setMessageInput(newText);
                }}
                title="Numbered list"
              >
                <ListOrdered className="h-3.5 w-3.5" />
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
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-muted"
                onClick={() => insertFormatting('```\n', '\n```')}
                title="Code block"
              >
                <Code className="h-3.5 w-3.5" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-muted"
                onClick={() => insertFormatting('`')}
                title="Code"
              >
                <Code2 className="h-3.5 w-3.5" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-muted"
                onClick={() => {
                  const lines = messageInput.split('\n');
                  const newText = lines.map(line => line.trim() ? `> ${line}` : line).join('\n');
                  setMessageInput(newText);
                }}
                title="Quote"
              >
                <Quote className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Input Field */}
            <div className="relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={channel.type === 'dm' ? `Message @${channel.name}` : `Message #${channel.name}`}
                className="w-full px-3 py-3 bg-transparent border-none outline-none text-[15px] placeholder:text-muted-foreground resize-none min-h-[60px] max-h-[200px]"
                onKeyDown={(e) => {
                  if (showMentions) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSelectedMentionIndex((prev) => 
                        prev < mentionUsers.length - 1 ? prev + 1 : 0
                      );
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSelectedMentionIndex((prev) => 
                        prev > 0 ? prev - 1 : mentionUsers.length - 1
                      );
                    } else if (e.key === 'Enter' || e.key === 'Tab') {
                      e.preventDefault();
                      if (mentionUsers[selectedMentionIndex]) {
                        insertMention(mentionUsers[selectedMentionIndex].username);
                      }
                      return;
                    } else if (e.key === 'Escape') {
                      setShowMentions(false);
                    }
                  } else if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                rows={1}
              />
              
              {/* Mention Autocomplete */}
              <AnimatePresence>
                {showMentions && mentionUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
                  >
                    {mentionUsers.map((user, index) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => insertMention(user.username)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[hsl(var(--slack-purple-hover))] transition-colors ${
                          index === selectedMentionIndex ? 'bg-[hsl(var(--slack-purple-hover))]' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                          👤
                        </div>
                        <div>
                          <div className="font-bold text-sm">{user.display_name || user.username}</div>
                          <div className="text-xs text-muted-foreground">@{user.username}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-between px-2 py-2 border-t border-border">
              <div className="flex items-center gap-1">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-muted"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  title="Attach files"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileSelect(Array.from(e.target.files));
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-muted"
                  title="Format"
                >
                  <Type className="h-4 w-4" />
                </Button>
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
                  <AtSign className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-muted"
                  title="Video message"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-muted"
                  title="Voice message"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <AnimatePresence>
                {messageInput.trim() && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <Button
                      type="submit"
                      size="icon"
                      className="h-8 w-8 bg-[hsl(var(--slack-cyan))] hover:bg-[hsl(var(--slack-cyan-hover))] text-white rounded"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
