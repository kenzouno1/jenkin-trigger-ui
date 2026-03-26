import base64
import json
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from typing import Optional

from app.config import Settings


def _make_request(settings: Settings, path: str, method: str = "GET", data: Optional[bytes] = None, content_type: Optional[str] = None) -> urllib.request.Request:
    url = f"{settings.JENKINS_URL.rstrip('/')}{path}"
    req = urllib.request.Request(url, data=data, method=method)
    if settings.JENKINS_USER and settings.JENKINS_API_TOKEN:
        credentials = f"{settings.JENKINS_USER}:{settings.JENKINS_API_TOKEN}"
        encoded = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")
        req.add_header("Authorization", f"Basic {encoded}")
    if content_type:
        req.add_header("Content-Type", content_type)
    return req


def _jenkins_get_json(settings: Settings, path: str) -> dict:
    req = _make_request(settings, path)
    req.add_header("Accept", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Jenkins API error: {e.code} {e.reason}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"Jenkins connection error: {e.reason}") from e


def fetch_all_jenkins_jobs(settings: Settings) -> list[dict]:
    """Fetch all jobs from Jenkins API using Basic auth."""
    data = _jenkins_get_json(
        settings,
        "/api/json?tree=jobs[name,url,color,fullName,description,lastBuild[number,timestamp,duration,result]]",
    )
    return data.get("jobs", [])


def fetch_job_detail(settings: Settings, name: str) -> dict:
    """Fetch job detail including property definitions."""
    import urllib.parse
    encoded_name = urllib.parse.quote(name, safe="")
    return _jenkins_get_json(settings, f"/job/{encoded_name}/api/json")


def _map_param_type(jenkins_type: str) -> str:
    t = jenkins_type.lower()
    if "choice" in t:
        return "choice"
    if "boolean" in t:
        return "boolean"
    if "password" in t:
        return "password"
    if "text" in t:
        return "text"
    if "file" in t:
        return "file"
    return "string"


def extract_standard_params(detail: dict) -> list[dict]:
    """Extract standard Jenkins parameter definitions from job detail."""
    properties = detail.get("property", [])
    for prop in properties:
        param_defs = prop.get("parameterDefinitions", [])
        if param_defs:
            return [
                {
                    "name": pd["name"],
                    "type": _map_param_type(pd.get("type", "")),
                    "description": pd.get("description", ""),
                    "defaultValue": str(pd.get("defaultParameterValue", {}).get("value", "") or ""),
                    "choices": pd.get("choices"),
                }
                for pd in param_defs
            ]
    return []


def fetch_views(settings: Settings) -> list[dict]:
    """Fetch Jenkins views with their job names."""
    data = _jenkins_get_json(settings, "/api/json?tree=views[name,url,jobs[name]]")
    views = data.get("views", [])
    return [
        {"name": v.get("name", ""), "jobs": [j["name"] for j in v.get("jobs", []) if "name" in j]}
        for v in views
        if v.get("name") != "all" and v.get("name") != "All"
    ]


def fetch_queue(settings: Settings) -> list[dict]:
    """Fetch Jenkins build queue items."""
    data = _jenkins_get_json(
        settings,
        "/queue/api/json?tree=items[id,task[name,url,color],why,inQueueSince,stuck,blocked]",
    )
    return data.get("items", [])


def fetch_job_config_params(settings: Settings, name: str) -> dict:
    """Fetch config.xml and parse GWT (Generic Webhook Trigger) params."""
    import urllib.parse
    encoded_name = urllib.parse.quote(name, safe="")
    req = _make_request(settings, f"/job/{encoded_name}/config.xml")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            xml_text = resp.read().decode("utf-8")
    except (urllib.error.HTTPError, urllib.error.URLError):
        return {"params": [], "token": None, "is_gwt": False}

    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return {"params": [], "token": None, "is_gwt": False}

    ns_gwt = "org.jenkinsci.plugins.gwt.GenericTrigger"
    ns_var = "org.jenkinsci.plugins.gwt.GenericVariable"

    # Find triggers section (may be nested under triggers or properties)
    gwt_elem = None
    for triggers in root.iter("triggers"):
        gwt_elem = triggers.find(ns_gwt)
        if gwt_elem is not None:
            break

    if gwt_elem is None:
        return {"params": [], "token": None, "is_gwt": False}

    token_elem = gwt_elem.find("token")
    token = token_elem.text if token_elem is not None else None

    params = []
    generic_vars = gwt_elem.find("genericVariables")
    if generic_vars is not None:
        for var in generic_vars.findall(ns_var):
            key_elem = var.find("key")
            value_elem = var.find("value")
            default_elem = var.find("defaultValue")
            if key_elem is not None:
                params.append({
                    "name": key_elem.text or "",
                    "type": "string",
                    "description": f"JSONPath: {value_elem.text or ''}",
                    "defaultValue": default_elem.text or "" if default_elem is not None else "",
                })

    return {"params": params, "token": token, "is_gwt": True}
