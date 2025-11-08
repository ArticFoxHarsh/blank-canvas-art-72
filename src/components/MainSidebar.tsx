import { Home, MessageSquare, Bell, Files, MoreHorizontal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { icon: Home, label: 'Home', path: '/', showLabel: true },
  { icon: MessageSquare, label: 'DMs', path: '/dms', showLabel: true },
  { icon: Files, label: 'Files', path: '/files', showLabel: true },
  { icon: MoreHorizontal, label: 'More', path: '/more', showLabel: true },
];

export const MainSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/c/');
    }
    return location.pathname.startsWith(path);
  };

  const getHoverContent = (label: string) => {
    switch (label) {
      case 'Home':
        return (
          <div className="p-2 min-w-[200px]">
            <div className="font-bold text-sm mb-2">Home</div>
            <div className="text-xs text-muted-foreground mb-2">View all channels and messages</div>
          </div>
        );
      case 'DMs':
        return (
          <div className="p-2 min-w-[200px]">
            <div className="font-bold text-sm mb-2">Direct Messages</div>
            <div className="text-xs text-muted-foreground mb-2">Private 1-on-1 conversations</div>
          </div>
        );
      case 'Files':
        return (
          <div className="p-2 min-w-[200px]">
            <div className="font-bold text-sm mb-2">Files</div>
            <div className="text-xs text-muted-foreground mb-2">Browse shared files and documents</div>
          </div>
        );
      case 'More':
        return (
          <div className="p-2 min-w-[200px]">
            <div className="font-bold text-sm mb-2">More</div>
            <div className="text-xs text-muted-foreground mb-2">Additional workspace tools</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="w-[68px] h-screen bg-[hsl(var(--slack-purple-dark))] flex flex-col items-center py-3 gap-2 border-r border-[hsl(var(--slack-purple-active))]">
      {/* Workspace Icon */}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => navigate('/')}
              className="w-12 h-12 rounded-lg bg-[hsl(var(--slack-purple-active))] flex items-center justify-center font-black text-sm hover:bg-[hsl(var(--slack-purple-hover))] transition-colors mb-2"
            >
              DD
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover border-border p-3">
            <div className="font-bold text-sm">Debugging Demons</div>
          </TooltipContent>
        </Tooltip>

        {/* Navigation Items */}
        {navItems.map((item) => (
          <Tooltip key={item.path}>
            <TooltipTrigger asChild>
              <div 
                className="flex flex-col items-center gap-1"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-12 h-12 rounded-lg transition-colors',
                    isActive(item.path)
                      ? 'bg-[hsl(var(--slack-cyan))] text-foreground'
                      : 'text-[hsl(var(--slack-text-muted))] hover:bg-[hsl(var(--slack-purple-hover))] hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
                {item.showLabel && (
                  <span className="text-xs text-[hsl(var(--slack-text-muted))] font-bold">
                    {item.label}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover border-border p-0">
              {getHoverContent(item.label)}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </aside>
  );
};
