/**
 * SectionCommentButton
 *
 * Floating comment button for each examination section (E1-E10).
 * Opens a popover with a textarea bound to e11.<sectionId> in the form.
 */

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MessageSquare } from "lucide-react";
import type { FieldPath } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";

interface SectionCommentButtonProps {
  sectionId: string;
}

export function SectionCommentButton({ sectionId }: SectionCommentButtonProps) {
  const { register, watch } = useFormContext<FormValues>();
  const fieldPath = `e11.${sectionId}` as FieldPath<FormValues>;

  // Watch comment value to show indicator dot
  const value = watch(fieldPath) as unknown as string | null;
  const hasComment = typeof value === "string" && value.trim().length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageSquare className="h-4 w-4" />
          {hasComment && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-2">
          <p className="text-sm font-medium">Kommentar</p>
          <Textarea
            {...register(fieldPath as never)}
            placeholder="Kommentar hinzufügen..."
            rows={4}
            className="resize-y"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
