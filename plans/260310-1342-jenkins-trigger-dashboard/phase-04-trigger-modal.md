# Phase 4: Trigger Modal

## Context
- [Plan overview](plan.md) | [Phase 2](phase-02-jenkins-api-layer.md)
- [Wireframe](../../docs/wireframes/index.html) — Trigger Modal section (lines 614-761)
- [Design Guidelines](../../docs/design-guidelines.md) — Trigger Parameter Form section

## Overview
- **Priority:** P2
- **Status:** pending
- **Description:** Swagger-inspired parameter form modal. Auto-generates input fields from Jenkins job config.xml. Supports string, choice, boolean, password, and file param types.

## Key Insights
- Modal opens from any trigger button (job card, favorites, dashboard)
- Parameters fetched dynamically via GET `/api/jenkins/jobs/[name]` (includes parsed config.xml)
- Each param rendered in a bordered card: header (name + type badge + required marker) + body (description + input)
- Type badges have distinct colors: string=blue, choice=purple, boolean=emerald, password=red, file=orange
- Submit calls POST `/api/jenkins/jobs/[name]/build` with param values
- After trigger: show success toast, optionally navigate to build monitor

## Requirements
### Functional
- Modal opens with job name, fetches params from API
- Auto-generates correct input type per parameter type
- Pre-fills default values from Jenkins config
- Validates required fields before submission
- Submit triggers build, shows loading state, handles success/error
- Info banner showing param count

### Non-Functional
- Modal uses shadcn/ui Dialog component
- Keyboard accessible (Escape closes, Tab navigates fields)
- Scroll overflow for many parameters
- Mobile-friendly (full-screen on small viewports)

## Related Code Files
### Create
- `src/components/trigger-modal.tsx` — Modal container, fetch params, submit logic
- `src/components/param-field.tsx` — Renders single param (type-specific input)
- `src/components/param-field-string.tsx` — Text input for string params
- `src/components/param-field-choice.tsx` — Select dropdown for choice params
- `src/components/param-field-boolean.tsx` — Checkbox for boolean params
- `src/components/param-field-password.tsx` — Password input with show/hide toggle
- `src/components/param-field-file.tsx` — File upload with drag-and-drop area
- `src/hooks/use-job-params.ts` — TanStack Query hook for job detail + params
- `src/hooks/use-trigger-build.ts` — TanStack mutation hook for triggering builds

## Implementation Steps

### 1. Create use-job-params hook
```tsx
export function useJobParams(jobName: string | null) {
  return useQuery({
    queryKey: ['jenkins', 'job', jobName],
    queryFn: () => fetch(`/api/jenkins/jobs/${jobName}`).then(r => r.json()),
    enabled: !!jobName, // Only fetch when modal is open
  });
}
```

### 2. Create use-trigger-build hook
```tsx
export function useTriggerBuild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, params }: { name: string; params: Record<string, string | boolean> }) =>
      fetch(`/api/jenkins/jobs/${name}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params }),
      }).then(r => { if (!r.ok) throw new Error('Build trigger failed'); return r.json(); }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jenkins', 'jobs'] });
    },
  });
}
```

### 3. Create param-field.tsx (router component)
```tsx
interface ParamFieldProps {
  param: JenkinsParam;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}
```
Switch on `param.type` to render correct sub-component. Each param wrapped in bordered card:
- Header: name (mono font, semibold) + type badge (colored per type) + required asterisk
- Body: description (muted xs text) + input + default value hint

### 4. Type badge colors (per wireframe)
| Type | BG | Text | Border |
|------|-----|------|--------|
| string | blue-500/10 | blue-400 | blue-500/20 |
| choice | purple-500/10 | purple-400 | purple-500/20 |
| boolean | emerald-500/10 | emerald-400 | emerald-500/20 |
| password | red-500/10 | red-400 | red-500/20 |
| file | orange-500/10 | orange-400 | orange-500/20 |

### 5. Implement param-field-string.tsx
- Text input with mono font
- Pre-filled with `param.defaultValue`
- Show "Default: {value}" hint below input

### 6. Implement param-field-choice.tsx
- Select dropdown using shadcn Select component
- Options from `param.choices[]`
- Default selected = `param.defaultValue`

### 7. Implement param-field-boolean.tsx
- Checkbox with label "Enable {param name in human form}"
- Default checked = `param.defaultValue === true`
- Show "Default: true/false" hint

### 8. Implement param-field-password.tsx
- Password input with show/hide toggle button (eye icon)
- Pre-filled if default exists (usually empty for passwords)

### 9. Implement param-field-file.tsx
- Dashed border drop zone with upload icon
- Click to browse, drag and drop support
- Show file name after selection
- Note: File params use multipart form data — need special handling in API route

### 10. Create trigger-modal.tsx
Structure matching wireframe:
```
Dialog
  DialogContent (max-w-[640px], max-h-[85vh])
    DialogHeader
      "Trigger Build" title (mono bold)
      "{jobName} — Configure parameters and start build" subtitle
    DialogBody (scrollable)
      Info banner: "This job has N parameters..."
      ParamField[] — mapped from params array
    DialogFooter
      "* Required fields" hint (left)
      Cancel button + "Build Now" button with play icon (right)
```

**State management:**
```tsx
const [values, setValues] = useState<Record<string, string | boolean>>({});
// Initialize from param defaults when params load
useEffect(() => {
  if (params) {
    const defaults = Object.fromEntries(params.map(p => [p.name, p.defaultValue]));
    setValues(defaults);
  }
}, [params]);
```

### 11. Handle submission
- Validate required fields (non-empty strings)
- Show validation errors inline
- Call `triggerBuild.mutate()` with values
- Loading state on Build Now button (spinner)
- On success: close modal, show toast notification, optionally redirect to monitor
- On error: show error message in modal

### 12. Wire trigger modal to job cards
- Create a context or state at page level for controlling which job's modal is open
- `const [triggerJobName, setTriggerJobName] = useState<string | null>(null)`
- Pass `onTrigger={() => setTriggerJobName(job.name)}` to job cards/favorites

## Todo
- [ ] Create use-job-params.ts hook
- [ ] Create use-trigger-build.ts hook
- [ ] Create param-field.tsx (router)
- [ ] Create param-field-string.tsx
- [ ] Create param-field-choice.tsx
- [ ] Create param-field-boolean.tsx
- [ ] Create param-field-password.tsx
- [ ] Create param-field-file.tsx
- [ ] Create trigger-modal.tsx
- [ ] Wire modal to job cards + favorites + dashboard
- [ ] Add form validation (required fields)
- [ ] Add loading/error states
- [ ] Test with jobs that have 0, 1, and many parameters
- [ ] Test each parameter type renders correctly

## Success Criteria
- Modal opens showing correct params for selected job
- Default values pre-filled
- All 5 param types render correctly
- Required field validation prevents empty submission
- Build triggers successfully, returns queue ID
- Modal shows loading during submission
- Success/error feedback visible to user

## Risk Assessment
- **File upload:** Jenkins file params require multipart/form-data. This is uncommon; implement basic support but don't over-engineer. If file params are rare, show a "not supported in UI" message as fallback.
- **Jobs with 0 params:** Should show "No parameters" message and still allow triggering (parameterless builds).
- **Large param count:** Wireframe scrolls; shadcn Dialog ScrollArea handles this.

## Security Considerations
- Password params: never log values, use `type="password"` input
- File params: validate file size limits client-side

## Next Steps
- Phase 5: Build Monitor (monitor builds triggered from this modal)
