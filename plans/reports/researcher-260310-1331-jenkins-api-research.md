# Jenkins REST API Research Report

**Date:** 2026-03-10 | **Focus:** Webhook trigger management website

---

## 1. API Architecture

Jenkins REST API is available at `{baseUrl}/api/` with support for **JSON, XML, Python-compatible JSON**. All resources expose `/api/` endpoints.

```
GET {baseUrl}/api/json                    # List jobs & system info
GET {baseUrl}/job/{jobName}/api/json      # Job details & parameters
GET {baseUrl}/job/{jobName}/{buildNum}/api/json  # Build details & result
```

---

## 2. Build Triggering

### Without Parameters
```
POST {baseUrl}/job/{jobName}/build
Authorization: Basic {base64(user:apiToken)}
```

### With Parameters
```
POST {baseUrl}/job/{jobName}/buildWithParameters
--data id=123 --data verbosity=high
--form FILE=@/path/to/file
```

**Remote Token Method (backward compat):**
```
POST {baseUrl}/job/{jobName}/build?token={TOKEN}
Authorization: Basic {base64(user:apiToken)}
```

---

## 3. Discovering Job Parameters

**No dedicated parameter discovery endpoint.** Must parse job XML config:
```
GET {baseUrl}/job/{jobName}/config.xml
```
Returns `<parameterDefinitions>` section with all parameter types/defaults/choices.

**Via JSON API (limited):** `/api/json` includes some metadata but not complete parameter schema.

**Note:** Scripted pipelines may require one manual execution before parameters appear in Jenkins UI.

---

## 4. Build Progress & Console Output

### Get Build Status
```
GET {baseUrl}/job/{jobName}/{buildNum}/api/json
```
Returns: `result` (null=running, "SUCCESS", "FAILURE", "UNSTABLE", "ABORTED")

### Progressive Console Output (Recommended)
```
GET {baseUrl}/job/{jobName}/{buildNum}/logText/progressiveText?start={offset}
```
**Key advantage:** Stateless polling with `start` offset. Append new chunks without re-downloading entire log.

### Alternative: Full Log
```
GET {baseUrl}/job/{jobName}/{buildNum}/consoleText
```
Returns entire console as text (inefficient for long-running builds).

### Polling Strategy
- Poll every 2-5 seconds during active build
- Increment `start` offset for progressive fetches
- Build complete when `result` field is non-null in JSON response

---

## 5. Authentication

### Option A: API Token (RECOMMENDED)
1. User → Jenkins UI → "Configure" → Copy API token
2. Use HTTP BASIC auth: `Authorization: Basic {base64(username:apiToken)}`
3. **CSRF exempt** - no crumb required
4. Credential rotation: User can regenerate token anytime

### Option B: Username/Password (LEGACY)
1. GET `/crumbIssuer/api/json` with Basic auth
2. Response: `{"_class":"hudson.security.csrf.DefaultCrumbIssuer","crumb":"TOKEN","crumbRequestField":"Jenkins-Crumb"}`
3. Include `Jenkins-Crumb: TOKEN` + session cookie in POST requests
4. More complex, requires session management

### Key Requirement
**Jenkins requires preemptive authentication** - credentials must be in initial request (not 401 challenge-response). Use:
- curl: `-u user:token`
- Axios/fetch: Authorization header immediately

---

## 6. Security Considerations

- **API tokens are permanent** until regenerated - treat as secrets
- **Token scope:** Tied to user permissions (granular Jenkins ACLs apply)
- **CSRF disabled for API tokens** (Jenkins 2.96+)
- **Webhook tokens** (Generic Webhook Trigger plugin) allow anonymous triggering with URL token only
- **No built-in rate limiting** - implement client-side throttling

---

## 7. Gotchas & Limitations

| Issue | Impact | Workaround |
|-------|--------|-----------|
| No param schema endpoint | Must parse XML config | Cache job config, refresh on changes |
| No native webhook support | Need Generic Webhook Trigger plugin | Install plugin or use polling API |
| CSRF for password auth | Complicates scripting | Use API tokens (recommended) |
| No native auth on remote trigger | Token visible in URLs | Use Generic Webhook Trigger plugin instead |
| Build queue invisible via API | Can't detect queued builds | Poll `/queue/api/json` (if available) |
| Console log retention | Old logs may be archived | Check Jenkins `log-rotation` policy |
| No bulk operations | One call per job | Parallelize requests (respect rate limits) |

---

## 8. Recommended Web Dashboard Architecture

```
Frontend (React/Next.js)
  ↓ (HTTPS + API token in .env)
Backend (Node.js/Python)
  ├─ /api/jobs                 → List all + param schemas (cached)
  ├─ /api/jobs/{id}/trigger    → POST to Jenkins, return buildNum
  ├─ /api/builds/{buildNum}/status  → Poll /logText/progressiveText
  ├─ /api/builds/{buildNum}/logs    → Stream console output
  └─ /webhook/generic-trigger  → Receive Jenkins build completion
         ↓
      Jenkins Instance
```

**Key practices:**
- Cache job configs (refresh on webhook event or manual sync)
- Backend proxies Jenkins API (avoid CORS, protect token)
- Implement exponential backoff polling (aggressive → slow as build completes)
- Use WebSocket/Server-Sent Events for real-time updates
- Store build history in local DB for analytics

---

## Summary

Jenkins API is **stable & production-ready** for webhook dashboards. Use **API tokens for authentication** (avoids CSRF complexity). Job parameter discovery requires XML parsing. Build status polling via `/logText/progressiveText` is efficient. Generic Webhook Trigger plugin recommended for native webhook support vs. polling.

---

## Unresolved Questions

- Does your Jenkins instance have Generic Webhook Trigger plugin installed?
- Will dashboard support multiple Jenkins instances?
- Do you need real-time updates (WebSocket) or periodic polling is acceptable?
- Any job parameter types beyond String/Choice/Boolean/File?
