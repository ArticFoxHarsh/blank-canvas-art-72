import { useEffect } from 'react';
import { WorkspaceSidebar } from '@/components/WorkspaceSidebar';
import { MessageArea } from '@/components/MessageArea';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useChannels } from '@/hooks/useChannels';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { channels } = useChannels();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Seed sample messages if channels exist but no messages
  useEffect(() => {
    const seedSampleMessages = async () => {
      if (!user || channels.length === 0) return;

      // Check if messages already exist
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

      if (existingMessages && existingMessages.length > 0) return;

      // Add sample messages to each channel
      const sampleMessages = channels.flatMap((channel, channelIndex) => [
        {
          channel_id: channel.id,
          user_id: user.id,
          content: `Hey everyone! Welcome to #${channel.name} 👋`,
          created_at: new Date(Date.now() - 3600000 * (channelIndex * 3 + 3)).toISOString(),
        },
        {
          channel_id: channel.id,
          user_id: user.id,
          content: `This is a great space for discussing ${channel.description || 'various topics'}`,
          created_at: new Date(Date.now() - 3600000 * (channelIndex * 3 + 2)).toISOString(),
        },
        {
          channel_id: channel.id,
          user_id: user.id,
          content: 'Feel free to share your thoughts and ideas here!',
          created_at: new Date(Date.now() - 3600000 * (channelIndex * 3 + 1)).toISOString(),
        },
      ]);

      if (sampleMessages.length > 0) {
        await supabase.from('messages').insert(sampleMessages);
      }
    };

    seedSampleMessages();
  }, [user, channels]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <WorkspaceSidebar />
      <MessageArea />
    </div>
  );
};

export default Index;
