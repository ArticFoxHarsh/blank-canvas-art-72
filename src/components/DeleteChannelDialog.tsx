import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

interface DeleteChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  channelName: string;
}

export const DeleteChannelDialog = ({
  open,
  onOpenChange,
  channelId,
  channelName,
}: DeleteChannelDialogProps) => {
  const navigate = useNavigate();
  const { setActiveChannel } = useWorkspaceStore();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;

      toast.success(`Channel #${channelName} deleted`);
      // Reset active channel and navigate to a safe route
      setActiveChannel('');
      onOpenChange(false);
      navigate('/');
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast.error('Failed to delete channel');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete #{channelName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the channel
            and all its messages.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Channel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
