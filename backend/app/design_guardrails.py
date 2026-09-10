import json
from pathlib import Path

CONTRACT_PATH = Path(__file__).resolve().parents[2] / "project" / "design" / "SITE_DESIGN_CONTRACT.json"


def load_design_contract(path: Path = CONTRACT_PATH) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def validate_generation_request(request: dict, path: Path = CONTRACT_PATH) -> dict:
    contract = load_design_contract(path)
    requested = set(request.get("components", []))
    allowed = set(contract["allowed_components"])
    missing = sorted(requested - allowed)
    prohibited = sorted(set(request.get("style_changes", [])) & set(contract["prohibited_arbitrary_styling"]))
    if missing:
        return {
            "status": "DESIGN_EXTENSION_REQUIRED",
            "missing_components": missing,
            "reason": "The requested primitive is not part of the approved site design system.",
        }
    if prohibited:
        return {"status": "REJECTED", "prohibited_changes": prohibited}
    return {"status": "ALLOWED"}
