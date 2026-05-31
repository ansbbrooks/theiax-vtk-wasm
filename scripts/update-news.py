#!/usr/bin/env python3
"""Update docs/news.md with new VTK WASM release entries.

Queries the GitLab package registry (project ID 13) for new VTK WASM packages
and prepends formatted release entries to docs/news.md.

Usage:
    python scripts/update-news.py [--dry-run] [--since YYYY-MM-DD]
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent
NEWS_PATH = REPO_ROOT / "docs" / "news.md"
GITLAB_HOST = "gitlab.kitware.com"
PROJECT_ID = 13

# Package name contains the arch: vtk-wasm32-emscripten or vtk-wasm64-emscripten
WASM_PKG_NAME_RE = re.compile(r"^vtk-(wasm(?:32|64))-emscripten$")

# Version patterns
DAILY_VER_RE = re.compile(r"^\d+\.\d+\.\d{8}$")  # e.g. 9.6.20260524
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+$")        # e.g. 9.6.1

# ---------------------------------------------------------------------------
# A. Parse current news.md state
# ---------------------------------------------------------------------------

# Matches both daily (9.5.20251004) and semver (9.6.1) release headings
_RELEASE_HEADING_RE = re.compile(r"^(\d+\.\d+\.\d+) is now available!$")
_FEATURE_DATE_RE = re.compile(r"^__([A-Z][a-z]+ \d+, \d{4})__$", re.MULTILINE)
_HEADING_RE = re.compile(r"^## (.+)$", re.MULTILINE)
_VERSION_DATE_RE = re.compile(
    r"^## (?:\d+\.\d+\.(\d{4})(\d{2})(\d{2}) is now available!)", re.MULTILINE
)


def parse_most_recent_date(news_path: Path) -> datetime:
    """Return the most recent date referenced in news.md."""
    text = news_path.read_text(encoding="utf-8")
    dates = []

    for m in _VERSION_DATE_RE.finditer(text):
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        dates.append(datetime(y, mo, d, tzinfo=timezone.utc))

    for m in _FEATURE_DATE_RE.finditer(text):
        try:
            dt = datetime.strptime(m.group(1), "%B %d, %Y").replace(tzinfo=timezone.utc)
            dates.append(dt)
        except ValueError:
            pass

    if not dates:
        raise ValueError(f"Could not find any dates in {news_path}")

    return max(dates)


def get_existing_release_versions(news_path: Path) -> set:
    """Return set of version strings already present in news.md."""
    text = news_path.read_text(encoding="utf-8")
    versions = set()
    for m in _HEADING_RE.finditer(text):
        rm = _RELEASE_HEADING_RE.match(m.group(1).strip())
        if rm:
            versions.add(rm.group(1))
    return versions


# ---------------------------------------------------------------------------
# B. GitLab API layer
# ---------------------------------------------------------------------------

def _get_token() -> str | None:
    """Read GitLab token from environment variables."""
    import os
    for var in ("GITLAB_TOKEN", "GL_TOKEN", "PRIVATE_TOKEN"):
        val = os.environ.get(var)
        if val:
            return val
    return None


def _api_call_glab(endpoint: str) -> list | dict:
    """Call GitLab API via glab CLI with automatic pagination."""
    result = subprocess.run(
        ["glab", "api", "--hostname", GITLAB_HOST, "--paginate", endpoint],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(result.stdout)


def _api_call_urllib(endpoint: str, token: str | None) -> list | dict:
    """Call GitLab API via urllib with manual pagination."""
    results = []
    page = 1
    while True:
        sep = "&" if "?" in endpoint else "?"
        url = f"https://{GITLAB_HOST}/api/v4/{endpoint}{sep}page={page}&per_page=100"
        req = urllib.request.Request(url)
        if token:
            req.add_header("PRIVATE-TOKEN", token)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            if isinstance(data, list):
                results.extend(data)
                next_page = resp.headers.get("X-Next-Page", "")
                if not next_page or not data:
                    break
                page = int(next_page)
            else:
                return data
    return results


def _api_call_curl(endpoint: str, token: str | None) -> list | dict:
    """Call GitLab API via curl subprocess (last resort fallback)."""
    url = f"https://{GITLAB_HOST}/api/v4/{endpoint}"
    cmd = ["curl", "-s", "--fail"]
    if token:
        cmd += ["-H", f"PRIVATE-TOKEN: {token}"]
    cmd.append(url)
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def api_call(endpoint: str) -> list | dict:
    """Dispatch GitLab API call: glab → urllib → curl."""
    token = _get_token()

    if shutil.which("glab"):
        try:
            return _api_call_glab(endpoint)
        except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
            print(f"WARNING: glab API call failed ({e}), falling back to urllib", file=sys.stderr)

    try:
        return _api_call_urllib(endpoint, token)
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        print(f"WARNING: urllib API call failed ({e}), falling back to curl", file=sys.stderr)

    try:
        return _api_call_curl(endpoint, token)
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f"ERROR: All API methods failed. Last error: {e}", file=sys.stderr)
        sys.exit(1)


def fetch_packages_since(since: datetime) -> list:
    """Fetch VTK WASM packages created after `since` from GitLab registry.

    Packages are named vtk-wasm32-emscripten / vtk-wasm64-emscripten with
    version strings like '9.6.20260524' (daily) or '9.6.1' (stable).
    """
    endpoint = (
        f"projects/{PROJECT_ID}/packages"
        "?package_type=generic&per_page=100&order_by=created_at&sort=desc"
    )
    packages = api_call(endpoint)
    if not isinstance(packages, list):
        return []

    result = []
    for pkg in packages:
        name = pkg.get("name", "")
        if not WASM_PKG_NAME_RE.match(name):
            continue
        version = pkg.get("version", "")
        if not SEMVER_RE.match(version):
            continue
        created_str = pkg.get("created_at", "")
        if not created_str:
            continue
        try:
            created_at = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
        except ValueError:
            continue
        if created_at <= since:
            continue
        pkg["_created_at_dt"] = created_at
        result.append(pkg)

    return result


def fetch_package_files(package_id: int) -> list:
    """Fetch file list for a package; return list of {id, file_name} dicts."""
    endpoint = f"projects/{PROJECT_ID}/packages/{package_id}/package_files"
    files = api_call(endpoint)
    return files if isinstance(files, list) else []


# ---------------------------------------------------------------------------
# C. Package pairing
# ---------------------------------------------------------------------------

def pair_packages(packages: list) -> dict:
    """Group packages by version and resolve file IDs.

    Returns dict: {
        '9.6.20260524': {
            'wasm32_file_id': 7155, 'wasm64_file_id': 7156, 'created_at': datetime,
            'is_daily': True
        }
    }
    """
    groups: dict[str, dict] = {}

    for pkg in packages:
        name = pkg.get("name", "")
        m = WASM_PKG_NAME_RE.match(name)
        if not m:
            continue
        arch = m.group(1)  # 'wasm32' or 'wasm64'
        version = pkg.get("version", "")

        if version not in groups:
            groups[version] = {
                "packages": {},
                "created_at": pkg["_created_at_dt"],
                "is_daily": bool(DAILY_VER_RE.match(version)),
            }
        groups[version]["packages"][arch] = pkg
        if pkg["_created_at_dt"] < groups[version]["created_at"]:
            groups[version]["created_at"] = pkg["_created_at_dt"]

    # Resolve file IDs for each group
    pairs = {}
    for version, info in groups.items():
        entry = {
            "wasm32_file_id": None,
            "wasm64_file_id": None,
            "created_at": info["created_at"],
            "is_daily": info["is_daily"],
        }
        for arch in ("wasm32", "wasm64"):
            pkg = info["packages"].get(arch)
            if pkg is None:
                continue
            files = fetch_package_files(pkg["id"])
            tar_file = next(
                (f for f in files if f.get("file_name", "").endswith(".tar.gz")), None
            )
            if tar_file:
                entry[f"{arch}_file_id"] = tar_file["id"]
        if entry["wasm32_file_id"] is not None:
            pairs[version] = entry

    return pairs


# ---------------------------------------------------------------------------
# D. Entry formatting
# ---------------------------------------------------------------------------

def format_release_entry(
    version_str: str,
    wasm32_file_id: int,
    wasm64_file_id: int | None,
    is_daily: bool,
    created_at: datetime | None = None,
) -> str:
    """Build a release news entry block."""
    base = f"https://{GITLAB_HOST}/vtk/vtk/-/package_files"

    if is_daily:
        date_part = version_str.split(".")[-1]
        date_display = datetime.strptime(date_part, "%Y%m%d").strftime("%B %d, %Y")
        pip_cmd = (
            f'pip install "vtk=={version_str}.dev0" '
            f"--extra-index-url https://wheels.vtk.org"
        )
    else:
        date_display = created_at.strftime("%B %d, %Y") if created_at else None
        pip_cmd = f'pip install "vtk=={version_str}"'

    lines = [f"## {version_str} is now available!", ""]

    if date_display:
        lines += [f"__{date_display}__", ""]

    lines += [
        "You can install the equivalent python wheel with the command",
        "",
        "```sh",
        pip_cmd,
        "```",
        "",
        "The WASM bundle is available here:",
    ]

    if wasm64_file_id is not None:
        lines.append(
            f"1. [vtk-{version_str}-wasm32-emscripten.tar.gz]"
            f"({base}/{wasm32_file_id}/download)"
        )
        lines.append(
            f"2. [vtk-{version_str}-wasm64-emscripten.tar.gz]"
            f"({base}/{wasm64_file_id}/download)"
        )
    else:
        lines.append(
            f"[vtk-{version_str}-wasm32-emscripten.tar.gz]"
            f"({base}/{wasm32_file_id}/download)"
        )

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main orchestration
# ---------------------------------------------------------------------------

def _release_sort_date(version_str: str, info: dict) -> datetime:
    if info.get("is_daily"):
        date_part = version_str.split(".")[-1]
        return datetime.strptime(date_part, "%Y%m%d").replace(tzinfo=timezone.utc)
    return info["created_at"]


def main():
    parser = argparse.ArgumentParser(
        description="Update docs/news.md with new VTK WASM release entries."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print generated entries without modifying news.md",
    )
    parser.add_argument(
        "--since",
        type=lambda s: datetime.strptime(s, "%Y-%m-%d").replace(tzinfo=timezone.utc),
        default=None,
        metavar="YYYY-MM-DD",
        help="Override start date (default: most recent date in news.md)",
    )
    args = parser.parse_args()

    if not NEWS_PATH.exists():
        print(f"ERROR: {NEWS_PATH} not found", file=sys.stderr)
        sys.exit(1)

    since = args.since or parse_most_recent_date(NEWS_PATH)
    print(f"Scanning for updates since: {since.strftime('%Y-%m-%d')}", file=sys.stderr)

    existing_versions = get_existing_release_versions(NEWS_PATH)

    print("Fetching packages from GitLab registry ...", file=sys.stderr)
    packages = fetch_packages_since(since)
    print(f"  Found {len(packages)} new package(s)", file=sys.stderr)
    pairs = pair_packages(packages)
    print(f"  Resolved {len(pairs)} release pair(s)", file=sys.stderr)

    new_releases = [
        (v, info) for v, info in pairs.items() if v not in existing_versions
    ]

    if not new_releases:
        print("No new entries found.", file=sys.stderr)
        return

    new_releases.sort(key=lambda x: _release_sort_date(*x), reverse=True)

    blocks = [
        format_release_entry(v, info["wasm32_file_id"], info.get("wasm64_file_id"),
                             info["is_daily"], info.get("created_at"))
        for v, info in new_releases
    ]
    new_content = "\n\n".join(blocks)

    if args.dry_run:
        print(new_content)
        return

    existing = NEWS_PATH.read_text(encoding="utf-8")
    NEWS_PATH.write_text(new_content + "\n\n" + existing, encoding="utf-8")
    print(
        f"Prepended {len(new_releases)} new entries to {NEWS_PATH.relative_to(REPO_ROOT)}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
