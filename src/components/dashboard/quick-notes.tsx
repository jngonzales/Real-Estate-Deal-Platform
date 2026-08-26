'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Save, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface QuickNotesProps {
  notes?: Note[];
  onSaveNote?: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateNote?: (id: string, content: string) => Promise<void>;
  onDeleteNote?: (id: string) => Promise<void>;
  className?: string;
}

const NOTE_COLORS = [
  { name: 'Amber', value: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700' },
  { name: 'Emerald', value: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' },
  { name: 'Green', value: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' },
  { name: 'Gray', value: 'bg-muted dark:bg-secondary border-border dark:border-border' },
];

const LOCAL_STORAGE_KEY = 'dealflow-quick-notes';

export function QuickNotes({
  notes: propNotes,
  onSaveNote,
  onUpdateNote,
  onDeleteNote,
  className,
}: QuickNotesProps) {
  // Initialize notes from localStorage or props
  const [notes, setNotes] = useState<Note[]>(() => {
    if (propNotes) return propNotes;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState(NOTE_COLORS[0].value);

  // Use prop notes if provided, otherwise use local state
  const displayNotes = propNotes || notes;

  // Save to localStorage when no callbacks provided
  const saveToLocal = (updatedNotes: Note[]) => {
    if (!onSaveNote && !onUpdateNote && !onDeleteNote) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedNotes));
    }
  };

  const handleCreateNote = async () => {
    if (!newContent.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      content: newContent.trim(),
      color: newColor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (onSaveNote) {
      try {
        await onSaveNote({ content: newNote.content, color: newNote.color });
        toast.success('Note saved');
      } catch {
        toast.error('Failed to save note');
        return;
      }
    } else {
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      saveToLocal(updatedNotes);
      toast.success('Note saved');
    }

    setNewContent('');
    setIsCreating(false);
  };

  const handleUpdateNote = async (id: string) => {
    if (!editContent.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    if (onUpdateNote) {
      try {
        await onUpdateNote(id, editContent.trim());
        toast.success('Note updated');
      } catch {
        toast.error('Failed to update note');
        return;
      }
    } else {
      const updatedNotes = notes.map((note) =>
        note.id === id
          ? { ...note, content: editContent.trim(), updated_at: new Date().toISOString() }
          : note
      );
      setNotes(updatedNotes);
      saveToLocal(updatedNotes);
      toast.success('Note updated');
    }

    setEditingId(null);
    setEditContent('');
  };

  const handleDeleteNote = async (id: string) => {
    if (onDeleteNote) {
      try {
        await onDeleteNote(id);
        toast.success('Note deleted');
      } catch {
        toast.error('Failed to delete note');
        return;
      }
    } else {
      const updatedNotes = notes.filter((note) => note.id !== id);
      setNotes(updatedNotes);
      saveToLocal(updatedNotes);
      toast.success('Note deleted');
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Quick Notes
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Create New Note */}
        {isCreating && (
          <div className={cn('p-3 rounded-lg border', newColor)}>
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-20 bg-transparent border-none resize-none focus-visible:ring-0 p-0"
              autoFocus
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
              <div className="flex gap-1">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    className={cn(
                      'w-5 h-5 rounded-full border-2',
                      color.value.split(' ')[0],
                      newColor === color.value
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''
                    )}
                    onClick={() => setNewColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false);
                    setNewContent('');
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreateNote}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        {displayNotes.length === 0 && !isCreating ? (
          <div className="text-center py-6">
            <StickyNote className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No notes yet</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsCreating(true)}
            >
              Add your first note
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {displayNotes.map((note) => (
              <div
                key={note.id}
                className={cn('p-3 rounded-lg border transition-colors', note.color)}
              >
                {editingId === note.id ? (
                  <>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] bg-transparent border-none resize-none focus-visible:ring-0 p-0"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1 mt-2 pt-2 border-t border-current/10">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateNote(note.id)}
                      >
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <div
                    className="group cursor-pointer"
                    onClick={() => startEditing(note)}
                  >
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
