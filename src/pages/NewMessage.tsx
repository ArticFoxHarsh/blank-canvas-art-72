import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { WorkspaceSidebar } from '@/components/WorkspaceSidebar';

export default function NewMessage() {
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateChannel = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one person');
      return;
    }

    try {
      const channelName = selectedUsers.join(', ');
      const { data, error } = await supabase
        .from('channels')
        .insert({
          name: channelName,
          type: 'dm',
          section: 'Direct messages',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Direct message created');
      navigate('/');
      setSearch('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error creating DM:', error);
      toast.error('Failed to create direct message');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <WorkspaceSidebar />
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">New message</h1>
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            <span className="font-semibold">To:</span>
          </div>
          <div className="relative">
            <Input
              placeholder="#a-channel, @somebody or somebody@example.com"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4 overflow-auto">
          {selectedUsers.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {selectedUsers.map((user) => (
                <div
                  key={user}
                  className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-md text-sm"
                >
                  <span>{user}</span>
                  <button
                    onClick={() =>
                      setSelectedUsers(selectedUsers.filter((u) => u !== user))
                    }
                    className="hover:bg-primary/20 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="max-w-2xl">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-12 h-12 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-2xl">
                💡
              </div>
              <div>
                <h2 className="font-bold text-lg mb-2">Draft a message, without distractions</h2>
                <p className="text-muted-foreground text-sm">
                  From here, you can message any colleague or channel. Not seeing the right person in the list above?{' '}
                  <button className="text-primary hover:underline">
                    Add people to Slack
                  </button>
                </p>
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <Button onClick={handleCreateChannel} className="w-full">
                Start conversation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
