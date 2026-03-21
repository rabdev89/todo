# 🤖 Framework Service Monitoring Rule

> **AI agents MUST ensure framework services are running and healthy.**

## Rule: Hourly Health Check

AI agents **MUST** perform a health check of the framework services every hour of active work.

### 1. The Check Procedure
Every hour, the agent must:
1. Run `make status` (or `ai-engine framework-start` to verify services).
2. Check the timestamp in `.agent/flags/last-status-check.txt`.
3. If the timestamp is older than 60 minutes, or if services are down:
   - Run `make start` to ensure all services are running.
   - Run `make test` to generate a fresh `framework-health.json`.
   - Update `.agent/flags/last-status-check.txt` with the current timestamp.

### 2. Service Recovery
If a service is detected as **DOWN**:
- **Qdrant**: Run `docker run -d --name qdrant -p 6333:6333 qdrant/qdrant` (or `make start`).
- **Ollama**: Inform the human that `ollama serve` needs to be running.
- **SQLite**: Ensure `session_data.db` is accessible.

### 3. Logging
All health checks and recovery actions MUST be logged to `.agent/flags/health-check-log.txt` in the following format:
`[YYYY-MM-DD HH:MM:SS] Status: [HEALTHY/DEGRADED/UNHEALTHY] - Action: [CHECK/RESTART/NONE]`

---

## 🛡️ Enforcement

- Agents are **PROHIBITED** from executing repository-heavy commands (`index-repo`, `search`, `research`) if the last health check failed or is expired.
- If a service restart fails twice, the **Circuit Breaker** must be triggered, and the agent must stop and ask the human for assistance.
