"use client";

import { useState } from "react";
import { 
  StickyNote, 
  Plus, 
  Trash2, 
  Edit2,
  Save,
  X,
  Clock
} from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author?: {
    name: string;
    id: string;
  };
  pinned?: boolean;
}

interface DealNotesProps {
  dealId: string;
  initialNotes?: Note[];
  onNotesChange?: (notes: Note[]) => void;
  readOnly?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return date.toLocaleDateString();
}

export function DealNotes({ 
  // dealId will be used for API calls in production
  initialNotes = [], 
  onNotesChange,
  readOnly = false 
}: DealNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
      author: { name: "You", id: "current-user" }
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    setNewNote("");
    setIsAdding(false);
    onNotesChange?.(updatedNotes);
    toast.success("Note added");
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    onNotesChange?.(updatedNotes);
    toast.success("Note deleted");
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = (id: string) => {
    if (!editContent.trim()) return;

    const updatedNotes = notes.map(n => 
      n.id === id 
        ? { ...n, content: editContent.trim(), updatedAt: new Date().toISOString() }
        : n
    );
    setNotes(updatedNotes);
    setEditingId(null);
    setEditContent("");
    onNotesChange?.(updatedNotes);
    toast.success("Note updated");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const togglePin = (id: string) => {
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    // Sort pinned notes to top
    updatedNotes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    setNotes(updatedNotes);
    onNotesChange?.(updatedNotes);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" />
          Notes
          <Badge variant="secondary">{notes.length}</Badge>
        </CardTitle>
        {!readOnly && !isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add new note */}
        {isAdding && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
            <Textarea
              placeholder="Write your note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-24 resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsAdding(false);
                  setNewNote("");
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={addNote}
                disabled={!newNote.trim()}
              >
                <Save className="h-4 w-4 mr-1" />
                Save Note
              </Button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {notes.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No notes yet</p>
            <p className="text-sm">Add notes to keep track of important details</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div 
                key={note.id}
                className={cn(
                  "p-3 rounded-lg border bg-card",
                  note.pinned && "border-primary/50 bg-primary/5"
                )}
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-20 resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveEdit(note.id)}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(note.createdAt)}</span>
                        {note.updatedAt && (
                          <span className="italic">(edited)</span>
                        )}
                        {note.author && (
                          <>
                            <span>•</span>
                            <span>{note.author.name}</span>
                          </>
                        )}
                      </div>
                      {!readOnly && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => togglePin(note.id)}
                          >
                            <StickyNote className={cn(
                              "h-3 w-3",
                              note.pinned ? "text-primary fill-primary" : "text-muted-foreground"
                            )} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => startEdit(note)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simpler inline note input for quick notes
interface QuickNoteInputProps {
  onSubmit: (note: string) => void;
  placeholder?: string;
}

export function QuickNoteInput({ onSubmit, placeholder = "Add a quick note..." }: QuickNoteInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
    toast.success("Note added");
  };

  return (
    <div className="flex gap-2">
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-h-10 resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <Button 
        size="icon" 
        onClick={handleSubmit}
        disabled={!value.trim()}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
