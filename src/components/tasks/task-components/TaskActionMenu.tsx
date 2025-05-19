import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash2, Check, AlertCircle } from 'lucide-react';
import { Task } from '../types/TaskTypes';
import { useTaskData } from '@/hooks/use-task-data';
import { useToast } from '@/hooks/use-toast';

interface TaskActionMenuProps {
  task: Task;
  onEdit?: () => void;
}

const TaskActionMenu: React.FC<TaskActionMenuProps> = ({ task, onEdit }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteTask, updateTaskStatus } = useTaskData();
  const { toast } = useToast();

  // Xử lý khi xóa công việc
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      toast({
        title: "Đã xóa công việc",
        description: "Công việc đã được xóa thành công"
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Lỗi khi xóa công việc:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa công việc. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Xử lý khi đánh dấu hoàn thành
  const handleMarkAsCompleted = async () => {
    try {
      await updateTaskStatus(task.id, 'completed');
      toast({
        title: "Đã hoàn thành",
        description: "Công việc đã được đánh dấu là hoàn thành"
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái công việc:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái công việc. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
            <MoreVertical className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Menu hành động cho công việc</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {task.status !== 'completed' && (
            <DropdownMenuItem 
              className="flex items-center gap-2 text-emerald-600"
              onClick={handleMarkAsCompleted}
            >
              <Check className="h-4 w-4" />
              <span>Đánh dấu hoàn thành</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            className="flex items-center gap-2 text-blue-600"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
            <span>Chỉnh sửa công việc</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 text-red-600"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span>Xóa công việc</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Xác nhận xóa công việc
            </DialogTitle>
            <DialogDescription className="pt-3">
              Bạn có chắc chắn muốn xóa công việc "{task.title}" không? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa công việc</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskActionMenu;
