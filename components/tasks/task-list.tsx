"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import TaskItem from "./task-item";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  priority: number;
  order: number;
}

interface TaskListProps {
  tasks: Task[];
  onReorder: (tasks: Task[]) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
}

export default function TaskList({ tasks, onReorder, onToggleComplete, onDelete, onEdit }: TaskListProps) {
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedTasks = items.map((task, index) => ({
      ...task,
      order: index,
    }));

    await onReorder(updatedTasks);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">No tasks found. Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps}>
                    <TaskItem task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onEdit={onEdit} dragHandleProps={provided.dragHandleProps} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

