import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Smile, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
  onDelete?: (id: string) => Promise<void> | void;
}

export const MessageItem = ({ message, showAvatar = true, onDelete }: MessageItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🚀', '👀'];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getDisplayName = () => {
    return message.profiles?.display_name || message.profiles?.username || 'User';
  };

  const getAvatar = () => {
    if (message.profiles?.avatar_url) {
      return <img src={message.profiles.avatar_url} alt="Avatar" className="w-full h-full rounded object-cover" />;
    }
    return '👤';
  };

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { emoji: reaction.emoji, count: 0, users: [] as string[] };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user_id);
    return acc;
  }, {} as Record<string, { emoji: string; count: number; users: string[] }>);

  const reactionList = groupedReactions ? Object.values(groupedReactions) : [];

  const handleAddReaction = async (emoji: string) => {
    if (!user) return;
    
    const { error } = await supabase.from('reactions').insert({
      message_id: message.id,
      user_id: user.id,
      emoji,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive',
      });
    }
    setShowEmojiPicker(false);
  };

  const handleRemoveReaction = async (emoji: string) => {
    if (!user) return;

    const reaction = message.reactions?.find(r => r.emoji === emoji && r.user_id === user.id);
    if (!reaction) return;

    const { error } = await supabase.from('reactions').delete().eq('id', reaction.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove reaction',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!user || message.user_id !== user.id) return;

    try {
      if (onDelete) {
        await onDelete(message.id);
      } else {
        const { error } = await supabase.from('messages').delete().eq('id', message.id);
        if (error) throw error;
      }
      toast({
        title: 'Message deleted',
        description: 'Your message has been deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const userHasReacted = (emoji: string) => {
    return message.reactions?.some(r => r.emoji === emoji && r.user_id === user?.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex gap-3 hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-lg group relative"
    >
      {showAvatar && (
        <div className="w-9 h-9 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg flex-shrink-0 border border-primary/20 overflow-hidden">
          {getAvatar()}
        </div>
      )}
      {!showAvatar && <div className="w-9 flex-shrink-0" />}

      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-bold text-[15px]">{getDisplayName()}</span>
            <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
          </div>
        )}
        {!showAvatar && (
          <div className="absolute left-2 top-1.5 text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.created_at)}
          </div>
        )}
        <div className="text-[15px] leading-[1.46668]">{message.content}</div>

        {/* Reactions */}
        <div className="flex gap-1 mt-1 flex-wrap">
          {reactionList.map((reaction, idx) => (
            <button
              key={idx}
              onClick={() => userHasReacted(reaction.emoji) ? handleRemoveReaction(reaction.emoji) : handleAddReaction(reaction.emoji)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors ${
                userHasReacted(reaction.emoji)
                  ? 'border-primary bg-primary/20 hover:bg-primary/30'
                  : 'border-primary/30 bg-primary/10 hover:bg-primary/20'
              }`}
            >
              <span>{reaction.emoji}</span>
              <span className="font-semibold">{reaction.count}</span>
            </button>
          ))}
          <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-border hover:border-primary/50 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                <Smile className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto p-2">
              <div className="flex gap-1">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddReaction(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reactions display removed thread indicator */}
      </div>

      {/* Hover Actions */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute -top-3 right-4 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg px-1 py-1"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Smile className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-auto p-2">
                <div className="flex gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowThread(!showThread)}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Bookmark className="h-4 w-4" />
            </Button>
            {user?.id === message.user_id && (
              <>
                <div className="w-px h-4 bg-border mx-0.5" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleDeleteMessage}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
