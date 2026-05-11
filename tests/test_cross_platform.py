"""Tests that enforce cross-platform discipline in src/xlos/."""

from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SRC = REPO_ROOT / "src" / "xlos"


def _read_all_py() -> dict[Path, str]:
    return {p: p.read_text(encoding="utf-8") for p in SRC.rglob("*.py")}


def test_no_hardcoded_user_paths() -> None:
    forbidden = [
        '"~',
        "'~",
        "\\\\",
        "%LOCALAPPDATA%",
        "%APPDATA%",
        "/home/",
        "/Users/",
    ]
    offenders: list[tuple[str, str]] = []
    for path, text in _read_all_py().items():
        for token in forbidden:
            if token in text:
                offenders.append((str(path.relative_to(REPO_ROOT)), token))
    assert not offenders, f"Forbidden path tokens found: {offenders}"


def test_install_imports_platformdirs_and_filelock() -> None:
    text = (SRC / "install.py").read_text(encoding="utf-8")
    assert "from platformdirs import" in text or "import platformdirs" in text
    assert "from filelock import" in text or "import filelock" in text


SKIP_DIRS = {
    ".git",
    ".venv",
    "venv",
    "env",
    "ENV",
    "node_modules",
    "build",
    "dist",
    ".tox",
    ".nox",
    ".scratch",
}


def test_no_powershell_files() -> None:
    offenders = [
        str(p.relative_to(REPO_ROOT))
        for p in REPO_ROOT.rglob("*.ps1")
        if not SKIP_DIRS.intersection(p.parts)
    ]
    assert not offenders, f"PowerShell files present: {offenders}"
