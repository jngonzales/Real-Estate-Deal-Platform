"use client";

import { useState } from "react";
import { 
  Star, 
  Tags, 
  Plus, 
  X,
  Bookmark,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DealTagsProps {
  dealId: string;
  initialTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  readOnly?: boolean;
}

const SUGGESTED_TAGS = [
  "Hot Deal",
  "Follow Up",
  "Needs Review",
  "High ROI",
  "Cash Buyer",
  "Flip Potential",
  "Rental",
  "Wholesale",
  "Distressed",
  "Off Market",
  "Motivated Seller",
  "Bank Owned",
];

const TAG_COLORS: Record<string, string> = {
  "Hot Deal": "bg-red-500/20 text-red-500 border-red-500/30",
  "Follow Up": "bg-amber-500/20 text-amber-500 border-amber-500/30",
  "Needs Review": "bg-amber-500/20 text-amber-500 border-amber-500/30",
  "High ROI": "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  "Cash Buyer": "bg-primary/15 text-emerald-500 border-primary/25",
  "Flip Potential": "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  "Rental": "bg-muted text-muted-foreground border-border/30",
  "Wholesale": "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  "Distressed": "bg-amber-500/20 text-amber-500 border-amber-500/30",
  "Off Market": "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  "Motivated Seller": "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  "Bank Owned": "bg-muted text-muted-foreground border-border/30",
};

export function DealTags({ 
  // dealId will be used for API calls in production
  initialTags = [], 
  onTagsChange,
  readOnly = false 
}: DealTagsProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag || tags.includes(trimmedTag)) return;
    
    const newTags = [...tags, trimmedTag];
    setTags(newTags);
    setNewTag("");
    onTagsChange?.(newTags);
    
    // In a real app, save to database here
    toast.success(`Tag "${trimmedTag}" added`);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    onTagsChange?.(newTags);
    toast.success(`Tag "${tagToRemove}" removed`);
  };

  const getTagColor = (tag: string) => {
    return TAG_COLORS[tag] || "bg-primary/20 text-primary border-primary/30";
  };

  if (readOnly) {
    return (
      <div className="flex flex-wrap gap-1">
        {tags.length === 0 ? (
          <span className="text-sm text-muted-foreground">No tags</span>
        ) : (
          tags.map(tag => (
            <Badge 
              key={tag} 
              variant="outline"
              className={cn("text-xs", getTagColor(tag))}
            >
              {tag}
            </Badge>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tags.map(tag => (
        <Badge 
          key={tag} 
          variant="outline"
          className={cn("text-xs group cursor-pointer", getTagColor(tag))}
          onClick={() => removeTag(tag)}
        >
          {tag}
          <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Badge>
      ))}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <Plus className="h-3 w-3 mr-1" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="New tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(newTag);
                  }
                }}
                className="h-8 text-sm"
              />
              <Button 
                size="sm" 
                className="h-8"
                onClick={() => addTag(newTag)}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </div>
            
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-2">Suggested Tags</p>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className={cn("text-xs cursor-pointer hover:opacity-80", getTagColor(tag))}
                    onClick={() => addTag(tag)}
                  >
                    <Plus className="h-2 w-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Favorite/Bookmark button component
interface FavoriteButtonProps {
  dealId: string;
  initialFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({ 
  // dealId will be used for API calls in production
  initialFavorited = false, 
  onFavoriteChange,
  size = "md"
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  const toggleFavorite = () => {
    const newState = !isFavorited;
    setIsFavorited(newState);
    onFavoriteChange?.(newState);
    
    // In a real app, save to database here
    toast.success(newState ? "Added to favorites" : "Removed from favorites");
  };

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={sizeClasses[size]}
      onClick={toggleFavorite}
    >
      <Star 
        className={cn(
          iconSizes[size],
          "transition-all",
          isFavorited 
            ? "fill-yellow-500 text-yellow-500" 
            : "text-muted-foreground hover:text-yellow-500"
        )} 
      />
    </Button>
  );
}

// Bookmark button component
interface BookmarkButtonProps {
  dealId: string;
  initialBookmarked?: boolean;
  onBookmarkChange?: (isBookmarked: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export function BookmarkButton({ 
  // dealId will be used for API calls in production
  initialBookmarked = false, 
  onBookmarkChange,
  size = "md"
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const toggleBookmark = () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    onBookmarkChange?.(newState);
    
    toast.success(newState ? "Bookmarked for later" : "Bookmark removed");
  };

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={sizeClasses[size]}
      onClick={toggleBookmark}
    >
      <Bookmark 
        className={cn(
          iconSizes[size],
          "transition-all",
          isBookmarked 
            ? "fill-primary text-primary" 
            : "text-muted-foreground hover:text-primary"
        )} 
      />
    </Button>
  );
}

// Tag filter component for filtering deals by tags
interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ availableTags, selectedTags, onTagsChange }: TagFilterProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Filter className="h-3 w-3 mr-2" />
          Tags
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              {selectedTags.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Filter by Tags
          </p>
          <div className="flex flex-wrap gap-1 pt-2">
            {availableTags.map(tag => (
              <Badge 
                key={tag} 
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={cn(
                  "text-xs cursor-pointer",
                  selectedTags.includes(tag) && "bg-primary"
                )}
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <X className="h-2 w-2 ml-1" />
                )}
              </Badge>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => onTagsChange([])}
            >
              Clear All
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
