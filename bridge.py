"""
Race Weekend — iRacing Bridge v3
Reads iRacing telemetry, simulates flag events, serves local HTTP API.

Dependencies:
    pip install pyirsdk pywin32

pywin32 enables actual flag commands sent to iRacing via chat.
Without it the bridge still detects events and logs them — just no commands fire.
"""
import sys
import io
if sys.stdout is not None and hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='ignore')
if sys.stderr is not None and hasattr(sys.stderr, 'buffer'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='ignore')

import irsdk
import json
import time
import threading
import random
import os
import logging
import builtins
from http.server import HTTPServer, BaseHTTPRequestHandler

# ── File logging (all print() output goes here when running headless) ──────────
_log_path = os.path.join(
    os.environ.get('LOCALAPPDATA', os.path.expanduser('~')),
    'iRacing Career Manager', 'bridge.log'
)
_events_path = os.path.join(os.path.dirname(_log_path), 'bridge_events.json')
os.makedirs(os.path.dirname(_log_path), exist_ok=True)
logging.basicConfig(
    filename=_log_path,
    level=logging.DEBUG,
    format='%(asctime)s  %(message)s',
    datefmt='%H:%M:%S',
    encoding='utf-8',
)
_orig_print = builtins.print
def print(*args, **kwargs):
    msg = ' '.join(str(a) for a in args)
    logging.info(msg)
    try:
        _orig_print(*args, **kwargs)
    except Exception:
        pass
builtins.print = print
print(f"[Bridge] Log file: {_log_path}")

# pywin32 for sending commands to iRacing chat
try:
    import win32gui
    import win32con
    import win32api
    WIN32_AVAILABLE = True
except ImportError:
    WIN32_AVAILABLE = False
    print("[Bridge] pywin32 not installed — flag commands disabled.")
    print("[Bridge] To enable: pip install pywin32")

# ── Configuration ──────────────────────────────────────────────────────────────

CFG = {
    "commands_enabled": True,

    # ── Caution settings ───────────────────────────────────────────────────────
    # Base rates tuned for 100 lap race — scaled dynamically by total laps at race start
    "yellow_chance_per_lap":          0.035,
    "min_green_laps_between_yellows": 8,
    "min_lap_for_failures":           10,     # nothing fires in first 10 laps

    # ── On-track detection thresholds ─────────────────────────────────────────
    # Disabled most of these — they fire too often on AI cars that naturally
    # go wide or slow. Let the base failure model handle mechanical issues.
    "kerb_hits_before_penalty":   99,         # effectively disabled
    "excursion_speed_threshold":  1.0,        # only flag fully stopped cars
    "pace_loss_threshold":        0.35,       # 35% slower — basically broken car only
    "pace_loss_min_laps":         15,         # need solid baseline first
    "contact_speed_drop":         5.0,
    "contact_steer_spike":        0.5,

    # ── AI RPM stress model ───────────────────────────────────────────────────
    # Stress model is effectively disabled — stress spikes rarely reach 100%
    # Target: ~0 stress-induced failures per race
    "ai_rpm_stress_per_redline_lap":   2.0,
    "ai_rpm_stress_decay_per_lap":     0.8,   # decays slower than it builds
    "ai_rpm_stress_spike_chance":      0.012, # slightly more frequent
    "ai_rpm_stress_spike_amount":      8.0,
    "ai_stress_failure_threshold":     100.0,
    "ai_base_failure_chance":          0.0003, # 25 cars × 100 laps × 0.0003 = ~0.8 DNFs

    # ── Pit road simulation (AI only) ──────────────────────────────────────────
    # Target: 0-1 pit violations per race
    "pit_speeding_chance":           0.004,
    "pit_crew_error_chance":         0.003,
    "pit_unsafe_release_chance":     0.001,
    "max_black_flags_per_race":      4,       # hard cap
    "pit_equipment_yellow_chance":   0.10,

    # ── Additional random flag chances (per lap, per car) ─────────────────────
    # 25 cars × 100 laps × 0.0001 = ~0.25 expected per type — rare but possible
    "fire_chance_per_lap":           0.00008,
    "fuel_issue_chance_per_lap":     0.0001,
    "track_cut_chance_per_lap":      0.0001,
    "aggressive_pass_chance_per_lap": 0.0001,

    # ── Player RPM stress ──────────────────────────────────────────────────────
    "player_rpm_redline_pct":         0.95,
    "player_rpm_stress_per_second":   0.35,
    "player_rpm_stress_decay":        0.02,
    "player_money_shift_rpm_drop":    1800,
    "player_money_shift_stress":      15.0,
    "player_engine_warning_stress":   25.0,
    "player_stress_failure_threshold": 100.0,

    # ── Penalty durations (seconds) ───────────────────────────────────────────
    "penalty_seconds": {
        "loose_wheel":          60,
        "puncture":             90,
        "suspension":           75,
        "kerb_damage":          60,
        "pace_loss":            90,
        "excursion":            45,
        "overheating_mild":     60,
        "track_cut":            30,    # drive-through
        "aggressive_pass":      45,
        "pit_speeding":         30,    # drive-through equivalent
        "pit_crew_error":       60,    # stop-and-go
        "pit_unsafe_release":   45,
        "pit_equipment":        60,
    },

    # ── Failure type definitions ──────────────────────────────────────────────
    # (display_reason, is_dnf, penalty_key_or_none)
    "failure_types": {
        # On-track black flags — car serves stop, rejoins
        "loose_wheel":        ("loose wheel — mandatory pit stop",                   False, "loose_wheel"),
        "puncture":           ("cut tire — mandatory pit stop",                      False, "puncture"),
        "suspension":         ("suspected suspension damage — pit stop",              False, "suspension"),
        "kerb_damage":        ("wheel damage from kerb contact — pit stop",           False, "kerb_damage"),
        "pace_loss":          ("significant pace loss — inspection stop",             False, "pace_loss"),
        "excursion":          ("hard excursion — mandatory inspection",               False, "excursion"),
        "overheating_mild":   ("overheating — cool-down stop required",               False, "overheating_mild"),
        "track_cut":          ("avoidable track cut — drive-through penalty",         False, "track_cut"),
        "aggressive_pass":    ("flagrant avoidable contact — stop-and-go penalty",   False, "aggressive_pass"),
        # Pit road violations — simulated for AI
        "pit_speeding":       ("pit road speeding — drive-through penalty",           False, "pit_speeding"),
        "pit_crew_error":     ("pit crew violation — stop-and-go penalty",            False, "pit_crew_error"),
        "pit_unsafe_release": ("unsafe release from pit stall — penalty",             False, "pit_unsafe_release"),
        "pit_equipment":      ("equipment on pit lane — stop-and-go penalty",         False, "pit_equipment"),
        # Race-ending failures — car DQ'd, app shows as DNF
        "engine_blown":       ("engine failure — retired",                            True,  None),
        "gearbox_failure":    ("gearbox failure — retired",                           True,  None),
        "transmission_failure": ("transmission failure — retired",                    True,  None),
        "overheating_severe": ("severe overheating — engine destroyed",               True,  None),
        "mechanical_dnf":     ("mechanical failure — retired",                        True,  None),
        "fire_dnf":           ("fire — car destroyed, driver unharmed",               True,  None),
        "fuel_issue":         ("fuel system failure — unable to continue",             True,  None),
    },
}

# ── State ──────────────────────────────────────────────────────────────────────

ir = irsdk.IRSDK()

state = {
    "connected":        False,
    "session_type":     None,
    "session_state":    None,
    "session_finished": False,
    "track":            "",
    "drivers":          [],
    "finish_order":     [],
    "player_name":      "",
    "player_car_idx":   -1,
    "last_result":      None,
    "live": {
        "lap":           0,
        "position":      0,
        "incidents":     0,
        "field_size":    0,
        "session_flags": 0,
        "under_yellow":  False,
    },
    "race": {
        "lap_count":             0,
        "last_yellow_lap":       -5,
        "yellows":               [],
        "black_flags":           [],
        "pit_violations":        [],
        "kerb_hits":             {},
        "car_best_laps":         {},
        "car_last_laps":         {},
        "car_offtrack":          {},
        "car_pitted":            set(),  # cars that have pitted this race (for per-stop sim)
        "car_in_pit_this_lap":   set(),  # cars that pitted this lap (reset each lap)
        "player_kerb_hits":      0,
        "session_flags_prev":    0,
        "green_laps":            0,
        "flagged_cars":          set(),
        "ai_stress":             {},
        "ai_max_rpm":            {},
        "player_stress":         0.0,
        "player_max_rpm":        0.0,
        "player_prev_rpm":       0.0,
        "player_prev_rpm_time":  0.0,
        "player_warnings_seen":  set(),
        "car_prev_speed":        {},
                    "car_prev_steer":        {},
                    "car_incidents":         {},
                    "contact_events":        [],
                    "car_on_pitroad":        {},   # prev tick pit road state per car
                    "car_in_pitstall":       {},   # prev tick in-stall state per car
                    "pit_violations":        [],   # log of all pit road penalties
    },
}

# ── Chat command sender ────────────────────────────────────────────────────────

def find_iracing_hwnd():
    if not WIN32_AVAILABLE:
        return None
    for cls in ("iRacingUI_2020", "iRacingUI", "irsimui", "iRacingSim"):
        hwnd = win32gui.FindWindow(cls, None)
        if hwnd:
            return hwnd
    results = []
    def _cb(h, _):
        t = win32gui.GetWindowText(h)
        if "iracing" in t.lower() or "irsim" in t.lower():
            results.append(h)
    win32gui.EnumWindows(_cb, None)
    return results[0] if results else None


_chat_lock = threading.Lock()  # only one command types at a time

def send_chat_command(cmd):
    if not WIN32_AVAILABLE or not CFG["commands_enabled"]:
        print(f"[Bridge] (disabled) would send: {cmd}")
        return False
    if not ir.is_initialized or not ir.is_connected:
        print(f"[Bridge] Not connected — cannot send: {cmd}")
        return False
    hwnd = find_iracing_hwnd()
    if not hwnd:
        print(f"[Bridge] ⚠️  iRacing window not found — command not sent: {cmd}")
        return False
    with _chat_lock:
        try:
            WM_CHAR    = 0x0102
            WM_KEYDOWN = 0x0100
            WM_KEYUP   = 0x0101
            VK_RETURN  = 0x0D
            ir.chat_command(irsdk.ChatCommandMode.begin_chat)
            time.sleep(0.25)
            for ch in cmd:
                win32api.SendMessage(hwnd, WM_CHAR, ord(ch), 0)
                time.sleep(0.04)
            win32api.SendMessage(hwnd, WM_KEYDOWN, VK_RETURN, 0)
            time.sleep(0.08)
            win32api.SendMessage(hwnd, WM_KEYUP,   VK_RETURN, 0)
            time.sleep(0.3)  # wait after send so next command doesn't overlap
            print(f"[Bridge] ✅ Sent: {cmd}")
            return True
        except Exception as e:
            print(f"[Bridge] Command send error: {e}")
            return False


def _issue_black_flag_cmd(car_number):
    time.sleep(2.0)
    send_chat_command(f"!black #{car_number}")


def _issue_dq_cmd(car_number):
    """DQ the car — app translates to DNF."""
    time.sleep(2.0)
    send_chat_command(f"!dq #{car_number}")


def _issue_yellow_cmd(reason):
    send_chat_command("!yellow")


# ── Helpers ────────────────────────────────────────────────────────────────────

def get_car_number(car_idx):
    d = next((d for d in state["drivers"] if d["idx"] == car_idx), None)
    return d["car_number"] if d else "??"

def get_cmd_number(car_idx):
    d = next((d for d in state["drivers"] if d["idx"] == car_idx), None)
    return d.get("cmd_number", d["car_number"]) if d else "??"

def get_driver_name(car_idx):
    d = next((d for d in state["drivers"] if d["idx"] == car_idx), None)
    return d["name"] if d else "Unknown"


# ── Causally-linked yellow reasons ────────────────────────────────────────────
# Maps failure_key → (yellow_chance, [matching reasons])

_FAILURE_YELLOW_MAP = {
    "engine_blown": (0.90, [
        "fluid from a blown engine on the racing surface",
        "a car stopped with engine failure, fluid down on track",
        "engine failure bringing out the caution",
        "a blown motor dumping oil in the racing groove",
    ]),
    "fire_dnf": (0.95, [
        "a car on fire in turn 3",
        "a fire bringing out the yellow — driver is out of the car",
        "a burning car blocking the racing groove",
        "fire on the racing surface from a car fire",
    ]),
    "fuel_issue": (0.55, [
        "a car stopped on track with a fuel issue",
        "a car coasting to a stop on the front straight",
        "a stalled car in a dangerous position",
    ]),
    "overheating_severe": (0.75, [
        "a car trailing smoke and fluid from overheating",
        "coolant on the racing surface from an overheated engine",
        "fluid down from an overheated engine",
    ]),
    "gearbox_failure": (0.60, [
        "a car stopped on track with mechanical failure",
        "a gearbox failure stranding a car in a dangerous spot",
        "fluids from a mechanical failure on the racing surface",
    ]),
    "transmission_failure": (0.60, [
        "a car stopped on track with mechanical failure",
        "a car losing drive on the front straight",
        "fluid from a mechanical failure in the racing groove",
    ]),
    "mechanical_dnf": (0.50, [
        "a car stopped on track",
        "a mechanical failure bringing out the yellow",
        "debris from a broken car on the racing surface",
    ]),
    "loose_wheel": (0.45, [
        "a wheel coming off a car in traffic",
        "a loose wheel bouncing down the track",
        "wheel parts scattered across the racing surface",
        "a car limping with a wheel problem",
    ]),
    "puncture": (0.35, [
        "a car with a cut tire spinning in traffic",
        "tire debris in the racing groove",
        "a blown tire sending a car into the wall",
        "rubber on the racing surface from a puncture",
    ]),
    "suspension": (0.30, [
        "a car with suspected suspension damage cutting across the track",
        "a car losing control through the corners with damage",
    ]),
    "kerb_damage": (0.25, [
        "a car limping with wheel damage from kerb contact",
        "debris from a car that took a hard shot at the curbing",
    ]),
    "aggressive_pass": (0.35, [
        "contact between two cars fighting for position",
        "a car sent into the wall after aggressive contact",
        "debris from a racing incident in turns 1 and 2",
    ]),
    "excursion": (0.20, [
        "a car in the gravel that may need assistance",
        "a car off track and possibly stuck",
    ]),
    "overheating_mild": (0.15, [
        "a car trailing smoke on the back straight",
        "a car pitting under green with a mechanical issue",
    ]),
    "pace_loss": (0.10, [
        "a slow car creating a dangerous situation in traffic",
    ]),
    # Pit violations rarely cause track yellows — only equipment on lane
    "pit_equipment": (0.25, [
        "equipment on the pit lane apron",
        "a tire carrier loose on pit road",
        "debris from a pit stop on the pit lane",
    ]),
}


def _maybe_linked_yellow(failure_key, driver_name, car_num):
    """After a flag event, maybe throw a causally-correct linked yellow."""
    race = state["race"]
    laps_since = race["lap_count"] - race["last_yellow_lap"]
    if laps_since < CFG["min_green_laps_between_yellows"]:
        return
    mapping = _FAILURE_YELLOW_MAP.get(failure_key)
    if not mapping:
        return
    yellow_chance, reasons = mapping
    if random.random() > yellow_chance:
        return
    reason = random.choice(reasons)
    if random.random() < 0.4:
        reason = f"#{car_num} — {reason}"
    add_yellow(reason)


# ── Flag dispatch ──────────────────────────────────────────────────────────────

_flag_lock = threading.Lock()

def add_flag_event(car_idx, failure_key):
    """
    Issue a flag event for a car.
    Pitstop failures → black flag (car serves stop, rejoins)
    Race-ending failures → dq (shows as DNF in app)
    """
    with _flag_lock:
        if car_idx in state["race"]["flagged_cars"]:
            return
        # Hard cap on total black flags per race to prevent pile-ons
        if len(state["race"].get("black_flags", [])) >= CFG.get("max_black_flags_per_race", 3):
            return
        state["race"]["flagged_cars"].add(car_idx)

    car_num     = get_car_number(car_idx)
    car_cmd_num = get_cmd_number(car_idx)
    driver      = get_driver_name(car_idx)
    is_player   = (car_idx == state["player_car_idx"])

    ft = CFG["failure_types"].get(failure_key, (failure_key, False, None))
    reason, is_dnf, penalty_key = ft
    penalty_s = CFG["penalty_seconds"].get(penalty_key, 0) if penalty_key else 0

    event = {
        "car":             car_num,
        "car_idx":         car_idx,
        "driver":          driver,
        "reason":          reason,
        "failure_key":     failure_key,
        "is_dnf":          is_dnf,
        "penalty_seconds": penalty_s,
        "lap":             state["race"]["lap_count"],
        "is_player":       is_player,
    }
    state["race"]["black_flags"].append(event)

    flag_type = "🔴 DNF" if is_dnf else "🚩 Black flag"
    cmd_label  = "dq" if is_dnf else f"black (stop {penalty_s}s)"
    print(f"[Bridge] {flag_type}: #{car_num} {driver} — {reason} → {cmd_label}")

    if WIN32_AVAILABLE and CFG["commands_enabled"]:
        if is_dnf:
            t = threading.Thread(target=_issue_dq_cmd, args=(car_cmd_num,), daemon=True)
        else:
            t = threading.Thread(target=_issue_black_flag_cmd, args=(car_cmd_num,), daemon=True)
        t.start()

    # Maybe follow with a causally-linked yellow (not for player — iRacing handles that)
    if not is_player:
        _maybe_linked_yellow(failure_key, driver, car_num)


def add_black_flag(car_idx, reason_key, custom_reason=None):
    add_flag_event(car_idx, reason_key)


_last_yellow_time = 0.0  # wall-clock time of last yellow issued
_yellow_lock = threading.Lock()

def add_yellow(reason=None):
    """Record and issue a full-course yellow."""
    global _last_yellow_time
    with _yellow_lock:
        now = time.time()
        if now - _last_yellow_time < 30.0:
            print(f"[Bridge] ⏳ Yellow suppressed (cooldown) — {int(30.0 - (now - _last_yellow_time))}s remaining")
            return
        _last_yellow_time = now

    lap = state["race"]["lap_count"]
    r   = reason or random.choice([
        "debris on the front stretch",
        "a spin in turns 1 and 2",
        "contact between two cars",
        "a car stopped on track",
    ])
    state["race"]["yellows"].append({"lap": lap, "reason": r, "source": "bridge"})
    state["race"]["last_yellow_lap"] = lap
    state["race"]["green_laps"]      = 0
    print(f"[Bridge] 🟡 Caution lap {lap}: {r}")
    if WIN32_AVAILABLE and CFG["commands_enabled"]:
        t = threading.Thread(target=_issue_yellow_cmd, args=(r,), daemon=True)
        t.start()


# ── Driver list ────────────────────────────────────────────────────────────────

def get_driver_list():
    drivers = []
    try:
        info = ir["DriverInfo"]
        if not info:
            return drivers
        for d in info.get("Drivers", []):
            idx  = d.get("CarIdx", -1)
            name = d.get("UserName", "")
            if name and idx >= 0 and "pace" not in name.lower() and d.get("CarNumber", "") != "0":
                raw     = d.get("CarNumberRaw", None)
                display = d.get("CarNumber", "")
                try:
                    # CarNumberRaw is an int in irsdk — use it directly if available
                    cmd_num = str(int(raw)) if raw is not None else ''.join(c for c in display if c.isdigit())
                    if not cmd_num:
                        cmd_num = display  # fallback to raw display string
                except (ValueError, TypeError):
                    cmd_num = ''.join(c for c in display if c.isdigit()) or display
                drivers.append({
                    "idx":          idx,
                    "name":         name,
                    "car_number":   display,
                    "cmd_number":   cmd_num,
                    "car_class_id": d.get("CarClassID", 0),
                })
    except Exception:
        pass
    return drivers


# ── Finish order ───────────────────────────────────────────────────────────────

def get_finish_order():
    results = []
    try:
        si = ir["SessionInfo"]
        sessions = si.get("Sessions", []) if si else []
        race_session = next(
            (s for s in sessions if s.get("SessionType", "").lower() == "race"), None
        )
        if race_session and race_session.get("ResultsPositions"):
            for r in race_session["ResultsPositions"]:
                car_idx = r.get("CarIdx", -1)
                driver  = next((d for d in state["drivers"] if d["idx"] == car_idx), None)
                if not driver:
                    continue
                results.append({
                    "position":      r.get("Position", 99) + 1,
                    "name":          driver["name"],
                    "car_number":    driver["car_number"],
                    "laps":          r.get("LapsComplete", 0),
                    "laps_led":      r.get("LapsLed", 0),
                    "fastest_lap":   round(r.get("FastestTime", 0), 3),
                    "dnf":           r.get("ReasonOutId", 0) > 0,
                    "is_player":     car_idx == state["player_car_idx"],
                    "incidents":     r.get("Incidents", 0),
                    "black_flagged": car_idx in state["race"]["flagged_cars"],
                })
            finishers = sorted([x for x in results if not x["dnf"]], key=lambda x: x["position"])
            dnfs      = sorted([x for x in results if x["dnf"]],     key=lambda x: x["position"])
            combined  = finishers + dnfs
            for i, e in enumerate(combined):
                e["position"] = i + 1
            return combined
    except Exception as ex:
        print(f"[Bridge] get_finish_order error: {ex}")

    # Fallback: live positions
    try:
        positions = ir["CarIdxPosition"] or []
        laps      = ir["CarIdxLap"] or []
        for d in state["drivers"]:
            idx = d["idx"]
            pos = positions[idx] if idx < len(positions) else 0
            lap = laps[idx]     if idx < len(laps)      else 0
            if pos > 0:
                results.append({
                    "position": pos, "name": d["name"], "car_number": d["car_number"],
                    "laps": lap, "laps_led": 0, "fastest_lap": 0, "dnf": False,
                    "is_player": d["idx"] == state["player_car_idx"],
                    "incidents": 0, "black_flagged": d["idx"] in state["race"]["flagged_cars"],
                })
        results.sort(key=lambda x: x["position"])
    except Exception:
        pass
    return results


# ── Live data ──────────────────────────────────────────────────────────────────

def get_live_data():
    try:
        sf = ir["SessionFlags"] or 0
        return {
            "position":      ir["PlayerCarPosition"] or 0,
            "lap":           ir["Lap"] or 0,
            "incidents":     ir["PlayerCarMyIncCount"] or 0,
            "field_size":    len([d for d in state["drivers"] if d["name"]]),
            "session_flags": sf,
            "under_yellow":  bool(sf & 0x0002),
        }
    except Exception:
        return {"position": 0, "lap": 0, "incidents": 0,
                "field_size": 0, "session_flags": 0, "under_yellow": False}


# ── Flag & damage detection ────────────────────────────────────────────────────

def tick_ai_stress(car_laps, currently_yellow):
    """
    Per-lap RPM stress + base random failures for AI cars.
    Skips cars that pitted this lap (handled by tick_pit_sim instead).
    """
    if currently_yellow:
        return
    race    = state["race"]
    min_lap = CFG["min_lap_for_failures"]
    if race["lap_count"] < min_lap:
        return

    try:
        rpms        = ir["CarIdxRPM"]       or []
        on_pit_road = ir["CarIdxOnPitRoad"] or []
    except Exception:
        rpms        = []
        on_pit_road = []

    for d in state["drivers"]:
        idx = d["idx"]
        if idx in race["flagged_cars"]:
            continue
        if idx == state["player_car_idx"]:
            continue  # player handled by tick_player_engine

        # Skip cars currently on pit road — no random damage while pitting
        if idx < len(on_pit_road) and on_pit_road[idx]:
            continue

        if idx >= len(rpms):
            continue
        rpm = rpms[idx]
        if rpm is None or rpm <= 0:
            continue

        prev_max = race["ai_max_rpm"].get(idx, 0)
        if rpm > prev_max:
            race["ai_max_rpm"][idx] = rpm
            prev_max = rpm

        redline = prev_max * CFG["player_rpm_redline_pct"]
        stress  = race["ai_stress"].get(idx, 0.0)

        if prev_max > 0 and rpm >= redline:
            stress += CFG["ai_rpm_stress_per_redline_lap"]
        else:
            stress = max(0.0, stress - CFG["ai_rpm_stress_decay_per_lap"])

        if random.random() < CFG["ai_rpm_stress_spike_chance"]:
            stress += CFG["ai_rpm_stress_spike_amount"]
            print(f"[Bridge] ⚠️  Stress spike: {d['name']} #{d['car_number']} ({stress:.1f}%)")

        race["ai_stress"][idx] = stress

        # Stress-induced failure — weighted toward race-ending
        if stress >= CFG["ai_stress_failure_threshold"]:
            roll = random.random()
            if roll < 0.50:
                add_flag_event(idx, "engine_blown")
            elif roll < 0.70:
                add_flag_event(idx, "gearbox_failure")
            elif roll < 0.85:
                add_flag_event(idx, "transmission_failure")
            else:
                add_flag_event(idx, "mechanical_dnf")

        # Base random failure (separate from stress)
        elif random.random() < CFG["ai_base_failure_chance"]:
            roll = random.random()
            if roll < 0.30:
                add_flag_event(idx, "loose_wheel")
            elif roll < 0.50:
                add_flag_event(idx, "puncture")
            elif roll < 0.62:
                add_flag_event(idx, "overheating_mild")
            elif roll < 0.72:
                add_flag_event(idx, "suspension")
            elif roll < 0.82:
                add_flag_event(idx, "mechanical_dnf")
            elif roll < 0.90:
                add_flag_event(idx, "engine_blown")
            elif roll < 0.95:
                add_flag_event(idx, "fuel_issue")
            else:
                add_flag_event(idx, "fire_dnf")

        # Additional per-lap random events (independent of stress/base)
        else:
            # Fire — rare, dramatic
            if random.random() < CFG["fire_chance_per_lap"]:
                add_flag_event(idx, "fire_dnf")
            # Fuel issue — car stops without mechanical failure
            elif random.random() < CFG["fuel_issue_chance_per_lap"]:
                add_flag_event(idx, "fuel_issue")
            # Track cutting — black flag, short penalty
            elif random.random() < CFG["track_cut_chance_per_lap"]:
                add_flag_event(idx, "track_cut")
            # Flagrant avoidable contact
            elif random.random() < CFG["aggressive_pass_chance_per_lap"]:
                add_flag_event(idx, "aggressive_pass")


def tick_pit_sim(car_laps):
    """
    Simulate pit road violations for AI cars.
    Runs once per lap, checks which cars pitted this lap for the first time.
    All purely simulated — AI never actually speeds on pit road,
    and player gets native iRacing penalties.
    """
    race    = state["race"]
    min_lap = CFG["min_lap_for_failures"]
    if race["lap_count"] < min_lap:
        return

    try:
        on_pit_road = ir["CarIdxOnPitRoad"] or []
        surfaces    = ir["CarIdxTrackSurface"] or []
    except Exception:
        return

    # CarIdxTrackSurface: 3 = in stall, 2 = pit lane, 4 = approaching pits
    PIT_SURFACE = {2, 3, 4}

    for d in state["drivers"]:
        idx = d["idx"]
        if idx in race["flagged_cars"]:
            continue
        if idx == state["player_car_idx"]:
            continue  # player gets native iRacing pit lane penalties

        on_pit = idx < len(on_pit_road) and on_pit_road[idx]
        if not on_pit:
            # Car not on pit road — remove from this-lap tracking if present
            race["car_in_pit_this_lap"].discard(idx)
            continue

        # Car is on pit road — check if this is a new pit stop this lap
        if idx in race["car_in_pit_this_lap"]:
            continue  # already processed this stop this lap
        race["car_in_pit_this_lap"].add(idx)

        # ── 1. Pit road speeding ─────────────────────────────────────────────
        # AI doesn't actually speed but we simulate the violation
        if random.random() < CFG["pit_speeding_chance"]:
            print(f"[Bridge] 🚨 Pit speeding (sim): {d['name']} #{d['car_number']}")
            add_flag_event(idx, "pit_speeding")
            race["pit_violations"].append({
                "type": "speeding", "car": d["car_number"],
                "driver": d["name"], "lap": race["lap_count"],
            })
            continue  # one violation per stop

        # ── 2. Crew error ────────────────────────────────────────────────────
        if random.random() < CFG["pit_crew_error_chance"]:
            roll = random.random()
            if roll < 0.45:
                detail = "wheel not properly secured — car returned to stall"
                vtype  = "pit_crew_error"
            elif roll < 0.70:
                detail = "too many crew members over the wall"
                vtype  = "pit_crew_error"
            elif roll < 0.85:
                detail = "equipment left in pit lane"
                vtype  = "pit_equipment"
                # Equipment on lane — may escalate to yellow
                if random.random() < CFG["pit_equipment_yellow_chance"]:
                    laps_since = race["lap_count"] - race["last_yellow_lap"]
                    if laps_since >= CFG["min_green_laps_between_yellows"]:
                        add_yellow(random.choice([
                            "equipment on the pit lane apron",
                            "a tire loose on pit road",
                            "debris from a pit stop in the pit lane",
                        ]))
            else:
                detail = "fueling error — fuel spilled on pit road"
                vtype  = "pit_crew_error"

            print(f"[Bridge] 🔧 Crew error (sim): {d['name']} #{d['car_number']} — {detail}")
            add_flag_event(idx, vtype)
            race["pit_violations"].append({
                "type": vtype, "car": d["car_number"],
                "driver": d["name"], "detail": detail, "lap": race["lap_count"],
            })
            continue

        # ── 3. Unsafe release ────────────────────────────────────────────────
        if random.random() < CFG["pit_unsafe_release_chance"]:
            print(f"[Bridge] ⚠️  Unsafe release (sim): {d['name']} #{d['car_number']}")
            add_flag_event(idx, "pit_unsafe_release")
            race["pit_violations"].append({
                "type": "unsafe_release", "car": d["car_number"],
                "driver": d["name"], "lap": race["lap_count"],
            })


def tick_player_engine():
    """Real-time player engine stress from actual RPM telemetry."""
    race = state["race"]
    pidx = state["player_car_idx"]
    if pidx < 0 or pidx in race["flagged_cars"]:
        return
    try:
        rpm      = ir["RPM"] or 0
        warnings = ir["EngineWarnings"] or 0
        now      = time.time()
        speed    = ir["Speed"] or 0   # m/s — player's actual speed
        on_pit   = ir["CarIdxOnPitRoad"]
        on_pit   = on_pit[pidx] if on_pit and pidx < len(on_pit) else False
    except Exception:
        return
    if rpm <= 0:
        return
    # Don't accumulate stress or trigger failures while stationary or on pit road
    # 2.2 m/s ≈ 5 mph — anything below this is parked/crawling
    if speed < 2.2 or on_pit:
        return

    if rpm > race["player_max_rpm"]:
        race["player_max_rpm"] = rpm

    redline = race["player_max_rpm"] * CFG["player_rpm_redline_pct"]
    stress  = race["player_stress"]

    if race["player_max_rpm"] > 0 and rpm >= redline:
        stress += CFG["player_rpm_stress_per_second"]
    else:
        stress = max(0.0, stress - CFG["player_rpm_stress_decay"])

    prev_rpm  = race["player_prev_rpm"]
    prev_time = race["player_prev_rpm_time"]
    if prev_rpm > 0 and prev_time > 0:
        dt       = now - prev_time
        rpm_drop = prev_rpm - rpm
        if dt < 0.6 and rpm_drop > CFG["player_money_shift_rpm_drop"] and rpm > 2000:
            stress += CFG["player_money_shift_stress"]
            print(f"[Bridge] 💸 Money shift! RPM -{rpm_drop:.0f} in {dt:.2f}s "
                  f"(stress +{CFG['player_money_shift_stress']}% → {stress:.1f}%)")

    warn_oil_temp  = 0x40
    warn_oil_press = 0x04
    warn_water     = 0x01
    seen           = race["player_warnings_seen"]

    if (warnings & warn_oil_press) and "oil_press" not in seen:
        seen.add("oil_press")
        stress += CFG["player_engine_warning_stress"] * 2
        print(f"[Bridge] 🔴 Oil pressure warning! (+{CFG['player_engine_warning_stress']*2}%)")

    if (warnings & warn_oil_temp) and "oil_temp" not in seen:
        seen.add("oil_temp")
        stress += CFG["player_engine_warning_stress"]
        print(f"[Bridge] 🟠 Oil temp warning! (+{CFG['player_engine_warning_stress']}%)")

    if (warnings & warn_water) and "water_temp" not in seen:
        seen.add("water_temp")
        stress += CFG["player_engine_warning_stress"]
        print(f"[Bridge] 🟠 Water temp warning! (+{CFG['player_engine_warning_stress']}%)")

    race["player_stress"]       = min(stress, 150.0)
    race["player_prev_rpm"]     = rpm
    race["player_prev_rpm_time"] = now
    state["live"]["player_engine_stress"] = round(stress, 1)
    state["live"]["player_rpm"]           = int(rpm)

    if stress >= CFG["player_stress_failure_threshold"]:
        if "oil_press" in seen:
            add_flag_event(pidx, "engine_blown")
        elif "oil_temp" in seen or "water_temp" in seen:
            add_flag_event(pidx, "overheating_severe")
        else:
            add_flag_event(pidx, random.choice([
                "engine_blown", "gearbox_failure", "transmission_failure"
            ]))


def tick_pit_road():
    """
    Detect pit road violations for AI cars every tick.
    - Speeding: CarIdxSpeed > pit limit while CarIdxOnPitRoad is True
    - Crew error: random chance during a pit stop (car in stall)
    - Unsafe release: random chance as car exits stall back to pit lane
    - Equipment on lane: random chance during pit stop, may also yellow
    Player speeding is tracked by iRacing itself — we skip the player car.
    Cars already flagged are skipped entirely.
    """
    race    = state["race"]
    pidx    = state["player_car_idx"]
    min_lap = CFG.get("min_lap_for_failures", 3)
    if race["lap_count"] < min_lap:
        return

    try:
        speeds      = ir["CarIdxSpeed"]      or []
        on_pit_road = ir["CarIdxOnPitRoad"]  or []
        surfaces    = ir["CarIdxTrackSurface"] or []
        # CarIdxTrackSurface: 3 = in pit stall, 2 = pit lane
        PIT_STALL   = 3
        PIT_LANE    = 2
        speed_limit = CFG["pit_speed_limit_mps"]
        margin      = CFG["pit_speed_violation_margin"]
    except Exception:
        return

    for d in state["drivers"]:
        idx = d["idx"]
        if idx in race["flagged_cars"]:
            continue
        if idx == pidx:
            continue   # player speeding handled by iRacing natively
        if "pace" in d["name"].lower() or d["car_number"] == "0":
            continue   # never flag the pace car
        if idx >= len(speeds) or idx >= len(on_pit_road) or idx >= len(surfaces):
            continue

        speed       = speeds[idx]
        on_pit      = on_pit_road[idx]
        surface     = surfaces[idx]
        was_on_pit  = race["car_on_pitroad"].get(idx, False)
        was_in_stall = race["car_in_pitstall"].get(idx, False)
        in_stall    = (surface == PIT_STALL)
        in_pit_lane = (surface == PIT_LANE)

        # ── 1. Pit road speeding ─────────────────────────────────────────────
        if on_pit and in_pit_lane and speed is not None and speed > speed_limit + margin:
            # Only flag a fraction of speeders — realistically not every one gets caught
            if random.random() < CFG["pit_speeding_chance"]:
                overage_kmh = (speed - speed_limit) * 3.6
                print(f"[Bridge] 🚨 Pit speeding: {d['name']} #{d['car_number']} "
                      f"{speed*3.6:.1f} km/h (+{overage_kmh:.1f} over limit)")
                add_flag_event(idx, "pit_speeding")
                race["pit_violations"].append({
                    "type": "speeding", "car": d["car_number"], "driver": d["name"],
                    "speed_kmh": round(speed * 3.6, 1), "limit_kmh": round(speed_limit * 3.6, 1),
                    "lap": race["lap_count"],
                })

        # ── 2. Crew error during pit stop ────────────────────────────────────
        elif in_stall and random.random() < CFG["pit_crew_error_chance"]:
            roll = random.random()
            if roll < 0.40:
                # Cross-threaded lug nut / wheel not seated — car must return
                print(f"[Bridge] 🔧 Pit crew error: {d['name']} #{d['car_number']} "
                      f"— wheel issue detected leaving stall")
                add_flag_event(idx, "pit_crew_error")
                race["pit_violations"].append({
                    "type": "crew_error", "car": d["car_number"], "driver": d["name"],
                    "detail": "wheel not properly secured",
                    "lap": race["lap_count"],
                })
            elif roll < 0.65:
                # Equipment on pit lane — may trigger yellow if it reaches racing surface
                print(f"[Bridge] 🔧 Equipment on pit lane: {d['name']} #{d['car_number']}")
                add_flag_event(idx, "pit_equipment")
                race["pit_violations"].append({
                    "type": "equipment", "car": d["car_number"], "driver": d["name"],
                    "detail": "equipment in pit lane",
                    "lap": race["lap_count"],
                })
                # Equipment reaching the track can cause a yellow
                if random.random() < 0.25:
                    add_yellow(random.choice([
                        "equipment on the pit lane apron",
                        "a tire carrier loose on pit road",
                        "debris from a pit stop in the pit lane",
                    ]))
            elif roll < 0.85:
                # Too many crew over the wall
                print(f"[Bridge] 🔧 Too many crew: {d['name']} #{d['car_number']}")
                add_flag_event(idx, "pit_crew_error")
                race["pit_violations"].append({
                    "type": "crew_count", "car": d["car_number"], "driver": d["name"],
                    "detail": "too many crew members over the wall",
                    "lap": race["lap_count"],
                })
            # else: crew error that goes unnoticed — no penalty

        # ── 3. Unsafe release — car exits stall into occupied pit lane ───────
        elif was_in_stall and in_pit_lane and not was_on_pit:
            # Car just exited the stall — check for unsafe release
            if random.random() < CFG["pit_unsafe_release_chance"]:
                print(f"[Bridge] ⚠️  Unsafe release: {d['name']} #{d['car_number']}")
                add_flag_event(idx, "pit_unsafe_release")
                race["pit_violations"].append({
                    "type": "unsafe_release", "car": d["car_number"], "driver": d["name"],
                    "lap": race["lap_count"],
                })

        # Update pit road state
        race["car_on_pitroad"][idx]  = bool(on_pit)
        race["car_in_pitstall"][idx] = in_stall


def tick_flag_detection():
    race = state["race"]
    try:
        car_laps    = ir["CarIdxLap"] or []
        leader_laps = max(car_laps) if car_laps else 0
        prev_laps   = race["lap_count"]
        race["lap_count"] = leader_laps
        new_lap = leader_laps > prev_laps

        sf               = ir["SessionFlags"] or 0
        prev_sf          = race["session_flags_prev"]
        yellow_bit       = 0x0002
        sim_just_yellowed = bool(sf & yellow_bit) and not bool(prev_sf & yellow_bit)
        total = state["race"].get("total_laps", 0)
        if sim_just_yellowed and (total == 0 or leader_laps < total - 1):
            race["yellows"].append({
                "lap": leader_laps,
                "reason": "caution — iRacing sim event",
                "source": "sim",
            })
            race["last_yellow_lap"] = leader_laps
            race["green_laps"]      = 0
            print(f"[Bridge] 🟡 Sim caution lap {leader_laps}")
        race["session_flags_prev"] = sf

        currently_yellow = bool(sf & yellow_bit)
        if not currently_yellow and new_lap:
            race["green_laps"] = race.get("green_laps", 0) + 1
            # Reset per-lap pit tracking on new lap
            race["car_in_pit_this_lap"] = set()

        # ── 1. Random standalone caution ──────────────────────────────────────
        min_lap = CFG["min_lap_for_failures"]
        if new_lap and not currently_yellow and leader_laps >= min_lap:
            laps_since = leader_laps - race["last_yellow_lap"]
            if (laps_since >= CFG["min_green_laps_between_yellows"]
                    and race["green_laps"] >= CFG["min_green_laps_between_yellows"]
                    and random.random() < CFG["yellow_chance_per_lap"]):
                standalone = [
                    "a spin in turns 1 and 2",
                    "contact between two cars in turns 3 and 4",
                    "debris on the front stretch",
                    "debris in turn 3",
                    "a hard hit into the wall",
                    "a car stopped on the backstretch",
                    "sheet metal debris in the corner",
                    "a stalled car blocking the groove",
                    "loose part off a car",
                    "a spin coming to the start/finish line",
                    "a car with a cut tire spinning in traffic",
                    "debris from a broken car scattered across the track",
                    # Weather and unusual events
                    "rain beginning to fall on the racing surface",
                    "an animal on the track",
                    "a medical vehicle responding to a situation in the infield",
                    "debris from an earlier incident collecting in the corner",
                    "a multi-car incident in turn 4",
                    "two cars making hard contact coming to the green",
                    "a car bicycling through the corner and making contact with the wall",
                ]
                add_yellow(random.choice(standalone))

        # ── 2. AI stress + random failures (per new lap) ─────────────────────
        if new_lap:
            tick_ai_stress(car_laps, currently_yellow)

        # ── 3. Pit road simulation handled by tick_pit_road (per-tick) ──────

        # ── 4. Player engine (every tick) ─────────────────────────────────────
        tick_player_engine()

        # ── 5–7. Telemetry checks — only on new green laps ────────────────────
        if not new_lap or currently_yellow:
            return

        speeds     = ir["CarIdxSpeed"]       or []
        surfaces   = ir["CarIdxTrackSurface"] or []
        last_times = ir["CarIdxLastLapTime"]  or []

        for d in state["drivers"]:
            idx = d["idx"]
            if idx in race["flagged_cars"]:
                continue
            speed   = speeds[idx]   if idx < len(speeds)   else None
            surface = surfaces[idx] if idx < len(surfaces) else None
            laptime = last_times[idx] if idx < len(last_times) else None
            if speed is None:
                continue

            # 5. Kerb / excursion
            off_track = (surface == 1)
            was_off   = race["car_offtrack"].get(idx, False)
            if off_track and not was_off:
                if speed < CFG["excursion_speed_threshold"]:
                    add_flag_event(idx, "excursion")
                else:
                    race["kerb_hits"][idx] = race["kerb_hits"].get(idx, 0) + 1
                    if idx == state["player_car_idx"]:
                        race["player_kerb_hits"] += 1
                    hits = race["kerb_hits"][idx]
                    print(f"[Bridge] 🟠 Kerb: {d['name']} #{d['car_number']} hit {hits}")
                    if hits >= CFG["kerb_hits_before_penalty"]:
                        add_flag_event(idx, "kerb_damage")
            race["car_offtrack"][idx] = off_track

            # 6. Pace loss (skip player — handled by engine model)
            if idx == state["player_car_idx"]:
                continue
            if laptime and laptime > 0:
                best      = race["car_best_laps"].get(idx)
                completed = car_laps[idx] if idx < len(car_laps) else 0
                if best is None or laptime < best:
                    race["car_best_laps"][idx] = laptime
                elif best and completed >= CFG["pace_loss_min_laps"]:
                    if laptime / best > (1 + CFG["pace_loss_threshold"]):
                        add_flag_event(idx, "pace_loss")
                race["car_last_laps"][idx] = laptime

        # 7. Contact detection (every tick, not just new laps)
        try:
            live_speeds = ir["CarIdxSpeed"] or []
            live_steers = ir["CarIdxSteer"] or []
            for d in state["drivers"]:
                idx = d["idx"]
                if idx in race["flagged_cars"]:
                    continue
                if idx >= len(live_speeds) or idx >= len(live_steers):
                    continue
                cur_speed = live_speeds[idx]
                cur_steer = live_steers[idx]
                if cur_speed is None or cur_steer is None:
                    continue
                prev_speed = race["car_prev_speed"].get(idx)
                prev_steer = race["car_prev_steer"].get(idx)
                if prev_speed is not None and prev_steer is not None and cur_speed > 5.0:
                    speed_drop  = prev_speed - cur_speed
                    steer_delta = abs(cur_steer - prev_steer)
                    if speed_drop > CFG["contact_speed_drop"] and steer_delta > CFG["contact_steer_spike"]:
                        inc_count = race["car_incidents"].get(idx, 0) + 1
                        race["car_incidents"][idx] = inc_count
                        race["contact_events"].append({
                            "car": d["car_number"], "driver": d["name"],
                            "lap": race["lap_count"],
                            "speed_drop": round(speed_drop, 2),
                            "steer_delta": round(steer_delta, 3),
                            "severity": "hard" if speed_drop > 8.0 else "moderate",
                        })
                        print(f"[Bridge] 💥 Contact: {d['name']} #{d['car_number']} "
                              f"drop={speed_drop:.1f}m/s steer={steer_delta:.2f}rad "
                              f"(incident #{inc_count})")
                        if speed_drop > 8.0 and inc_count >= 3:
                            add_flag_event(idx, "excursion")
                race["car_prev_speed"][idx] = cur_speed
                race["car_prev_steer"][idx] = cur_steer
        except Exception:
            pass

    except Exception as ex:
        print(f"[Bridge] Flag detection error: {ex}")


# ── Main polling loop ──────────────────────────────────────────────────────────

def tick():
    was_connected      = False
    last_session_state = None

    while True:
        try:
            ir.startup()
            connected = ir.is_initialized and ir.is_connected
            if connected:
                try:
                    connected = ir["SessionTick"] is not None
                except Exception:
                    connected = False

            if connected and not was_connected:
                print("[Bridge] iRacing connected.")
                state["connected"]        = True
                state["session_finished"] = False
                state["finish_order"]     = []

                state["race"] = {
                    "lap_count":             0,
                    "last_yellow_lap":       0,
                    "yellows":               [],
                    "black_flags":           [],
                    "pit_violations":        [],
                    "kerb_hits":             {},
                    "car_best_laps":         {},
                    "car_last_laps":         {},
                    "car_offtrack":          {},
                    "car_pitted":            set(),
                    "car_in_pit_this_lap":   set(),
                    "player_kerb_hits":      0,
                    "session_flags_prev":    0,
                    "green_laps":            0,
                    "flagged_cars":          set(),
                    "ai_stress":             {},
                    "ai_max_rpm":            {},
                    "player_stress":         0.0,
                    "player_max_rpm":        0.0,
                    "player_prev_rpm":       0.0,
                    "player_prev_rpm_time":  0.0,
                    "player_warnings_seen":  set(),
                    "car_prev_speed":        {},
                    "car_prev_steer":        {},
                    "car_incidents":         {},
                    "contact_events":        [],
                }

                try:
                    ti = ir["WeekendInfo"]
                    state["track"] = ti.get("TrackDisplayName", "") if ti else ""
                    # Read actual pit speed limit for this track (km/h → m/s)
                    if ti:
                        pit_kmh = ti.get("TrackPitSpeedLimit", 55.0)
                        try:
                            pit_kmh = float(str(pit_kmh).replace(" km/h", "").strip())
                        except (ValueError, TypeError):
                            pit_kmh = 55.0
                        CFG["pit_speed_limit_mps"] = pit_kmh / 3.6
                        print(f"[Bridge] Pit speed limit: {pit_kmh:.0f} km/h "
                              f"({CFG['pit_speed_limit_mps']:.1f} m/s)")
                except Exception:
                    state["track"] = ""

                state["drivers"] = get_driver_list()

                try:
                    di = ir["DriverInfo"]
                    state["player_car_idx"] = di.get("DriverCarIdx", -1) if di else -1
                    player = next(
                        (d for d in state["drivers"] if d["idx"] == state["player_car_idx"]), None
                    )
                    state["player_name"] = player["name"] if player else ""
                except Exception:
                    state["player_car_idx"] = -1
                    state["player_name"]    = ""

                cmd_status = "enabled" if (WIN32_AVAILABLE and CFG["commands_enabled"]) else "disabled"
                print(f"[Bridge] Flag commands: {cmd_status}")
                print(f"[Bridge] Track: {state['track']} | "
                      f"Field: {len(state['drivers'])} drivers")

                # Scale flag rates based on race length — 100 laps is the baseline
                try:
                    si = ir["SessionInfo"]
                    sessions = si.get("Sessions", []) if si else []
                    race_sess = next((s for s in sessions if s.get("SessionType","").lower() == "race"), None)
                    total_laps = int(race_sess.get("SessionLaps", 100)) if race_sess else 100
                except Exception:
                    total_laps = 100
                _lap_scale = max(0.4, min(3.0, 100.0 / max(total_laps, 10)))
                state["race"]["total_laps"] = total_laps
                CFG["yellow_chance_per_lap"]  = 0.035 * _lap_scale
                CFG["ai_base_failure_chance"] = 0.0003 * _lap_scale
                print(f"[Bridge] Race length: {total_laps} laps — scale: {_lap_scale:.2f}x "
                      f"(yellow/lap: {CFG['yellow_chance_per_lap']:.4f})")

            elif not connected and was_connected:
                print("[Bridge] iRacing disconnected.")
                state["connected"] = False

            was_connected = connected

            if connected:
                try:
                    si       = ir["SessionInfo"]
                    sessions = si.get("Sessions", []) if si else []
                    cur_num  = ir["SessionNum"] or 0
                    if cur_num < len(sessions):
                        state["session_type"] = sessions[cur_num].get("SessionType", "")
                except Exception:
                    pass

                # Detect track/session change and refresh driver list
                try:
                    ti = ir["WeekendInfo"]
                    current_track = ti.get("TrackDisplayName", "") if ti else ""
                    if current_track and current_track != state.get("track", ""):
                        print(f"[Bridge] Track changed to: {current_track} — refreshing driver list")
                        state["track"] = current_track
                        state["drivers"] = get_driver_list()
                        state["session_finished"] = False
                        print(f"[Bridge] Field: {len(state['drivers'])} drivers")
                except Exception:
                    pass

                try:
                    ss = ir["SessionState"]
                    state["session_state"] = ss
                except Exception:
                    ss = None

                state["live"].update(get_live_data())

                is_race   = (state["session_type"] or "").lower() == "race"
                is_racing = (ss == 4)
                if is_race and is_racing:
                    tick_flag_detection()

                just_finished = (
                    ss in (5, 6)
                    and last_session_state not in (5, 6)
                    and is_race
                    and not state["session_finished"]
                )

                if just_finished:
                    print("[Bridge] Race finished — reading results.")
                    time.sleep(2)
                    state["finish_order"]     = get_finish_order()
                    state["session_finished"] = True

                    flags = {
                        "yellows":          state["race"]["yellows"],
                        "black_flags":      state["race"]["black_flags"],
                        "pit_violations":   state["race"]["pit_violations"],
                        "yellow_count":     len(state["race"]["yellows"]),
                        "black_flag_count": len(state["race"]["black_flags"]),
                        "pit_violation_count": len(state["race"]["pit_violations"]),
                        "player_kerb_hits": state["race"]["player_kerb_hits"],
                        "player_penalised": any(
                            bf["is_player"] for bf in state["race"]["black_flags"]
                        ),
                    }

                    # Build chronological event log — DNFs and yellows only
                    _events = []
                    for bf in state["race"]["black_flags"]:
                        if bf.get("is_dnf"):
                            _events.append({
                                "lap":    bf["lap"],
                                "type":   "dnf",
                                "car":    bf["car"],
                                "driver": bf["driver"],
                                "reason": bf["reason"],
                            })
                    for y in state["race"]["yellows"]:
                        _events.append({
                            "lap":    y["lap"],
                            "type":   "yellow",
                            "reason": y["reason"],
                            "source": y.get("source", "bridge"),
                        })
                    # Sort by lap; DNFs before yellows on same lap (cause before effect)
                    _events.sort(key=lambda e: (e["lap"], 0 if e["type"] == "dnf" else 1))

                    state["last_result"] = {
                        "track":        state["track"],
                        "finish_order": state["finish_order"],
                        "player_name":  state["player_name"],
                        "field_size":   len(state["finish_order"]),
                        "flags":        flags,
                        "events":       _events,
                        "timestamp":    time.time(),
                    }

                    # Write sidecar for the app to read post-race
                    try:
                        with open(_events_path, 'w', encoding='utf-8') as _ef:
                            json.dump({
                                "track":     state["track"],
                                "timestamp": state["last_result"]["timestamp"],
                                "events":    _events,
                            }, _ef)
                        print(f"[Bridge] Events written: {len(_events)} entries → {_events_path}")
                    except Exception as _ew:
                        print(f"[Bridge] Could not write events file: {_ew}")
                    print(
                        f"[Bridge] {len(state['finish_order'])} drivers. "
                        f"{flags['yellow_count']} cautions. "
                        f"{flags['black_flag_count']} black flags. "
                        f"{flags['pit_violation_count']} pit violations."
                    )

                last_session_state = ss

        except Exception as e:
            print(f"[Bridge] Tick error: {e}")

        time.sleep(1)


# ── HTTP server ────────────────────────────────────────────────────────────────

class Handler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        pass

    def send_json(self, data, status=200):
        def default(o):
            if isinstance(o, set):
                return list(o)
            raise TypeError
        body = json.dumps(data, default=default).encode()
        self.send_response(status)
        self.send_header("Content-Type",   "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]

        if path == "/status":
            cmd_available = WIN32_AVAILABLE and CFG["commands_enabled"]
            self.send_json({
                "connected":          state["connected"],
                "iRacingConnected":   state["connected"],
                "track":              state["track"],
                "session_type":       state["session_type"],
                "session_state":      state["session_state"],
                "session_finished":   state["session_finished"],
                "player_name":        state["player_name"],
                "field_size":         state["live"]["field_size"],
                "under_yellow":       state["live"].get("under_yellow", False),
                "live_cautions":      len(state["race"]["yellows"]),
                "live_black_flags":   len(state["race"]["black_flags"]),
                "live_pit_violations":len(state["race"].get("pit_violations", [])),
                "commands_enabled":   cmd_available,
                "commands_available": WIN32_AVAILABLE,
            })

        elif path == "/live":
            self.send_json({
                "connected":     state["connected"],
                "live":          state["live"],
                "track":         state["track"],
                "lap":           state["race"]["lap_count"],
                "yellows":       len(state["race"]["yellows"]),
                "black_flags":   len(state["race"]["black_flags"]),
                "pit_violations":len(state["race"].get("pit_violations", [])),
                "kerb_hits":     state["race"].get("player_kerb_hits", 0),
                "engine_stress": round(state["race"].get("player_stress", 0.0), 1),
                "player_rpm":    state["live"].get("player_rpm", 0),
            })

        elif path in ("/result", "/results"):
            if state["last_result"]:
                self.send_json({
                    "ok": True,
                    "result": state["last_result"],
                    "drivers": state["last_result"].get("finish_order", []),
                })
            else:
                self.send_json({"ok": False, "reason": "No result available yet."})

        elif path == "/flags":
            bfs = state["race"]["black_flags"]
            self.send_json({
                "yellows":             state["race"]["yellows"],
                "black_flags":         bfs,
                "pit_violations":      state["race"].get("pit_violations", []),
                "yellow_count":        len(state["race"]["yellows"]),
                "black_flag_count":    len(bfs),
                "pit_violation_count": len(state["race"].get("pit_violations", [])),
                "dnf_count":           sum(1 for bf in bfs if bf.get("is_dnf")),
                "player_kerb_hits":    state["race"].get("player_kerb_hits", 0),
                "player_penalised":    any(bf["is_player"] for bf in bfs),
                "player_dnf":          any(bf["is_player"] and bf.get("is_dnf") for bf in bfs),
                "engine_stress":       round(state["race"].get("player_stress", 0.0), 1),
            })

        elif path == "/drivers":
            self.send_json({"drivers": state["drivers"]})

        elif path == "/config":
            self.send_json({k: v for k, v in CFG.items()
                            if not isinstance(v, dict) or k == "penalty_seconds"})

        else:
            self.send_json({"error": "Unknown endpoint"}, 404)

    def do_POST(self):
        path = self.path.split("?")[0]

        if path == "/cmd/yellow" and WIN32_AVAILABLE and CFG["commands_enabled"]:
            add_yellow("manual yellow flag")
            self.send_json({"ok": True, "msg": "FCY issued"})

        elif path == "/cmd/green" and WIN32_AVAILABLE and CFG["commands_enabled"]:
            t = threading.Thread(target=send_chat_command, args=("!advance",), daemon=True)
            t.start()
            self.send_json({"ok": True, "msg": "Green flag issued"})

        elif path == "/cmd/toggle_commands":
            CFG["commands_enabled"] = not CFG["commands_enabled"]
            status = "enabled" if CFG["commands_enabled"] else "disabled"
            print(f"[Bridge] Flag commands {status}")
            self.send_json({"ok": True, "commands_enabled": CFG["commands_enabled"]})

        elif path == "/command":
            try:
                length = int(self.headers.get("Content-Length", 0))
                body   = self.rfile.read(length)
                data   = json.loads(body)
                cmd    = data.get("cmd", "").strip()
                if cmd and WIN32_AVAILABLE and CFG["commands_enabled"]:
                    t = threading.Thread(target=send_chat_command, args=(cmd,), daemon=True)
                    t.start()
                    self.send_json({"ok": True, "cmd": cmd})
                else:
                    self.send_json({"ok": False, "reason": "commands disabled or empty cmd"})
            except Exception as ex:
                self.send_json({"ok": False, "reason": str(ex)}, 400)

        elif path == "/ack":
            state["last_result"]      = None
            state["session_finished"] = False
            self.send_json({"ok": True})

        else:
            self.send_json({"error": "Unknown or unavailable endpoint"}, 404)


def run_server():
    server = HTTPServer(("localhost", 54321), Handler)
    cmd_status = ("✅ ENABLED" if (WIN32_AVAILABLE and CFG["commands_enabled"])
                  else "⚠️  DISABLED (install pywin32)")
    print("[Bridge] Race Weekend Bridge v3 — http://localhost:54321")
    print(f"[Bridge] Flag commands: {cmd_status}")
    print("[Bridge] GET:  /status /live /result /results /flags /drivers /config")
    print("[Bridge] POST: /cmd/yellow | /cmd/green | /cmd/toggle_commands | /command | /ack")
    print("[Bridge] Press Ctrl+C to stop.")
    server.serve_forever()


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Single-instance lock — exit immediately if another bridge is already running
    import socket as _socket
    _lock_sock = _socket.socket(_socket.AF_INET, _socket.SOCK_STREAM)
    try:
        _lock_sock.bind(('localhost', 54321))
    except OSError:
        print("[Bridge] Another instance is already running on port 54321. Exiting.")
        sys.exit(0)
    _lock_sock.close()

    t = threading.Thread(target=tick, daemon=True)
    t.start()
    try:
        run_server()
    except KeyboardInterrupt:
        print("\n[Bridge] Stopped.")