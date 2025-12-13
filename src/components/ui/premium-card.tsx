"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  delay?: number;
}

export function PremiumCard({
  title,
  description,
  children,
  className,
  gradient = false,
  delay = 0,
}: PremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className={cn(
        "card-hover overflow-hidden relative",
        gradient && "glass-card",
        className
      )}>
        {gradient && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
        )}
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>
                {title}
              </CardTitle>
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
