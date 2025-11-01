import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ReactNode } from 'react';

interface ChannelItemContextMenuProps {
  children: ReactNode;
  sections: string[];
  currentSection: string;
  onMoveToSection: (section: string) => void;
}

export const ChannelItemContextMenu = ({
  children,
  sections,
  currentSection,
  onMoveToSection,
}: ChannelItemContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>Mark as read</ContextMenuItem>
        <ContextMenuItem>Copy link</ContextMenuItem>
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <span>Move to section</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {sections
              .filter((section) => section !== currentSection)
              .map((section) => (
                <ContextMenuItem
                  key={section}
                  onClick={() => onMoveToSection(section)}
                >
                  {section}
                </ContextMenuItem>
              ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuItem className="text-destructive">
          Leave channel
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
