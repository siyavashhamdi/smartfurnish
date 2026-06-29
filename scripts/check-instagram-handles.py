#!/usr/bin/env python3
"""Check Instagram username availability via public web profile API."""
import json
import re
import sys
import time
import urllib.error
import urllib.request
from typing import Optional

# Persian-ish (romanized) + English AI/home names. No "ck" or "dw" substrings.
CANDIDATES = [
    # Persian-ish: khaneh (home), manzil (residence), otagh (room), rang (color)
    "khanehai", "khaneora", "khanevi", "khanelab", "khanezen", "khaneai",
    "manzilora", "manzilai", "manzilab", "manzilzen", "manzilapp",
    "otaghai", "otaghora", "otaghlab", "otaghzen", "otaghapp",
    "rangora", "rangai", "ranglab", "rangzen", "rangify",
    "noorora", "noorai", "noorlab", "noorzen", "noornest",
    "negarai", "negarora", "negarlab", "negarine", "negarzen",
    "tarrahai", "tarrahora", "tarrahlab", "tarrahzen",
    "naghshai", "naghshora", "naghshlab", "naghshzen",
    "hoshai", "hoshora", "hoshlab", "hoshzen", "hoshnest",
    "zehnai", "zehnora", "zehnlab", "zehnzen",
    "avazora", "avazai", "avazlab", "avazzen",
    "arayshai", "arayshora", "arayshlab", "arayshzen",
    "simaai", "simaora", "simalab", "simazen",
    "ayenehai", "ayenehora", "ayenelab", "ayenezen",
    "farshai", "farshora", "farshlab", "farshzen",
    "salonai", "salonora", "salonlab", "salonzen",
    "gooyaai", "gooyaora", "gooyalab",
    "zendegiai", "zendegiora",
    "pardehai", "pardehora",
    "sakhtai", "sakhtora",
    "namaai", "namaora", "namalab",
    "didbanai", "didbanora",
    # English AI-forward
    "airoom", "aihome", "ainest", "aidecor", "aifurni", "aiinter", "aiinterior",
    "roomai", "homeai", "nestai", "decorai", "furnai", "interai", "rugai", "wallai",
    "smartora", "smartnest", "smartroom", "smartdecor", "smartinter", "smartfurni",
    "visionora", "visionai", "visionlab", "visionroom", "visionnest", "visioninter",
    "neuralnest", "neuralroom", "neuralhome", "neuraldecor", "neuralinter", "neuralora",
    "genroom", "genhome", "gennest", "gendecor", "geninter", "genfurni", "genora",
    "synthroom", "synthhome", "synthnest", "synthdecor", "synthinter",
    "renderora", "renderlab", "renderai", "rendernest", "renderinter",
    "promptora", "promptroom", "promptnest", "promptinter",
    "modelroom", "modelhome", "modelnest", "modeldecor", "modelinter",
    "pixelora", "pixelnest", "pixelfurni", "pixelinter", "pixelroom",
    "vizora", "viznest", "vizfurni", "vizinter", "vizroom", "vizhome",
    "mindora", "mindnest", "mindinter", "mindroom", "mindhome",
    "autonest", "autoroom", "autohome", "autodecor", "autointer",
    "deephome", "deeproom", "deepnest", "deepdecor", "deepinter",
    "imaginora", "imaginhome", "imaginroom", "imaginnest",
    "dreamora", "dreamnest", "dreamroom", "dreaminter",
    "visuai", "visuora", "visulab", "visunest",
    "homegenai", "roomgenai", "nestgenai", "decorgenai",
    "furnishai", "intergenai", "ruggenai",
    # English product-style (no ck/dw) — carry-overs from prior pass
    "homora", "decorora", "roomforge", "spaceforge", "furniloom",
    "roommind", "roompulse", "nestpulse", "roomhue", "wallhue", "furnihue",
    "roomtint", "hometint", "roomlayer", "homelayer", "walllayer", "ruglayer",
    "roomshift", "roomplan", "interhaus", "decorly", "interly", "furniio",
    "interarc", "roomaxis", "furniaxis", "furnigrid", "roommesh",
    "furniframe", "homeframe", "roompatch", "furnipatch", "wallpatch",
    "roommood", "intermood", "interglow", "interspark",
    "roomrender", "furnirender", "interrender", "furnimock", "homemock",
    "furnipreview", "roompicker", "furnipicker", "furnimatch", "homematch",
    "furniplace", "furnistage", "interstage", "roomkitai", "furnikitai",
    "homekitai", "nestkitai", "roomlypro", "furnilypro", "homelypro", "roomstager",
    "loomora", "loomai", "loomnest", "canvasora", "canvasai", "canvasnest",
    "hueora", "huelab", "huenest", "tintora", "tintlab", "layerora", "layerai",
    "shiftora", "shiftai", "pulseora", "flowora", "flowai", "meshora", "meshai",
    "gridora", "axisora", "moodora", "vibeora", "frameora", "patchora",
    "previewora", "previewai", "pickora", "matchora", "placeora", "planora",
    "glowora", "glownest", "sparkora", "sparknest", "setora", "kitora",
    "brightora", "brightnest", "cleverhome", "cleverroom", "clevernest",
    "modora", "modai", "modnest", "novaai", "novanest", "novainter",
    "lumora", "lumonest", "veloai", "velonest", "prismai", "prismnest",
]

BANNED_SUBSTRINGS = ("ck", "dw")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "X-IG-App-ID": "936619743392459",
    "X-Requested-With": "XMLHttpRequest",
}


def passes_filters(username: str) -> bool:
    lowered = username.lower()
    return not any(b in lowered for b in BANNED_SUBSTRINGS)


def is_available(username: str) -> Optional[bool]:
    url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={username}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        if e.code in (404, 400):
            return True
        if e.code in (401, 429):
            return None
        return None
    except Exception:
        return None

    if re.search(r'"username"\s*:\s*"', body, re.I):
        return False
    lowered = body.lower()
    if "user not found" in lowered or "not found" in lowered:
        return True
    try:
        data = json.loads(body)
        if data.get("data", {}).get("user"):
            return False
    except json.JSONDecodeError:
        pass
    if "data" in body and '"user":null' in body.replace(" ", ""):
        return True
    return None


def main() -> None:
    target = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    available: list[str] = []
    taken: list[str] = []
    unknown: list[str] = []
    skipped: list[str] = []

    seen: set[str] = set()
    for raw in CANDIDATES:
        username = re.sub(r"[^a-z0-9._]", "", raw.lower())
        if not username or username in seen or len(username) > 30:
            continue
        seen.add(username)

        if not passes_filters(username):
            skipped.append(username)
            continue

        result = is_available(username)
        if result is True:
            available.append(username)
            print(f"AVAILABLE  @{username}", flush=True)
        elif result is False:
            taken.append(username)
            print(f"taken       @{username}", flush=True)
        else:
            unknown.append(username)
            print(f"unknown     @{username}", flush=True)

        if len(available) >= target:
            break
        time.sleep(0.65)

    print("\n--- SUMMARY ---")
    print(f"Available: {len(available)}")
    print(f"Taken: {len(taken)}")
    print(f"Unknown: {len(unknown)}")
    print(f"Skipped (ck/dw): {len(skipped)}")
    print(json.dumps(available, indent=2))


if __name__ == "__main__":
    main()
