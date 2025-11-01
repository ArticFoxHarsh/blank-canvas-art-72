import { motion } from 'framer-motion';
import { Hash, Plus, ChevronDown, ChevronRight, MessageSquare, Search, Settings, Bell, Star, LogOut } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useChannels } from '@/hooks/useChannels';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddChannelDialog } from './AddChannelDialog';
import { AddDMDialog } from './AddDMDialog';

export const WorkspaceSidebar = () => {
  const { activeChannel, setActiveChannel, sidebarCollapsed, toggleSidebar } = useWorkspaceStore();
  const { channels, loading: channelsLoading } = useChannels();
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddDM, setShowAddDM] = useState(false);
  const navigate = useNavigate();

  // Set first channel as active on mount
  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0].id);
    }
  }, [channels, activeChannel, setActiveChannel]);

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (sidebarCollapsed) {
    return (
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: 68 }}
        className="h-screen bg-[hsl(var(--slack-purple))] border-r border-[hsl(var(--slack-purple-active))] flex flex-col"
      >
        <div className="p-3 border-b border-[hsl(var(--slack-purple-active))]">
          <div className="w-10 h-10 rounded bg-[hsl(var(--slack-purple-active))] flex items-center justify-center text-foreground font-black text-sm">
            NW
          </div>
        </div>
      </motion.aside>
    );
  }

  if (channelsLoading) {
    return (
      <div className="w-[260px] bg-[hsl(var(--slack-purple))] border-r border-[hsl(var(--slack-purple-active))] flex items-center justify-center">
        <div className="text-[hsl(var(--slack-text-secondary))]">Loading...</div>
      </div>
    );
  }

  const channelsBySection = channels.reduce((acc, channel) => {
    const section = channel.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(channel);
    return acc;
  }, {} as Record<string, typeof channels>);

  return (
    <motion.aside
      initial={{ width: 68 }}
      animate={{ width: 260 }}
      className="h-screen bg-[hsl(var(--slack-purple))] border-r border-[hsl(var(--slack-purple-active))] flex flex-col"
    >
      {/* Workspace Header */}
      <div className="px-3 py-2 border-b border-[hsl(var(--slack-purple-active))]">
        <Button
          variant="ghost"
          className="w-full justify-between px-2 h-auto py-2 text-foreground hover:bg-[hsl(var(--slack-purple-hover))] rounded"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[hsl(var(--slack-purple-active))] flex items-center justify-center font-black text-sm">
              NW
            </div>
            <span className="font-black text-[15px]">New Workspace</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>

      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          {/* Quick Actions */}
          <div className="space-y-0.5 mb-3">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded hover:bg-[hsl(var(--slack-purple-hover))] text-[hsl(var(--slack-text-secondary))] text-[15px] h-auto justify-start font-normal transition-all"
              onClick={() => navigate('/threads')}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Threads</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded hover:bg-[hsl(var(--slack-purple-hover))] text-[hsl(var(--slack-text-secondary))] text-[15px] h-auto justify-start font-normal transition-all"
              onClick={() => navigate('/activity')}
            >
              <Bell className="h-4 w-4" />
              <span>Activity</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded hover:bg-[hsl(var(--slack-purple-hover))] text-[hsl(var(--slack-text-secondary))] text-[15px] h-auto justify-start font-normal transition-all"
              onClick={() => navigate('/starred')}
            >
              <Star className="h-4 w-4" />
              <span>Starred</span>
            </Button>
          </div>

          {/* Huddles */}
          <div className="mb-3">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between px-3 py-1 text-[hsl(var(--slack-text-secondary))] hover:text-foreground text-xs font-bold h-auto"
              onClick={() => navigate('/huddles')}
            >
              <span>Huddles</span>
            </Button>
          </div>

          {/* Directories */}
          <div className="mb-3">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between px-3 py-1 text-[hsl(var(--slack-text-secondary))] hover:text-foreground text-xs font-bold h-auto"
              onClick={() => navigate('/directories')}
            >
              <span>Directories</span>
            </Button>
          </div>

          {/* Sections */}
          {Object.entries(channelsBySection).map(([section, sectionChannels]) => (
            <div key={section} className="mb-3">
              <button 
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between px-3 py-1 text-[hsl(var(--slack-text-secondary))] hover:text-foreground text-xs font-bold group"
              >
                <div className="flex items-center gap-1">
                  {collapsedSections[section] ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  <span>{section}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (section === 'Direct messages') {
                      setShowAddDM(true);
                    } else {
                      setShowAddChannel(true);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </button>
              {!collapsedSections[section] && (
                <div className="space-y-0.5 mt-0.5">
                  {sectionChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setActiveChannel(channel.id);
                        navigate('/');
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-1 rounded text-[15px] group transition-all',
                        activeChannel === channel.id
                          ? 'bg-[hsl(var(--slack-cyan))] text-foreground font-bold'
                          : 'text-[hsl(var(--slack-text-secondary))] hover:bg-[hsl(var(--slack-purple-hover))]'
                      )}
                    >
                      {channel.type === 'channel' ? (
                        <Hash className="h-[15px] w-[15px]" />
                      ) : (
                        <div className="w-5 h-5 rounded bg-[hsl(var(--slack-purple-active))] flex items-center justify-center text-xs">
                          👤
                        </div>
                      )}
                      <span className="flex-1 text-left truncate">{channel.name}</span>
                    </button>
                  ))}
                  <button 
                    onClick={() => section === 'Direct messages' ? setShowAddDM(true) : setShowAddChannel(true)}
                    className="w-full flex items-center gap-2 px-3 py-1 rounded text-[15px] text-[hsl(var(--slack-text-muted))] hover:bg-[hsl(var(--slack-purple-hover))] hover:text-[hsl(var(--slack-text-secondary))]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add {section === 'Direct messages' ? 'teammates' : 'channels'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Apps */}
          <div className="mb-3">
            <button className="w-full flex items-center justify-between px-3 py-1 text-[hsl(var(--slack-text-secondary))] hover:text-foreground text-xs font-bold group">
              <div className="flex items-center gap-1">
                <ChevronDown className="h-3 w-3" />
                <span>Apps</span>
              </div>
            </button>
            <div className="space-y-0.5 mt-0.5">
              <button className="w-full flex items-center gap-2 px-3 py-1 rounded text-[15px] text-[hsl(var(--slack-text-secondary))] hover:bg-[hsl(var(--slack-purple-hover))]">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                  S
                </div>
                <span>Slackbot</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-pink-500"></span>
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-2 border-t border-[hsl(var(--slack-purple-active))]">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-lg border border-primary/30 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-black text-foreground text-[15px] truncate">
              {profile?.display_name || profile?.username || 'User'}
            </div>
            <div className="text-xs text-[hsl(var(--slack-text-muted))] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Active</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-[hsl(var(--slack-text-muted))] hover:text-foreground hover:bg-[hsl(var(--slack-purple-hover))]"
            onClick={signOut}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <AddChannelDialog open={showAddChannel} onOpenChange={setShowAddChannel} />
      <AddDMDialog open={showAddDM} onOpenChange={setShowAddDM} />
    </motion.aside>
  );
};
