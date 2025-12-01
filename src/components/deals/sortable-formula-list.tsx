"use client";

import { ReactNode, useSyncExternalStore } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// Hook to detect if we're on the client (prevents hydration mismatch)
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface SortableItemWrapperProps {
  id: string;
  children: ReactNode;
}

function SortableItemWrapper({ id, children }: SortableItemWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "z-50 opacity-90"
      )}
    >
      {/* Drag Handle - positioned inside the card on the left */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-2 top-2 z-10",
          "p-1 rounded-md cursor-grab active:cursor-grabbing",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "bg-slate-700/80 hover:bg-slate-600 text-slate-400 hover:text-white",
          "focus:outline-none focus:ring-2 focus:ring-blue-500"
        )}
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

interface SortableFormulaListProps {
  items: string[];
  onReorder: (items: string[]) => void;
  children: (id: string) => ReactNode;
}

export function SortableFormulaList({ items, onReorder, children }: SortableFormulaListProps) {
  // Prevent hydration mismatch by only rendering DnD on client
  const isClient = useIsClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item === active.id);
      const newIndex = items.findIndex((item) => item === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  // Render without DnD on server to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="space-y-6">
        {items.map((id) => (
          <div key={id}>
            {children(id)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {items.map((id) => (
            <SortableItemWrapper key={id} id={id}>
              {children(id)}
            </SortableItemWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
