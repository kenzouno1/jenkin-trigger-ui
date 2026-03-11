"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ParamField } from "./param-field";
import { useJobDetail, useTriggerBuild } from "@/hooks/use-jobs";
import { Loader2, Play, AlertCircle, Zap } from "lucide-react";

interface TriggerModalProps {
  jobName: string | null;
  open: boolean;
  onClose: () => void;
  onTriggered?: (jobName: string) => void;
}

export function TriggerModal({
  jobName,
  open,
  onClose,
  onTriggered,
}: TriggerModalProps) {
  const { data: detail, isLoading } = useJobDetail(open ? jobName : null);
  const trigger = useTriggerBuild();
  const [values, setValues] = useState<Record<string, string | boolean>>({});

  // Initialize default values when params load
  useEffect(() => {
    if (detail?.parameters) {
      const defaults: Record<string, string | boolean> = {};
      detail.parameters.forEach((p) => {
        defaults[p.name] = p.defaultValue;
      });
      setValues(defaults);
    }
  }, [detail?.parameters]);

  const handleSubmit = async () => {
    if (!jobName) return;
    // Convert all values to strings for Jenkins API
    const params: Record<string, string> = {};
    Object.entries(values).forEach(([k, v]) => {
      params[k] = String(v);
    });
    try {
      await trigger.mutateAsync({
        name: jobName,
        parameters: detail?.parameters?.length ? params : undefined,
      });
      onTriggered?.(jobName);
      onClose();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Trigger: {jobName}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {detail && (
          <>
            {detail.isGwt && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <Zap className="h-3 w-3" />
                Generic Webhook Trigger
              </div>
            )}
            {detail.description && (
              <p className="text-sm text-muted-foreground">
                {detail.description}
              </p>
            )}

            {detail.parameters?.length ? (
              <ScrollArea className="max-h-[50vh]">
                <div className="space-y-4 pr-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Parameters</span>
                    <Separator className="flex-1" />
                  </div>
                  {detail.parameters.map((p) => (
                    <ParamField
                      key={p.name}
                      param={p}
                      value={values[p.name] ?? p.defaultValue}
                      onChange={(v) =>
                        setValues((prev) => ({ ...prev, [p.name]: v }))
                      }
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                This job has no parameters.
              </p>
            )}
          </>
        )}

        {trigger.isError && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            {trigger.error?.message || "Build trigger failed"}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || trigger.isPending}
          >
            {trigger.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Trigger Build
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
