'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target, Plus, Edit, Trash2, Trophy, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  type: 'deals' | 'revenue' | 'score' | 'conversions';
  target: number;
  current: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  createdAt: string;
}

interface GoalTrackerProps {
  goals: Goal[];
  onAddGoal?: (goal: Omit<Goal, 'id' | 'current' | 'createdAt'>) => void;
  onUpdateGoal?: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal?: (id: string) => void;
  dealStats?: {
    totalDeals: number;
    totalRevenue: number;
    avgScore: number;
    closedDeals: number;
  };
  className?: string;
}

const GOAL_TYPES = [
  { value: 'deals', label: 'Total Deals', unit: 'deals', icon: '📊' },
  { value: 'revenue', label: 'Revenue', unit: 'dollars', icon: '💰' },
  { value: 'score', label: 'Avg AI Score', unit: 'points', icon: '🎯' },
  { value: 'conversions', label: 'Closed Deals', unit: 'deals', icon: '✅' },
];

const PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export function GoalTracker({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  dealStats,
  className,
}: GoalTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    type: 'deals' as Goal['type'],
    target: 10,
    period: 'monthly' as Goal['period'],
  });

  // Calculate current values based on dealStats
  const getCurrentValue = (type: Goal['type']): number => {
    if (!dealStats) return 0;
    switch (type) {
      case 'deals':
        return dealStats.totalDeals;
      case 'revenue':
        return dealStats.totalRevenue;
      case 'score':
        return dealStats.avgScore;
      case 'conversions':
        return dealStats.closedDeals;
      default:
        return 0;
    }
  };

  const getProgress = (goal: Goal): number => {
    const current = dealStats ? getCurrentValue(goal.type) : goal.current;
    return Math.min((current / goal.target) * 100, 100);
  };

  const formatValue = (value: number, type: Goal['type']): string => {
    if (type === 'revenue') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value.toLocaleString()}`;
    }
    if (type === 'score') {
      return value.toFixed(0);
    }
    return value.toLocaleString();
  };

  const handleAddGoal = () => {
    if (!newGoal.name.trim()) {
      toast.error('Please enter a goal name');
      return;
    }
    if (newGoal.target <= 0) {
      toast.error('Target must be greater than 0');
      return;
    }

    onAddGoal?.(newGoal);
    toast.success('Goal created successfully');
    setIsOpen(false);
    setNewGoal({ name: '', type: 'deals', target: 10, period: 'monthly' });
  };

  const handleDeleteGoal = (id: string) => {
    onDeleteGoal?.(id);
    toast.success('Goal deleted');
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals & Targets
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
                <DialogDescription>
                  Set a target to track your deal performance.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    value={newGoal.name}
                    onChange={e => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Q1 Deal Target"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Goal Type</Label>
                    <Select
                      value={newGoal.type}
                      onValueChange={value => setNewGoal(prev => ({ ...prev, type: value as Goal['type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Period</Label>
                    <Select
                      value={newGoal.period}
                      onValueChange={value => setNewGoal(prev => ({ ...prev, period: value as Goal['period'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODS.map(period => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    value={newGoal.target}
                    onChange={e => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    {GOAL_TYPES.find(t => t.value === newGoal.type)?.unit}
                  </p>
                </div>

                <Button onClick={handleAddGoal} className="w-full">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-6">
            <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No goals set yet</p>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="mt-2">
              Add your first goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const progress = getProgress(goal);
              const current = dealStats ? getCurrentValue(goal.type) : goal.current;
              const isComplete = progress >= 100;
              const goalType = GOAL_TYPES.find(t => t.value === goal.type);

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{goalType?.icon}</span>
                      <span className="text-sm font-medium">{goal.name}</span>
                      {isComplete && <Trophy className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateGoal?.(goal.id, {})}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Progress
                    value={progress}
                    className={cn('h-2', isComplete && 'bg-green-100')}
                  />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {formatValue(current, goal.type)} / {formatValue(goal.target, goal.type)}
                    </span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={cn(
                        'h-3 w-3',
                        progress >= 50 ? 'text-green-500' : 'text-muted-foreground'
                      )} />
                      <span className={cn(
                        progress >= 100 ? 'text-green-600 font-medium' : 'text-muted-foreground'
                      )}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple goal progress bar for widgets
export function GoalProgressBar({
  label,
  current,
  target,
  type = 'deals',
}: {
  label: string;
  current: number;
  target: number;
  type?: Goal['type'];
}) {
  const progress = Math.min((current / target) * 100, 100);
  const isComplete = progress >= 100;

  const formatValue = (value: number): string => {
    if (type === 'revenue') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value}`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn(
          'text-xs',
          isComplete ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {formatValue(current)} / {formatValue(target)}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
