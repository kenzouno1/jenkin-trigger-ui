import json
import logging
import urllib.error
import urllib.parse
import urllib.request
from typing import Optional

logger = logging.getLogger(__name__)

from app.config import Settings
from app.services.jenkins_service import _make_request


def fetch_builds_history(settings: Settings, name: str, limit: int = 20) -> list[dict]:
    """Fetch recent builds list for a job."""
    from app.services.jenkins_service import _jenkins_get_json
    encoded_name = urllib.parse.quote(name, safe="")
    path = (
        f"/job/{encoded_name}/api/json"
        f"?tree=builds[number,url,result,building,timestamp,duration,"
        f"estimatedDuration,displayName,fullDisplayName]{{0,{limit}}}"
    )
    data = _jenkins_get_json(settings, path)
    return data.get("builds", [])


def fetch_build_info(settings: Settings, name: str, number: int) -> dict:
    """Fetch a single build's info."""
    from app.services.jenkins_service import _jenkins_get_json
    encoded_name = urllib.parse.quote(name, safe="")
    return _jenkins_get_json(settings, f"/job/{encoded_name}/{number}/api/json")


def fetch_console_output(settings: Settings, name: str, number: int, start: int = 0) -> dict:
    """Fetch progressive console text output for a build."""
    encoded_name = urllib.parse.quote(name, safe="")
    path = f"/job/{encoded_name}/{number}/logText/progressiveText?start={start}"
    req = _make_request(settings, path)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            text = resp.read().decode("utf-8")
            new_offset = int(resp.headers.get("X-Text-Size", "0") or "0")
            has_more = resp.headers.get("X-More-Data", "false").lower() == "true"
            return {"text": text, "offset": new_offset, "hasMore": has_more}
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Console fetch error: {e.code} {e.reason}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"Console connection error: {e.reason}") from e


def fetch_running_builds(settings: Settings, job_names: list[str]) -> list[dict]:
    """Fetch build info for currently running jobs."""
    from app.services.jenkins_service import _jenkins_get_json
    results = []
    for name in job_names:
        try:
            encoded_name = urllib.parse.quote(name, safe="")
            data = _jenkins_get_json(
                settings,
                f"/job/{encoded_name}/lastBuild/api/json"
                f"?tree=number,url,result,building,timestamp,duration,estimatedDuration,displayName,fullDisplayName",
            )
            if data.get("building"):
                data["jobName"] = name
                results.append(data)
        except RuntimeError as e:
            logger.warning("Failed to fetch running build for %s: %s", name, e)
            continue
    return results


def trigger_build(
    settings: Settings,
    name: str,
    params: Optional[dict] = None,
    gwt_token: Optional[str] = None,
) -> dict:
    """Trigger a Jenkins build. Supports GWT webhook and standard triggers."""
    encoded_name = urllib.parse.quote(name, safe="")

    if gwt_token:
        encoded_token = urllib.parse.quote(gwt_token, safe="")
        path = f"/generic-webhook-trigger/invoke?token={encoded_token}"
        body = json.dumps(params or {}).encode("utf-8")
        req = _make_request(settings, path, method="POST", data=body, content_type="application/json")
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                location = resp.headers.get("Location")
                return {"queueUrl": location}
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"GWT trigger failed {e.code}: {e.reason}") from e
        except urllib.error.URLError as e:
            raise RuntimeError(f"GWT trigger connection error: {e.reason}") from e

    # Standard Jenkins trigger
    has_params = bool(params)
    endpoint = "buildWithParameters" if has_params else "build"
    path = f"/job/{encoded_name}/{endpoint}"

    if has_params:
        body = urllib.parse.urlencode(params).encode("utf-8")
        req = _make_request(settings, path, method="POST", data=body, content_type="application/x-www-form-urlencoded")
    else:
        req = _make_request(settings, path, method="POST", data=b"", content_type="application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            location = resp.headers.get("Location")
            return {"queueUrl": location}
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Trigger failed {e.code}: {e.reason}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"Trigger connection error: {e.reason}") from e
