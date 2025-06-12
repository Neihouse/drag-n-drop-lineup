import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ReactNode, CSSProperties } from 'react';
import clsx from 'clsx';

interface DraggableProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function Draggable({ id, children, className }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });
  
  const style: CSSProperties | undefined = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    position: 'relative',
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.2)' : undefined,
    pointerEvents: 'auto',
  } : undefined;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        'cursor-grab transition-all duration-150',
        isDragging && 'cursor-grabbing scale-105',
        className
      )}
    >
      {children}
    </div>
  );
}

interface DroppableProps {
  id: string;
  children: ReactNode;
  className?: string;
  data?: Record<string, unknown>;
}

export function Droppable({ id, children, className, data }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data,
  });
  
  return (
    <div
      ref={setNodeRef}
      className={clsx(
        className,
        'transition-colors duration-150',
        isOver && 'bg-blue-100 border-blue-300 border-2'
      )}
    >
      {children}
    </div>
  );
} 