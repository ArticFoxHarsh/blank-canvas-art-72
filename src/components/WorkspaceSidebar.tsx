import { motion } from 'framer-motion';
import { Hash, Plus, ChevronDown, ChevronRight, MessageSquare, Search, Settings, Bell, Star, LogOut, Edit } from 'lucide-react';
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
import { ChannelContextMenu } from './ChannelContextMenu';
import { ChannelItemContextMenu } from './ChannelItemContextMenu';
import { DeleteChannelDialog } from './DeleteChannelDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SortableChannelItemProps {
  channel: any;
  isActive: boolean;
  onClick: () => void;
  sections: string[];
  currentSection: string;
  onMoveToSection: (channelId: string, newSection: string) => void;
  onDelete: (channelId: string, channelName: string) => void;
}

const SortableChannelItem = ({ 
  channel, 
  isActive, 
  onClick, 
  sections, 
  currentSection, 
  onMoveToSection,
  onDelete 
}: SortableChannelItemProps) => {
  const navigate = useNavigate();
  const {
    attributes,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: channel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
    navigate(`/c/${channel.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-1 rounded text-[15px] group transition-all',
        isActive
          ? 'bg-[hsl(var(--slack-cyan))] text-foreground font-bold'
          : 'text-[hsl(var(--slack-text-secondary))] hover:bg-[hsl(var(--slack-purple-hover))]'
      )}
    >
      <ChannelItemContextMenu
        sections={sections}
        currentSection={currentSection}
        onMoveToSection={(section) => onMoveToSection(channel.id, section)}
        onDelete={() => onDelete(channel.id, channel.name)}
      >
        <div
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(e as any);
            }
          }}
          className="flex items-center gap-2 flex-1 cursor-pointer"
        >
          {channel.type === 'channel' ? (
            <Hash className="h-[15px] w-[15px]" />
          ) : (
            <div className="w-5 h-5 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs border border-primary/20 overflow-hidden">
              {channel.other_user?.avatar_url ? (
                <img src={channel.other_user.avatar_url} alt={channel.other_user.username} className="w-full h-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
          )}
          <span className="flex-1 text-left truncate">{channel.name}</span>
        </div>
      </ChannelItemContextMenu>
    </div>
  );
};

export const WorkspaceSidebar = () => {
  const { activeChannel, setActiveChannel, sidebarCollapsed, toggleSidebar, channelOrder, reorderChannels } = useWorkspaceStore();
  const { channels, loading: channelsLoading } = useChannels();
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddDM, setShowAddDM] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; channelId: string; channelName: string }>({
    open: false,
    channelId: '',
    channelName: '',
  });
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Set first channel as active on mount or navigate to active channel
  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0].id);
      navigate(`/c/${channels[0].id}`);
    }
  }, [channels, activeChannel, setActiveChannel, navigate]);

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDragEnd = (event: DragEndEvent, section: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const sectionChannels = channelsBySection[section];
      const oldIndex = sectionChannels.findIndex((c) => c.id === active.id);
      const newIndex = sectionChannels.findIndex((c) => c.id === over.id);

      const newOrder = arrayMove(sectionChannels, oldIndex, newIndex);
      reorderChannels(section, newOrder.map((c) => c.id));
    }
  };

  const handleMoveToSection = async (channelId: string, newSection: string) => {
    try {
      const { error } = await supabase
        .from('channels')
        .update({ section: newSection })
        .eq('id', channelId);

      if (error) throw error;

      toast.success(`Channel moved to ${newSection}`);
    } catch (error) {
      console.error('Error moving channel:', error);
      toast.error('Failed to move channel');
    }
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
            W
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

  // Apply custom ordering
  Object.keys(channelsBySection).forEach((section) => {
    if (channelOrder[section]) {
      channelsBySection[section] = channelsBySection[section].sort((a, b) => {
        const aIndex = channelOrder[section].indexOf(a.id);
        const bIndex = channelOrder[section].indexOf(b.id);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
  });

  return (
    <motion.aside
      initial={{ width: 68 }}
      animate={{ width: 260 }}
      className="h-screen bg-[hsl(var(--slack-purple))] border-r border-[hsl(var(--slack-purple-active))] flex flex-col"
    >
      {/* Workspace Header */}
      <div className="px-3 py-2 border-b border-[hsl(var(--slack-purple-active))]">
        <div className="w-full flex justify-between items-center px-2 py-2">
          <div className="flex items-center gap-2.5">
            <span className="font-black text-[15px]">Debugging Demons</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0 text-foreground hover:bg-[hsl(var(--slack-purple-active))]"
              onClick={() => navigate('/new-message')}
              title="New message"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0 text-foreground hover:bg-[hsl(var(--slack-purple-active))]"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem>
                  Filter sidebar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Leave inactive channels
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Edit sidebar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Create new section
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ChevronDown className="h-4 w-4 ml-1" />
          </div>
        </div>
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
              onClick={() => navigate('/starred')}
            >
              <Star className="h-4 w-4" />
              <span>Starred</span>
            </Button>
          </div>

          <div className="border-t border-[hsl(var(--slack-purple-active))] mb-3" />

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

          <div className="border-t border-[hsl(var(--slack-purple-active))] mb-3" />

          {/* Sections */}
          {Object.entries(channelsBySection).map(([section, sectionChannels]) => (
            <div key={section} className="mb-3">
              <ChannelContextMenu>
                <div 
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center justify-between px-3 py-1 text-[hsl(var(--slack-text-secondary))] hover:text-foreground text-xs font-bold group cursor-pointer"
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
                </div>
              </ChannelContextMenu>
              {!collapsedSections[section] && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, section)}
                >
                  <SortableContext
                    items={sectionChannels.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-0.5 mt-0.5">
                      {sectionChannels.map((channel) => (
                        <SortableChannelItem
                          key={channel.id}
                          channel={channel}
                          isActive={activeChannel === channel.id}
                          onClick={() => {
                            setActiveChannel(channel.id);
                            navigate(`/c/${channel.id}`);
                          }}
                          sections={Object.keys(channelsBySection)}
                          currentSection={section}
                          onMoveToSection={handleMoveToSection}
                          onDelete={(channelId, channelName) => {
                            setDeleteDialog({ open: true, channelId, channelName });
                          }}
                        />
                      ))}
                      <button 
                        onClick={() => section === 'Direct messages' ? setShowAddDM(true) : setShowAddChannel(true)}
                        className="w-full flex items-center gap-2 px-3 py-1 rounded text-[15px] text-[hsl(var(--slack-text-muted))] hover:bg-[hsl(var(--slack-purple-hover))] hover:text-[hsl(var(--slack-text-secondary))]"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add {section === 'Direct messages' ? 'teammates' : 'channels'}</span>
                      </button>
                    </div>
                  </SortableContext>
                </DndContext>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 px-2 py-2 hover:bg-[hsl(var(--slack-purple-hover))] rounded transition-colors">
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
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-popover z-50">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xl border border-primary/30 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">
                    {profile?.display_name || profile?.username || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenuItem className="flex items-center gap-2 p-3 cursor-pointer">
              <span className="text-sm">😊</span>
              <span className="text-sm">Update your status</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-3 cursor-pointer">
              <span className="text-sm">Set yourself as away</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between p-3 cursor-pointer">
              <span className="text-sm">Pause notifications</span>
              <span className="text-xs text-muted-foreground">On</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-3 cursor-pointer">
              <span className="text-sm">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 cursor-pointer">
              <span className="text-sm">Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="p-3 cursor-pointer text-destructive focus:text-destructive"
              onClick={signOut}
            >
              <span className="text-sm">Sign out of Debugging Demons</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AddChannelDialog open={showAddChannel} onOpenChange={setShowAddChannel} />
      <AddDMDialog open={showAddDM} onOpenChange={setShowAddDM} />
      <DeleteChannelDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        channelId={deleteDialog.channelId}
        channelName={deleteDialog.channelName}
      />
    </motion.aside>
  );
};
