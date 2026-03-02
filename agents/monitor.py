#!/usr/bin/env python3
"""
Cockpit Agent Monitor - Phase 2
Status-Übersicht aller Agents und ihrer Sessions
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

REGISTRY_FILE = Path("/data/workspace/cockpit/agents/registry.json")
STATUS_FILE = Path("/data/workspace/cockpit/agents/status.json")

def get_active_sessions():
    """Holt aktive Sessions von OpenClaw."""
    try:
        result = subprocess.run(
            ["openclaw", "sessions", "list", "--json"],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            return json.loads(result.stdout)
    except Exception as e:
        print(f"Fehler beim Abrufen der Sessions: {e}")
    return []

def get_subagents():
    """Holt Subagent-Status."""
    try:
        result = subprocess.run(
            ["openclaw", "subagents", "list"],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout
    except Exception as e:
        return f"Fehler: {e}"

def load_registry():
    """Lädt die Agent-Registry."""
    if REGISTRY_FILE.exists():
        with open(REGISTRY_FILE) as f:
            return json.load(f)
    return {"agents": []}

def generate_status():
    """Generiert den aktuellen Status."""
    registry = load_registry()
    
    status = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "agents": {},
        "summary": {
            "total": len(registry.get("agents", [])),
            "active": 0,
            "idle": 0,
            "busy": 0
        }
    }
    
    for agent in registry.get("agents", []):
        agent_id = agent["id"]
        agent_status = {
            "name": agent["name"],
            "role": agent["role"],
            "model": agent.get("model", "unknown"),
            "status": agent.get("status", "idle"),
            "description": agent.get("description", ""),
            "workspace": agent.get("workspace", ""),
            "session_key": None,
            "last_activity": None
        }
        
        # Prüfe ob eine Session für diesen Agent läuft
        # (In einer vollständigen Implementierung würden wir die Sessions prüfen)
        
        status["agents"][agent_id] = agent_status
        
        if agent_status["status"] == "active":
            status["summary"]["active"] += 1
        elif agent_status["status"] == "busy":
            status["summary"]["busy"] += 1
        else:
            status["summary"]["idle"] += 1
    
    return status

def save_status(status):
    """Speichert den Status."""
    STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATUS_FILE, 'w') as f:
        json.dump(status, f, indent=2)

def print_dashboard(status):
    """Zeigt das Dashboard an."""
    print("\n" + "="*60)
    print("🎮 COCKPIT AGENT MONITOR")
    print("="*60)
    print(f"Zeitstempel: {status['timestamp']}")
    print(f"\n📊 Übersicht: {status['summary']['total']} Agents | "
          f"✅ Aktiv: {status['summary']['active']} | "
          f"⏳ Idle: {status['summary']['idle']} | "
          f"🔥 Busy: {status['summary']['busy']}")
    print("-"*60)
    
    for agent_id, agent in status["agents"].items():
        status_icon = "🔥" if agent["status"] == "busy" else "✅" if agent["status"] == "active" else "⏳"
        print(f"\n{status_icon} {agent['name']} ({agent_id})")
        print(f"   Rolle: {agent['role']}")
        print(f"   Modell: {agent['model']}")
        print(f"   Status: {agent['status']}")
        if agent.get("description"):
            print(f"   Info: {agent['description']}")
    
    print("\n" + "="*60)
    print("Befehle:")
    print("  openclaw sessions list    - Alle Sessions anzeigen")
    print("  openclaw subagents list   - Subagent-Status")
    print("  ./spawn_agent.sh <name>   - Agent starten")
    print("="*60 + "\n")

def main():
    status = generate_status()
    save_status(status)
    print_dashboard(status)
    
    # Speichere auch als HTML für den Browser
    generate_html_dashboard(status)

def generate_html_dashboard(status):
    """Generiert ein HTML-Dashboard."""
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Cockpit Agent Monitor</title>
    <meta http-equiv="refresh" content="30">
    <style>
        body {{ font-family: system-ui, -apple-system, sans-serif; margin: 40px; background: #1a1a2e; color: #eee; }}
        h1 {{ color: #00d4ff; }}
        .summary {{ background: #16213e; padding: 20px; border-radius: 10px; margin: 20px 0; }}
        .agent {{ background: #0f3460; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #00d4ff; }}
        .agent.active {{ border-left-color: #00ff88; }}
        .agent.busy {{ border-left-color: #ff6b6b; }}
        .agent.idle {{ border-left-color: #ffd93d; }}
        .status-badge {{ display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }}
        .status-active {{ background: #00ff88; color: #000; }}
        .status-busy {{ background: #ff6b6b; color: #fff; }}
        .status-idle {{ background: #ffd93d; color: #000; }}
        .timestamp {{ color: #888; font-size: 14px; }}
        .command {{ background: #1a1a2e; padding: 10px; border-radius: 5px; font-family: monospace; margin: 5px 0; }}
    </style>
</head>
<body>
    <h1>🎮 Cockpit Agent Monitor</h1>
    <p class="timestamp">Letztes Update: {status['timestamp']}</p>
    
    <div class="summary">
        <h2>📊 Übersicht</h2>
        <p>
            <strong>Gesamt:</strong> {status['summary']['total']} Agents | 
            <span style="color: #00ff88;">✅ Aktiv: {status['summary']['active']}</span> | 
            <span style="color: #ffd93d;">⏳ Idle: {status['summary']['idle']}</span> | 
            <span style="color: #ff6b6b;">🔥 Busy: {status['summary']['busy']}</span>
        </p>
    </div>
    
    <h2>🤖 Agents</h2>
"""
    
    for agent_id, agent in status["agents"].items():
        status_class = agent["status"]
        html += f"""
    <div class="agent {status_class}">
        <h3>{agent['name']} <span class="status-badge status-{status_class}">{agent['status'].upper()}</span></h3>
        <p><strong>Rolle:</strong> {agent['role']}</p>
        <p><strong>Modell:</strong> {agent['model']}</p>
        <p><strong>Workspace:</strong> <code>{agent['workspace']}</code></p>
        <p>{agent.get('description', '')}</p>
    </div>
"""
    
    html += """
    <div class="summary">
        <h2>🚀 Quick Actions</h2>
        <div class="command">openclaw sessions list</div>
        <div class="command">openclaw subagents list</div>
        <div class="command">openclaw sessions history &lt;session-key&gt;</div>
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setInterval(() => window.location.reload(), 30000);
    </script>
</body>
</html>
"""
    
    html_file = Path("/data/workspace/cockpit/agents/dashboard.html")
    with open(html_file, 'w') as f:
        f.write(html)
    
    print(f"📊 HTML Dashboard erstellt: {html_file}")

if __name__ == "__main__":
    main()
