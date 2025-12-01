"use client"

import * as React from "react"
import { GripVertical, X, Plus, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Widget {
  id: string
  type: string
  title: string
  size: "small" | "medium" | "large" | "full"
  order: number
  visible: boolean
}

interface WidgetGridProps {
  widgets: Widget[]
  onWidgetsChange: (widgets: Widget[]) => void
  renderWidget: (widget: Widget) => React.ReactNode
  availableWidgets?: { type: string; title: string; defaultSize: Widget["size"] }[]
  className?: string
  editable?: boolean
}

const sizeClasses = {
  small: "col-span-1",
  medium: "col-span-1 md:col-span-2",
  large: "col-span-1 md:col-span-2 lg:col-span-3",
  full: "col-span-full",
}

export function WidgetGrid({
  widgets,
  onWidgetsChange,
  renderWidget,
  availableWidgets = [],
  className,
  editable = true,
}: WidgetGridProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [draggedWidget, setDraggedWidget] = React.useState<string | null>(null)

  const visibleWidgets = widgets
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order)

  const hiddenWidgets = widgets.filter(w => !w.visible)

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedWidget || draggedWidget === targetId) return

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget)
    const targetIndex = widgets.findIndex(w => w.id === targetId)

    const newWidgets = [...widgets]
    const [removed] = newWidgets.splice(draggedIndex, 1)
    newWidgets.splice(targetIndex, 0, removed)

    // Update order values
    const updatedWidgets = newWidgets.map((w, i) => ({ ...w, order: i }))
    onWidgetsChange(updatedWidgets)
    setDraggedWidget(null)
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    )
    onWidgetsChange(updatedWidgets)
  }

  const changeWidgetSize = (widgetId: string, size: Widget["size"]) => {
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, size } : w
    )
    onWidgetsChange(updatedWidgets)
  }

  const addWidget = React.useCallback((type: string) => {
    const template = availableWidgets.find(w => w.type === type)
    if (!template) return

    const newWidget: Widget = {
      id: `${type}-${crypto.randomUUID()}`,
      type: template.type,
      title: template.title,
      size: template.defaultSize,
      order: widgets.length,
      visible: true,
    }
    onWidgetsChange([...widgets, newWidget])
  }, [availableWidgets, widgets, onWidgetsChange])

  const removeWidget = React.useCallback((widgetId: string) => {
    onWidgetsChange(widgets.filter(w => w.id !== widgetId))
  }, [widgets, onWidgetsChange])

  // Use removeWidget in UI if needed
  void removeWidget

  return (
    <div className={className}>
      {/* Toolbar */}
      {editable && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isEditing && hiddenWidgets.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Show Widget
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {hiddenWidgets.map(widget => (
                    <DropdownMenuItem
                      key={widget.id}
                      onClick={() => toggleWidgetVisibility(widget.id)}
                    >
                      {widget.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isEditing && availableWidgets.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Widget
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availableWidgets.map(widget => (
                    <DropdownMenuItem
                      key={widget.type}
                      onClick={() => addWidget(widget.type)}
                    >
                      {widget.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <Button
            variant={isEditing ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings2 className="h-4 w-4 mr-1" />
            {isEditing ? "Done" : "Customize"}
          </Button>
        </div>
      )}

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleWidgets.map(widget => (
          <div
            key={widget.id}
            draggable={isEditing}
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, widget.id)}
            className={cn(
              sizeClasses[widget.size],
              "relative rounded-lg border bg-card transition-all",
              isEditing && "ring-2 ring-dashed ring-muted-foreground/20",
              draggedWidget === widget.id && "opacity-50"
            )}
          >
            {/* Edit Controls */}
            {isEditing && (
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Settings2 className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => changeWidgetSize(widget.id, "small")}>
                      Small
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeWidgetSize(widget.id, "medium")}>
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeWidgetSize(widget.id, "large")}>
                      Large
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeWidgetSize(widget.id, "full")}>
                      Full Width
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => toggleWidgetVisibility(widget.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Drag Handle */}
            {isEditing && (
              <div className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            {/* Widget Content */}
            <div className={cn(isEditing && "pointer-events-none")}>
              {renderWidget(widget)}
            </div>
          </div>
        ))}
      </div>

      {visibleWidgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-2">No widgets visible</p>
          {isEditing && hiddenWidgets.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Click &quot;Show Widget&quot; to add widgets back
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Hook for persisting widget configuration
export function useWidgetConfig(key: string, defaultWidgets: Widget[]) {
  const [widgets, setWidgets] = React.useState<Widget[]>(defaultWidgets)
  const [loaded, setLoaded] = React.useState(false)

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        setWidgets(JSON.parse(saved))
      } catch {
        // Invalid JSON, use defaults
      }
    }
    setLoaded(true)
  }, [key])

  // Save to localStorage on change
  React.useEffect(() => {
    if (loaded) {
      localStorage.setItem(key, JSON.stringify(widgets))
    }
  }, [key, widgets, loaded])

  return [widgets, setWidgets] as const
}
