import { ChevronLeft, ChevronRight, RotateCcw, Search, HelpCircle, Users, Gift, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export const TopBar = () => {
  const navigate = useNavigate();
  const { toggleMembersSidebar, membersSidebarOpen } = useWorkspaceStore();
  const { totalCount } = useWorkspaceMembers();
  const [helpOpen, setHelpOpen] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  return (
    <header className="h-[44px] bg-[hsl(var(--slack-purple))] border-b border-[hsl(var(--slack-purple-active))] flex items-center justify-between px-3 gap-3">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-7 w-7 text-[hsl(var(--slack-text-muted))] hover:text-foreground hover:bg-[hsl(var(--slack-purple-hover))]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleForward}
          className="h-7 w-7 text-[hsl(var(--slack-text-muted))] hover:text-foreground hover:bg-[hsl(var(--slack-purple-hover))]"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.location.reload()}
          className="h-7 w-7 text-[hsl(var(--slack-text-muted))] hover:text-foreground hover:bg-[hsl(var(--slack-purple-hover))]"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--slack-text-muted))]" />
          <Input
            type="text"
            placeholder="Search Debugging Demons"
            className="w-full pl-10 bg-[hsl(var(--slack-purple-active))] border-[hsl(var(--slack-purple-active))] text-foreground placeholder:text-[hsl(var(--slack-text-muted))] focus-visible:ring-1 focus-visible:ring-[hsl(var(--slack-cyan))] h-8"
          />
        </div>
      </div>

      {/* Members & Help Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMembersSidebar}
          className={`h-7 px-3 text-[hsl(var(--slack-text-muted))] hover:text-foreground hover:bg-[hsl(var(--slack-purple-hover))] ${
            membersSidebarOpen ? 'bg-[hsl(var(--slack-purple-hover))] text-foreground' : ''
          }`}
        >
          <Users className="h-4 w-4 mr-1.5" />
          <span className="text-xs">{totalCount}</span>
        </Button>
        <DropdownMenu open={helpOpen} onOpenChange={setHelpOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[hsl(var(--slack-text-muted))] hover:text-foreground hover:bg-[hsl(var(--slack-purple-hover))]"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-popover z-50">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full pl-10 bg-background border-border"
                />
              </div>
            </div>
            <div className="p-2">
              <DropdownMenuItem className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  📚
                </div>
                <div>
                  <div className="font-semibold text-sm">Quick start guide</div>
                  <div className="text-xs text-muted-foreground">Learn the basics and get to work in Slack</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  🎨
                </div>
                <div>
                  <div className="font-semibold text-sm">New layout for channels and DMs</div>
                  <div className="text-xs text-muted-foreground">Add files, workflows and more to tabs</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center justify-between p-3">
                <span className="text-sm">Configure your Slack notifications</span>
                <span className="text-primary text-xs">🔔</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between p-3">
                <span className="text-sm">Set your Slack status and availability</span>
                <span className="text-primary text-xs">💎</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between p-3">
                <span className="text-sm">Set a reminder</span>
                <span className="text-primary text-xs">☁️</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between p-3">
                <span className="text-sm">Use emoji reactions</span>
                <span className="text-primary text-xs">😊</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between p-3">
                <span className="text-sm">Slack video tutorials</span>
                <span className="text-primary text-xs">💎</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[hsl(var(--slack-text-muted))] hover:text-foreground hover:bg-[hsl(var(--slack-purple-hover))]"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-popover z-50">
            <DropdownMenuItem>Open channel details</DropdownMenuItem>
            <DropdownMenuItem>Summarise channel</DropdownMenuItem>
            <DropdownMenuItem>Edit notifications</DropdownMenuItem>
            <DropdownMenuItem>Star channel</DropdownMenuItem>
            <DropdownMenuItem>Move channel</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Add template to channel</DropdownMenuItem>
            <DropdownMenuItem>Add a workflow</DropdownMenuItem>
            <DropdownMenuItem>Edit settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Copy</DropdownMenuItem>
            <DropdownMenuItem>Search in channel</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Leave channel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
