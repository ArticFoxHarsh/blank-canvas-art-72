import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChannels } from '@/hooks/useChannels';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

const Index = () => {
  const navigate = useNavigate();
  const { channels, loading } = useChannels();
  const { activeChannel, setActiveChannel } = useWorkspaceStore();

  useEffect(() => {
    if (loading) return;
    
    // If we have an active channel, navigate to it
    if (activeChannel) {
      navigate(`/c/${activeChannel}`, { replace: true });
      return;
    }
    
    // Otherwise navigate to first channel
    if (channels.length > 0) {
      setActiveChannel(channels[0].id);
      navigate(`/c/${channels[0].id}`, { replace: true });
    }
  }, [channels, loading, activeChannel, navigate, setActiveChannel]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-muted-foreground">Loading workspace...</div>
    </div>
  );
};

export default Index;
