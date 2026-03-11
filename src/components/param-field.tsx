"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobParameter } from "@/lib/jenkins-types";

interface ParamFieldProps {
  param: JobParameter;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}

const typeBadgeColors: Record<string, string> = {
  string: "bg-blue-600/20 text-blue-400",
  choice: "bg-purple-600/20 text-purple-400",
  boolean: "bg-teal-600/20 text-teal-400",
  password: "bg-red-600/20 text-red-400",
  text: "bg-cyan-600/20 text-cyan-400",
  file: "bg-orange-600/20 text-orange-400",
};

export function ParamField({ param, value, onChange }: ParamFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={param.name} className="text-sm font-medium">
          {param.name}
        </Label>
        <Badge variant="outline" className={typeBadgeColors[param.type] || ""}>
          {param.type}
        </Badge>
      </div>
      {param.description && (
        <p className="text-xs text-muted-foreground">{param.description}</p>
      )}
      {renderInput(param, value, onChange)}
    </div>
  );
}

function renderInput(
  param: JobParameter,
  value: string | boolean,
  onChange: (v: string | boolean) => void
) {
  switch (param.type) {
    case "choice":
      return (
        <Select
          value={String(value || "")}
          onValueChange={(v) => onChange(v ?? "")}
        >
          <SelectTrigger id={param.name}>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {param.choices?.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "boolean":
      return (
        <div className="flex items-center gap-2">
          <Switch
            id={param.name}
            checked={value === true || value === "true"}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <span className="text-sm text-muted-foreground">
            {value === true || value === "true" ? "true" : "false"}
          </span>
        </div>
      );

    case "password":
      return (
        <Input
          id={param.name}
          type="password"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${param.name}...`}
        />
      );

    case "text":
      return (
        <Textarea
          id={param.name}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${param.name}...`}
          rows={4}
        />
      );

    default:
      return (
        <Input
          id={param.name}
          type="text"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${param.name}...`}
        />
      );
  }
}
