"""
GraphOps Mock Telemetry Data Generator
=======================================
Generates a realistic corporate network graph with 30+ nodes and 40+ edges.
Node types: User, Endpoint, Server, Firewall, Database, Application, ExternalIP
Edge types: AUTHENTICATED_FROM, HAS_ACCESS_TO, CONNECTS_TO, ROUTES_THROUGH, QUERIES, EXPOSES_SERVICE
"""

import json
import random
from datetime import datetime, timedelta

random.seed(42)

def random_ts(base: datetime, delta_days: int = 30) -> str:
    return (base - timedelta(days=random.randint(0, delta_days),
                              hours=random.randint(0, 23),
                              minutes=random.randint(0, 59))).isoformat()

BASE_TS = datetime(2026, 10, 6, 12, 0, 0)

# ─── NODES ──────────────────────────────────────────────────────────────
nodes = [
    # ── Users (8) ──
    {"id": "usr_jdoe",     "labels": ["User"], "properties": {"username": "jdoe",     "role": "Engineer",        "department": "Engineering",  "privilege_level": "standard", "is_compromised": False, "risk_score": 25}},
    {"id": "usr_asmith",   "labels": ["User"], "properties": {"username": "asmith",   "role": "DevOps Lead",     "department": "Engineering",  "privilege_level": "elevated", "is_compromised": False, "risk_score": 55}},
    {"id": "usr_mbrown",   "labels": ["User"], "properties": {"username": "mbrown",   "role": "DBA",             "department": "Data",         "privilege_level": "admin",    "is_compromised": False, "risk_score": 72}},
    {"id": "usr_clee",     "labels": ["User"], "properties": {"username": "clee",     "role": "SOC Analyst",     "department": "Security",     "privilege_level": "elevated", "is_compromised": False, "risk_score": 30}},
    {"id": "usr_kpatel",   "labels": ["User"], "properties": {"username": "kpatel",   "role": "Intern",          "department": "Engineering",  "privilege_level": "standard", "is_compromised": True,  "risk_score": 95}},
    {"id": "usr_rgarcia",  "labels": ["User"], "properties": {"username": "rgarcia",  "role": "CTO",             "department": "Executive",    "privilege_level": "admin",    "is_compromised": False, "risk_score": 40}},
    {"id": "usr_tnguyen",  "labels": ["User"], "properties": {"username": "tnguyen",  "role": "SRE",             "department": "Engineering",  "privilege_level": "elevated", "is_compromised": False, "risk_score": 48}},
    {"id": "usr_lwilson",  "labels": ["User"], "properties": {"username": "lwilson",  "role": "Finance Manager", "department": "Finance",      "privilege_level": "standard", "is_compromised": False, "risk_score": 20}},

    # ── Endpoints / Workstations (6) ──
    {"id": "ep_ws01",  "labels": ["Endpoint"], "properties": {"hostname": "WS-ENG-01",  "os": "Windows 11",      "ip": "10.10.1.11",  "is_compromised": False, "risk_score": 15, "asset_value": "low"}},
    {"id": "ep_ws02",  "labels": ["Endpoint"], "properties": {"hostname": "WS-ENG-02",  "os": "macOS 15",        "ip": "10.10.1.12",  "is_compromised": False, "risk_score": 15, "asset_value": "low"}},
    {"id": "ep_ws03",  "labels": ["Endpoint"], "properties": {"hostname": "WS-DEVOPS",  "os": "Ubuntu 24.04",    "ip": "10.10.1.20",  "is_compromised": False, "risk_score": 35, "asset_value": "medium"}},
    {"id": "ep_ws04",  "labels": ["Endpoint"], "properties": {"hostname": "WS-SOC-01",  "os": "Windows 11",      "ip": "10.10.2.10",  "is_compromised": False, "risk_score": 10, "asset_value": "medium"}},
    {"id": "ep_ws05",  "labels": ["Endpoint"], "properties": {"hostname": "WS-EXEC-01", "os": "macOS 15",        "ip": "10.10.3.10",  "is_compromised": False, "risk_score": 60, "asset_value": "high"}},
    {"id": "ep_ws06",  "labels": ["Endpoint"], "properties": {"hostname": "WS-FIN-01",  "os": "Windows 11",      "ip": "10.10.4.10",  "is_compromised": False, "risk_score": 45, "asset_value": "medium"}},

    # ── Servers (7) ──
    {"id": "srv_web01",  "labels": ["Server"], "properties": {"hostname": "PROD-WEB-01",    "os": "Ubuntu 24.04",    "ip": "10.20.1.10",  "service": "nginx",      "is_compromised": False, "risk_score": 50, "asset_value": "high"}},
    {"id": "srv_web02",  "labels": ["Server"], "properties": {"hostname": "PROD-WEB-02",    "os": "Ubuntu 24.04",    "ip": "10.20.1.11",  "service": "nginx",      "is_compromised": False, "risk_score": 50, "asset_value": "high"}},
    {"id": "srv_api01",  "labels": ["Server"], "properties": {"hostname": "PROD-API-01",    "os": "Ubuntu 24.04",    "ip": "10.20.2.10",  "service": "fastapi",    "is_compromised": False, "risk_score": 65, "asset_value": "critical"}},
    {"id": "srv_ci",     "labels": ["Server"], "properties": {"hostname": "CI-JENKINS",     "os": "Ubuntu 22.04",    "ip": "10.20.3.10",  "service": "jenkins",    "is_compromised": False, "risk_score": 70, "asset_value": "high"}},
    {"id": "srv_k8s",    "labels": ["Server"], "properties": {"hostname": "K8S-MASTER",     "os": "Ubuntu 24.04",    "ip": "10.20.4.10",  "service": "kubernetes", "is_compromised": False, "risk_score": 85, "asset_value": "critical"}},
    {"id": "srv_ldap",   "labels": ["Server"], "properties": {"hostname": "CORP-LDAP",      "os": "CentOS 9",        "ip": "10.20.5.10",  "service": "openldap",   "is_compromised": False, "risk_score": 80, "asset_value": "critical"}},
    {"id": "srv_vpn",    "labels": ["Server"], "properties": {"hostname": "VPN-GW-01",      "os": "pfSense",         "ip": "10.20.6.10",  "service": "openvpn",    "is_compromised": False, "risk_score": 75, "asset_value": "critical"}},

    # ── Databases (3) ──
    {"id": "db_pg01",   "labels": ["Database"], "properties": {"hostname": "PG-PROD-01",  "engine": "PostgreSQL 16", "ip": "10.30.1.10", "contains_pii": True,  "is_compromised": False, "risk_score": 90, "asset_value": "critical"}},
    {"id": "db_mongo",  "labels": ["Database"], "properties": {"hostname": "MONGO-LOGS",  "engine": "MongoDB 7",     "ip": "10.30.1.20", "contains_pii": False, "is_compromised": False, "risk_score": 40, "asset_value": "medium"}},
    {"id": "db_redis",  "labels": ["Database"], "properties": {"hostname": "REDIS-CACHE", "engine": "Redis 7",       "ip": "10.30.1.30", "contains_pii": False, "is_compromised": False, "risk_score": 35, "asset_value": "medium"}},

    # ── Firewalls / Network Appliances (2) ──
    {"id": "fw_ext",   "labels": ["Firewall"], "properties": {"hostname": "FW-EXTERNAL", "ip": "10.0.0.1",   "zone": "perimeter",  "is_compromised": False, "risk_score": 60, "asset_value": "critical"}},
    {"id": "fw_int",   "labels": ["Firewall"], "properties": {"hostname": "FW-INTERNAL", "ip": "10.10.0.1",  "zone": "internal",   "is_compromised": False, "risk_score": 45, "asset_value": "high"}},

    # ── Applications (2) ──
    {"id": "app_siem",   "labels": ["Application"], "properties": {"name": "Splunk SIEM",    "version": "9.2",  "is_compromised": False, "risk_score": 30, "asset_value": "high"}},
    {"id": "app_jira",   "labels": ["Application"], "properties": {"name": "Jira Cloud",     "version": "9.12", "is_compromised": False, "risk_score": 20, "asset_value": "medium"}},

    # ── External IPs (threat actors / C2) (3) ──
    {"id": "ext_c2_01",  "labels": ["ExternalIP"], "properties": {"ip": "198.51.100.23",  "geo": "RU", "threat_intel": "Known C2",         "is_compromised": True, "risk_score": 100, "asset_value": "threat"}},
    {"id": "ext_c2_02",  "labels": ["ExternalIP"], "properties": {"ip": "203.0.113.45",   "geo": "CN", "threat_intel": "Scanning Host",    "is_compromised": True, "risk_score": 85,  "asset_value": "threat"}},
    {"id": "ext_cdn",    "labels": ["ExternalIP"], "properties": {"ip": "104.16.132.229", "geo": "US", "threat_intel": "Cloudflare CDN",   "is_compromised": False, "risk_score": 5,  "asset_value": "low"}},
]

# ─── EDGES ──────────────────────────────────────────────────────────────
edge_id = 0
def mk_edge(src, tgt, rel_type, props=None):
    global edge_id
    edge_id += 1
    base = {
        "id": f"rel_{edge_id}",
        "source": src,
        "target": tgt,
        "type": rel_type,
        "properties": {
            "timestamp": random_ts(BASE_TS),
            "confidence": round(random.uniform(0.6, 1.0), 2),
            **(props or {})
        }
    }
    return base

edges = [
    # ── Users → Endpoints (AUTHENTICATED_FROM) ──
    mk_edge("usr_jdoe",    "ep_ws01",   "AUTHENTICATED_FROM", {"auth_method": "SSO"}),
    mk_edge("usr_asmith",  "ep_ws03",   "AUTHENTICATED_FROM", {"auth_method": "SSH_KEY"}),
    mk_edge("usr_mbrown",  "ep_ws02",   "AUTHENTICATED_FROM", {"auth_method": "SSO"}),
    mk_edge("usr_clee",    "ep_ws04",   "AUTHENTICATED_FROM", {"auth_method": "MFA"}),
    mk_edge("usr_kpatel",  "ep_ws01",   "AUTHENTICATED_FROM", {"auth_method": "PASSWORD"}),  # compromised intern on shared workstation
    mk_edge("usr_rgarcia", "ep_ws05",   "AUTHENTICATED_FROM", {"auth_method": "MFA"}),
    mk_edge("usr_tnguyen", "ep_ws03",   "AUTHENTICATED_FROM", {"auth_method": "SSH_KEY"}),
    mk_edge("usr_lwilson", "ep_ws06",   "AUTHENTICATED_FROM", {"auth_method": "SSO"}),

    # ── Users → Servers / Apps (HAS_ACCESS_TO) ──
    mk_edge("usr_asmith",  "srv_ci",    "HAS_ACCESS_TO",  {"permission": "admin"}),
    mk_edge("usr_asmith",  "srv_k8s",   "HAS_ACCESS_TO",  {"permission": "admin"}),
    mk_edge("usr_mbrown",  "db_pg01",   "HAS_ACCESS_TO",  {"permission": "dba"}),
    mk_edge("usr_mbrown",  "db_mongo",  "HAS_ACCESS_TO",  {"permission": "read_write"}),
    mk_edge("usr_clee",    "app_siem",  "HAS_ACCESS_TO",  {"permission": "analyst"}),
    mk_edge("usr_rgarcia", "srv_k8s",   "HAS_ACCESS_TO",  {"permission": "viewer"}),
    mk_edge("usr_tnguyen", "srv_k8s",   "HAS_ACCESS_TO",  {"permission": "admin"}),
    mk_edge("usr_tnguyen", "srv_ci",    "HAS_ACCESS_TO",  {"permission": "admin"}),
    mk_edge("usr_kpatel",  "app_jira",  "HAS_ACCESS_TO",  {"permission": "user"}),
    mk_edge("usr_jdoe",    "app_jira",  "HAS_ACCESS_TO",  {"permission": "user"}),

    # ── Endpoints → Servers (CONNECTS_TO) ──
    mk_edge("ep_ws01",  "srv_web01",  "CONNECTS_TO", {"port": 443, "protocol": "HTTPS"}),
    mk_edge("ep_ws03",  "srv_ci",     "CONNECTS_TO", {"port": 8080, "protocol": "HTTP"}),
    mk_edge("ep_ws03",  "srv_k8s",    "CONNECTS_TO", {"port": 6443, "protocol": "HTTPS"}),
    mk_edge("ep_ws04",  "app_siem",   "CONNECTS_TO", {"port": 8089, "protocol": "HTTPS"}),
    mk_edge("ep_ws05",  "srv_vpn",    "CONNECTS_TO", {"port": 1194, "protocol": "UDP"}),

    # ── Servers → Databases (QUERIES) ──
    mk_edge("srv_api01", "db_pg01",   "QUERIES",  {"query_type": "SELECT/INSERT", "avg_qps": 1200}),
    mk_edge("srv_api01", "db_redis",  "QUERIES",  {"query_type": "GET/SET",       "avg_qps": 8500}),
    mk_edge("srv_web01", "srv_api01", "CONNECTS_TO", {"port": 8000, "protocol": "HTTP"}),
    mk_edge("srv_web02", "srv_api01", "CONNECTS_TO", {"port": 8000, "protocol": "HTTP"}),
    mk_edge("srv_ci",    "db_mongo",  "QUERIES",  {"query_type": "INSERT",        "avg_qps": 50}),

    # ── Network Topology (ROUTES_THROUGH) ──
    mk_edge("fw_ext",    "fw_int",     "ROUTES_THROUGH", {"rule": "allow_internal"}),
    mk_edge("fw_ext",    "srv_vpn",    "ROUTES_THROUGH", {"rule": "vpn_passthrough"}),
    mk_edge("fw_int",    "srv_web01",  "ROUTES_THROUGH", {"rule": "dmz_to_web"}),
    mk_edge("fw_int",    "srv_web02",  "ROUTES_THROUGH", {"rule": "dmz_to_web"}),
    mk_edge("fw_int",    "srv_ldap",   "ROUTES_THROUGH", {"rule": "auth_traffic"}),
    mk_edge("srv_vpn",   "fw_int",     "ROUTES_THROUGH", {"rule": "vpn_to_internal"}),

    # ── Server → Server (CONNECTS_TO) ──
    mk_edge("srv_k8s",   "srv_api01",  "CONNECTS_TO", {"port": 8000, "protocol": "HTTP", "reason": "pod_orchestration"}),
    mk_edge("srv_ci",    "srv_k8s",    "CONNECTS_TO", {"port": 6443, "protocol": "HTTPS", "reason": "cd_pipeline"}),
    mk_edge("srv_ldap",  "srv_vpn",    "CONNECTS_TO", {"port": 389,  "protocol": "LDAP", "reason": "auth_backend"}),

    # ── External threat paths ──
    mk_edge("ext_c2_01", "fw_ext",    "CONNECTS_TO", {"port": 443,  "protocol": "HTTPS", "alert": "suspicious_beacon"}),
    mk_edge("ext_c2_02", "fw_ext",    "CONNECTS_TO", {"port": 22,   "protocol": "SSH",   "alert": "brute_force_attempt"}),
    mk_edge("ext_cdn",   "srv_web01", "CONNECTS_TO", {"port": 443,  "protocol": "HTTPS", "reason": "cdn_origin_pull"}),

    # ── Lateral movement path (the attack chain from compromised intern) ──
    mk_edge("ep_ws01",  "srv_ldap",   "CONNECTS_TO",    {"port": 389, "protocol": "LDAP", "alert": "credential_dump_attempt"}),
    mk_edge("srv_ldap", "srv_k8s",    "HAS_ACCESS_TO",  {"permission": "service_account", "alert": "privilege_escalation"}),

    # ── Services exposed externally ──
    mk_edge("srv_web01", "fw_ext",  "EXPOSES_SERVICE", {"port": 443, "service": "public_website"}),
    mk_edge("srv_vpn",   "fw_ext",  "EXPOSES_SERVICE", {"port": 1194, "service": "vpn_gateway"}),
]

# ─── WRITE OUTPUT ───────────────────────────────────────────────────────
graph_data = {
    "metadata": {
        "generated_at": BASE_TS.isoformat(),
        "description": "GraphOps mock corporate network telemetry",
        "node_count": len(nodes),
        "edge_count": len(edges)
    },
    "nodes": nodes,
    "edges": edges
}

output_path = __file__.replace("generate_mock_data.py", "network_graph.json")
with open(output_path, "w") as f:
    json.dump(graph_data, f, indent=2)

print(f"[OK] Generated {len(nodes)} nodes and {len(edges)} edges -> {output_path}")
