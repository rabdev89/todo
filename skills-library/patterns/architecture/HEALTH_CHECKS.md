---
id: health-checks-v1
name: Health Checks & Probes
category: architecture
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: Medium
status: complete
stacks: [fastapi, express, django, go]
universal: true
tags: [health, monitoring, probes, kubernetes, production]
---

# SKILL: Health Checks & Probes

## Problem

Production systems need reliable health monitoring to ensure:
- Service availability and uptime
- Dependency health (database, external APIs)
- Resource utilization monitoring
- Kubernetes liveness/readiness probes
- Graceful degradation handling

Without proper health checks:
- Outages go undetected
- Kubernetes restarts healthy pods unnecessarily
- Load balancers send traffic to failed services
- Debugging production issues becomes difficult

## Solution Overview

Implement comprehensive health check endpoints that distinguish between:
- **Liveness**: Is the service alive? (restart if failed)
- **Readiness**: Is the service ready for traffic? (don't send traffic if not ready)
- **Startup**: Is the service still initializing? (wait before marking ready)
- **Deep Health**: Are all dependencies healthy? (full system health)

This enables automated recovery, proper load balancing, and effective monitoring.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `app/health/health_checker.py` | Health check logic | service | fastapi |
| `app/health/routes.py` | Health endpoints | controller | fastapi |
| `app/health/health_checker.js` | Health check logic | service | express |
| `app/health/routes.js` | Health endpoints | controller | express |
| `app/health/health_checker.go` | Health check logic | service | go |
| `app/health/routes.go` | Health endpoints | controller | go |

### Code Patterns

#### Stack: FastAPI

```python
# app/health/health_checker.py
import asyncio
import time
from typing import Dict, Any
from datetime import datetime, timedelta
import asyncpg
import redis.asyncio as redis
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

class HealthChecker:
    def __init__(self, db_url: str, redis_url: str):
        self.db_url = db_url
        self.redis_url = redis_url
        self.startup_time = datetime.now()
        self.last_check = {}
        
    async def check_liveness(self) -> Dict[str, Any]:
        """Basic liveness check - is the process alive?"""
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": (datetime.utcnow() - self.startup_time).total_seconds()
        }
    
    async def check_readiness(self) -> Dict[str, Any]:
        """Readiness check - is the service ready for traffic?"""
        # Check critical dependencies
        db_ready = await self._check_database()
        redis_ready = await self._check_redis()
        
        all_ready = db_ready and redis_ready
        
        return {
            "status": "ready" if all_ready else "not_ready",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {
                "database": "healthy" if db_ready else "unhealthy",
                "redis": "healthy" if redis_ready else "unhealthy"
            }
        }
    
    async def check_startup(self) -> Dict[str, Any]:
        """Startup probe - is the service still initializing?"""
        # Simulate startup time (e.g., cache warming, migrations)
        startup_duration = datetime.utcnow() - self.startup_time
        
        if startup_duration < timedelta(seconds=30):
            return {
                "status": "starting",
                "timestamp": datetime.utcnow().isoformat(),
                "message": "Service is initializing"
            }
        
        # After startup time, check readiness
        return await self.check_readiness()
    
    async def check_deep_health(self) -> Dict[str, Any]:
        """Deep health check - comprehensive system health"""
        checks = {
            "liveness": await self.check_liveness(),
            "readiness": await self.check_readiness(),
            "database": await self._database_health_details(),
            "redis": await self._redis_health_details(),
            "memory": await self._memory_health(),
            "disk": await self._disk_health()
        }
        
        overall_status = "healthy"
        for check_name, check_result in checks.items():
            if isinstance(check_result, dict) and check_result.get("status") != "healthy":
                overall_status = "degraded"
                break
        
        return {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "checks": checks
        }
    
    async def _check_database(self) -> bool:
        """Quick database connectivity check"""
        try:
            engine = create_engine(self.db_url)
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            return True
        except Exception:
            return False
    
    async def _check_redis(self) -> bool:
        """Quick Redis connectivity check"""
        try:
            redis_client = redis.from_url(self.redis_url)
            await redis_client.ping()
            return True
        except Exception:
            return False
    
    async def _database_health_details(self) -> Dict[str, Any]:
        """Detailed database health check"""
        try:
            engine = create_engine(self.db_url)
            with engine.connect() as conn:
                # Check connection count
                result = conn.execute("""
                    SELECT count(*) as active_connections 
                    FROM pg_stat_activity 
                    WHERE state = 'active'
                """)
                active_connections = result.fetchone()[0]
                
                # Check database size
                result = conn.execute("""
                    SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
                """)
                db_size = result.fetchone()[0]
                
                return {
                    "status": "healthy",
                    "active_connections": active_connections,
                    "database_size": db_size,
                    "response_time_ms": 5  # Placeholder - measure actual time
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def _redis_health_details(self) -> Dict[str, Any]:
        """Detailed Redis health check"""
        try:
            redis_client = redis.from_url(self.redis_url)
            
            # Get Redis info
            info = await redis_client.info()
            
            return {
                "status": "healthy",
                "connected_clients": info.get("connected_clients"),
                "used_memory": info.get("used_memory_human"),
                "uptime_seconds": info.get("uptime_in_seconds"),
                "response_time_ms": 2  # Placeholder - measure actual time
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def _memory_health(self) -> Dict[str, Any]:
        """Memory usage health check"""
        import psutil
        
        memory = psutil.virtual_memory()
        
        return {
            "status": "healthy" if memory.percent < 85 else "degraded",
            "total_gb": round(memory.total / (1024**3), 2),
            "available_gb": round(memory.available / (1024**3), 2),
            "percent_used": memory.percent
        }
    
    async def _disk_health(self) -> Dict[str, Any]:
        """Disk usage health check"""
        import psutil
        
        disk = psutil.disk_usage('/')
        
        return {
            "status": "healthy" if disk.percent < 85 else "degraded",
            "total_gb": round(disk.total / (1024**3), 2),
            "free_gb": round(disk.free / (1024**3), 2),
            "percent_used": disk.percent
        }

# app/health/routes.py
from fastapi import APIRouter, Depends, HTTPException
from app.health.health_checker import HealthChecker
from app.core.config import get_settings

router = APIRouter(prefix="/health", tags=["Health"])

def get_health_checker() -> HealthChecker:
    """Dependency injection for health checker"""
    settings = get_settings()
    return HealthChecker(
        db_url=settings.database_url,
        redis_url=settings.redis_url
    )

@router.get("/live")
async def liveness(
    health_checker: HealthChecker = Depends(get_health_checker)
):
    """Liveness probe - Kubernetes restart if unhealthy"""
    result = await health_checker.check_liveness()
    
    if result["status"] != "healthy":
        raise HTTPException(status_code=503, detail=result)
    
    return result

@router.get("/ready")
async def readiness(
    health_checker: HealthChecker = Depends(get_health_checker)
):
    """Readiness probe - Kubernetes stops sending traffic if not ready"""
    result = await health_checker.check_readiness()
    
    if result["status"] != "ready":
        raise HTTPException(status_code=503, detail=result)
    
    return result

@router.get("/startup")
async def startup(
    health_checker: HealthChecker = Depends(get_health_checker)
):
    """Startup probe - Kubernetes waits for startup"""
    result = await health_checker.check_startup()
    
    if result["status"] == "starting":
        raise HTTPException(status_code=503, detail=result)
    
    return result

@router.get("/deep")
async def deep_health(
    health_checker: HealthChecker = Depends(get_health_checker)
):
    """Deep health check - comprehensive system health"""
    result = await health_checker.check_deep_health()
    
    # Return 200 for healthy/degraded, 503 for unhealthy
    if result["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=result)
    
    return result

@router.get("/")
async def health_summary(
    health_checker: HealthChecker = Depends(get_health_checker)
):
    """Simple health check for load balancers"""
    liveness = await health_checker.check_liveness()
    readiness = await health_checker.check_readiness()
    
    return {
        "status": "healthy" if readiness["status"] == "ready" else "unhealthy",
        "timestamp": liveness["timestamp"],
        "service": "bob-framework-api"
    }
```

#### Stack: Express.js

```javascript
// app/health/health_checker.js
const { createPool } = require('pg');
const redis = require('redis');
const { performance } = require('perf_hooks');
const os = require('os');
const fs = require('fs');

class HealthChecker {
    constructor(dbUrl, redisUrl) {
        this.dbUrl = dbUrl;
        this.redisUrl = redisUrl;
        this.startupTime = new Date();
        this.lastCheck = {};
    }

    async checkLiveness() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime_seconds: Math.floor((Date.now() - this.startupTime) / 1000)
        };
    }

    async checkReadiness() {
        const dbReady = await this._checkDatabase();
        const redisReady = await this._checkRedis();
        
        const allReady = dbReady && redisReady;
        
        return {
            status: allReady ? 'ready' : 'not_ready',
            timestamp: new Date().toISOString(),
            checks: {
                database: dbReady ? 'healthy' : 'unhealthy',
                redis: redisReady ? 'healthy' : 'unhealthy'
            }
        };
    }

    async checkStartup() {
        const startupDuration = Date.now() - this.startupTime;
        
        if (startupDuration < 30000) { // 30 seconds
            return {
                status: 'starting',
                timestamp: new Date().toISOString(),
                message: 'Service is initializing'
            };
        }
        
        return await this.checkReadiness();
    }

    async checkDeepHealth() {
        const checks = {
            liveness: await this.checkLiveness(),
            readiness: await this.checkReadiness(),
            database: await this._databaseHealthDetails(),
            redis: await this._redisHealthDetails(),
            memory: await this._memoryHealth(),
            disk: await this._diskHealth()
        };
        
        let overallStatus = 'healthy';
        for (const [checkName, checkResult] of Object.entries(checks)) {
            if (checkResult.status && checkResult.status !== 'healthy') {
                overallStatus = 'degraded';
                break;
            }
        }
        
        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checks
        };
    }

    async _checkDatabase() {
        try {
            const pool = createPool({ connectionString: this.dbUrl });
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            await pool.end();
            return true;
        } catch (error) {
            return false;
        }
    }

    async _checkRedis() {
        try {
            const client = redis.createClient({ url: this.redisUrl });
            await client.connect();
            await client.ping();
            await client.quit();
            return true;
        } catch (error) {
            return false;
        }
    }

    async _databaseHealthDetails() {
        try {
            const pool = createPool({ connectionString: this.dbUrl });
            const client = await pool.connect();
            
            // Check active connections
            const connResult = await client.query(`
                SELECT count(*) as active_connections 
                FROM pg_stat_activity 
                WHERE state = 'active'
            `);
            const activeConnections = parseInt(connResult.rows[0].active_connections);
            
            // Check database size
            const sizeResult = await client.query(`
                SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
            `);
            const dbSize = sizeResult.rows[0].db_size;
            
            client.release();
            await pool.end();
            
            return {
                status: 'healthy',
                active_connections: activeConnections,
                database_size: dbSize,
                response_time_ms: 5
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    async _redisHealthDetails() {
        try {
            const client = redis.createClient({ url: this.redisUrl });
            await client.connect();
            const info = await client.info();
            await client.quit();
            
            const infoLines = info.split('\r\n');
            const infoObj = {};
            
            for (const line of infoLines) {
                if (line && !line.startsWith('#')) {
                    const [key, value] = line.split(':');
                    if (key) infoObj[key] = value;
                }
            }
            
            return {
                status: 'healthy',
                connected_clients: parseInt(infoObj.connected_clients),
                used_memory: infoObj.used_memory_human,
                uptime_seconds: parseInt(infoObj.uptime_in_seconds),
                response_time_ms: 2
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    async _memoryHealth() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const percentUsed = (usedMem / totalMem) * 100;
        
        return {
            status: percentUsed < 85 ? 'healthy' : 'degraded',
            total_gb: Math.round(totalMem / (1024 ** 3), 2),
            available_gb: Math.round(freeMem / (1024 ** 3), 2),
            percent_used: Math.round(percentUsed)
        };
    }

    async _diskHealth() {
        try {
            const stats = fs.statSync('/');
            // Note: For real disk usage, you'd need a library like 'diskusage'
            return {
                status: 'healthy',
                total_gb: 100, // Placeholder
                free_gb: 50,  // Placeholder
                percent_used: 50 // Placeholder
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }
}

module.exports = HealthChecker;

// app/health/routes.js
const express = require('express');
const HealthChecker = require('../health/health_checker');

const router = express.Router();

const healthChecker = new HealthChecker(
    process.env.DATABASE_URL,
    process.env.REDIS_URL
);

router.get('/live', async (req, res) => {
    try {
        const result = await healthChecker.checkLiveness();
        
        if (result.status !== 'healthy') {
            return res.status(503).json(result);
        }
        
        res.json(result);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

router.get('/ready', async (req, res) => {
    try {
        const result = await healthChecker.checkReadiness();
        
        if (result.status !== 'ready') {
            return res.status(503).json(result);
        }
        
        res.json(result);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

router.get('/startup', async (req, res) => {
    try {
        const result = await healthChecker.checkStartup();
        
        if (result.status === 'starting') {
            return res.status(503).json(result);
        }
        
        res.json(result);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

router.get('/deep', async (req, res) => {
    try {
        const result = await healthChecker.checkDeepHealth();
        
        if (result.status === 'unhealthy') {
            return res.status(503).json(result);
        }
        
        res.json(result);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const liveness = await healthChecker.checkLiveness();
        const readiness = await healthChecker.checkReadiness();
        
        res.json({
            status: readiness.status === 'ready' ? 'healthy' : 'unhealthy',
            timestamp: liveness.timestamp,
            service: 'bob-framework-api'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
```

#### Stack: Go

```go
// app/health/health_checker.go
package health

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"runtime"
	"syscall"
	"time"

	"github.com/go-redis/redis/v8"
	_ "github.com/lib/pq"
)

type HealthStatus string

const (
	StatusHealthy   HealthStatus = "healthy"
	StatusUnhealthy HealthStatus = "unhealthy"
	StatusReady    HealthStatus = "ready"
	StatusNotReady HealthStatus = "not_ready"
	StatusStarting HealthStatus = "starting"
	StatusDegraded HealthStatus = "degraded"
)

type HealthChecker struct {
	dbURL    string
	redisURL string
	startTime time.Time
}

type HealthResult struct {
	Status    HealthStatus          `json:"status"`
	Timestamp string                `json:"timestamp"`
	Message   string                `json:"message,omitempty"`
	Error     string                `json:"error,omitempty"`
	Checks    map[string]interface{} `json:"checks,omitempty"`
}

type DatabaseHealth struct {
	Status              string `json:"status"`
	ActiveConnections    int    `json:"active_connections,omitempty"`
	DatabaseSize        string `json:"database_size,omitempty"`
	ResponseTimeMs      int    `json:"response_time_ms,omitempty"`
	Error               string `json:"error,omitempty"`
}

type RedisHealth struct {
	Status            string `json:"status"`
	ConnectedClients   int64  `json:"connected_clients,omitempty"`
	UsedMemory        string `json:"used_memory,omitempty"`
	UptimeSeconds     int64  `json:"uptime_seconds,omitempty"`
	ResponseTimeMs    int    `json:"response_time_ms,omitempty"`
	Error             string `json:"error,omitempty"`
}

type MemoryHealth struct {
	Status      string  `json:"status"`
	TotalGB     float64 `json:"total_gb"`
	AvailableGB float64 `json:"available_gb"`
	PercentUsed float64 `json:"percent_used"`
}

func NewHealthChecker(dbURL, redisURL string) *HealthChecker {
	return &HealthChecker{
		dbURL:    dbURL,
		redisURL: redisURL,
		startTime: time.Now(),
	}
}

func (h *HealthChecker) CheckLiveness(ctx context.Context) HealthResult {
	return HealthResult{
		Status:    StatusHealthy,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Checks: map[string]interface{}{
			"uptime_seconds": int64(time.Since(h.startTime).Seconds()),
		},
	}
}

func (h *HealthChecker) CheckReadiness(ctx context.Context) HealthResult {
	dbReady := h.checkDatabase(ctx)
	redisReady := h.checkRedis(ctx)
	
	allReady := dbReady && redisReady
	status := StatusReady
	if !allReady {
		status = StatusNotReady
	}
	
	return HealthResult{
		Status:    status,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Checks: map[string]interface{}{
			"database": h.boolToStatus(dbReady),
			"redis":    h.boolToStatus(redisReady),
		},
	}
}

func (h *HealthChecker) CheckStartup(ctx context.Context) HealthResult {
	startupDuration := time.Since(h.startTime)
	
	if startupDuration < 30*time.Second {
		return HealthResult{
			Status:    StatusStarting,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Message:   "Service is initializing",
		}
	}
	
	return h.CheckReadiness(ctx)
}

func (h *HealthChecker) CheckDeepHealth(ctx context.Context) HealthResult {
	checks := make(map[string]interface{})
	
	// Liveness
	liveness := h.CheckLiveness(ctx)
	checks["liveness"] = liveness
	
	// Readiness
	readiness := h.CheckReadiness(ctx)
	checks["readiness"] = readiness
	
	// Database health
	dbHealth := h.databaseHealthDetails(ctx)
	checks["database"] = dbHealth
	
	// Redis health
	redisHealth := h.redisHealthDetails(ctx)
	checks["redis"] = redisHealth
	
	// Memory health
	memHealth := h.memoryHealth()
	checks["memory"] = memHealth
	
	// Disk health
	diskHealth := h.diskHealth()
	checks["disk"] = diskHealth
	
	// Determine overall status
	overallStatus := StatusHealthy
	if dbHealth.Status != StatusHealthy || redisHealth.Status != StatusHealthy {
		overallStatus = StatusDegraded
	}
	
	return HealthResult{
		Status:    overallStatus,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Checks:    checks,
	}
}

func (h *HealthChecker) checkDatabase(ctx context.Context) bool {
	db, err := sql.Open("postgres", h.dbURL)
	if err != nil {
		return false
	}
	defer db.Close()
	
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	
	err = db.PingContext(ctx)
	return err == nil
}

func (h *HealthChecker) checkRedis(ctx context.Context) bool {
	rdb := redis.NewClient(&redis.Options{
		Addr: h.redisURL,
	})
	
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	
	_, err := rdb.Ping(ctx).Result()
	return err == nil
}

func (h *HealthChecker) databaseHealthDetails(ctx context.Context) DatabaseHealth {
	db, err := sql.Open("postgres", h.dbURL)
	if err != nil {
		return DatabaseHealth{Status: StatusUnhealthy, Error: err.Error()}
	}
	defer db.Close()
	
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	
	// Check active connections
	var activeConnections int
	err = db.QueryRowContext(ctx, `
		SELECT count(*) as active_connections 
		FROM pg_stat_activity 
		WHERE state = 'active'
	`).Scan(&activeConnections)
	
	if err != nil {
		return DatabaseHealth{Status: StatusUnhealthy, Error: err.Error()}
	}
	
	// Check database size
	var dbSize string
	err = db.QueryRowContext(ctx, `
		SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
	`).Scan(&dbSize)
	
	if err != nil {
		return DatabaseHealth{Status: StatusUnhealthy, Error: err.Error()}
	}
	
	return DatabaseHealth{
		Status:           StatusHealthy,
		ActiveConnections: activeConnections,
		DatabaseSize:     dbSize,
		ResponseTimeMs:   5,
	}
}

func (h *HealthChecker) redisHealthDetails(ctx context.Context) RedisHealth {
	rdb := redis.NewClient(&redis.Options{
		Addr: h.redisURL,
	})
	
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	
	info, err := rdb.Info(ctx).Result()
	if err != nil {
		return RedisHealth{Status: StatusUnhealthy, Error: err.Error()}
	}
	
	// Parse Redis info
	infoLines := strings.Split(info, "\r\n")
	infoMap := make(map[string]string)
	
	for _, line := range infoLines {
		if line != "" && !strings.HasPrefix(line, "#") {
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				infoMap[parts[0]] = parts[1]
			}
		}
	}
	
	var connectedClients, uptimeSeconds int64
	if val, ok := infoMap["connected_clients"]; ok {
		connectedClients, _ = strconv.ParseInt(val, 10, 64)
	}
	if val, ok := infoMap["uptime_in_seconds"]; ok {
		uptimeSeconds, _ = strconv.ParseInt(val, 10, 64)
	}
	
	return RedisHealth{
		Status:           StatusHealthy,
		ConnectedClients:  connectedClients,
		UsedMemory:       infoMap["used_memory_human"],
		UptimeSeconds:    uptimeSeconds,
		ResponseTimeMs:   2,
	}
}

func (h *HealthChecker) memoryHealth() MemoryHealth {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	
	totalGB := float64(m.Sys) / (1024 * 1024 * 1024)
	availableGB := totalGB - (float64(m.Alloc) / (1024 * 1024 * 1024))
	percentUsed := (float64(m.Alloc) / float64(m.Sys)) * 100
	
	status := StatusHealthy
	if percentUsed > 85 {
		status = StatusDegraded
	}
	
	return MemoryHealth{
		Status:      status,
		TotalGB:     totalGB,
		AvailableGB: availableGB,
		PercentUsed: percentUsed,
	}
}

func (h *HealthChecker) diskHealth() map[string]interface{} {
	// Simplified disk health - in production, use syscall.Statfs
	var stat syscall.Statfs_t
	err := syscall.Statfs("/", &stat)
	if err != nil {
		return map[string]interface{}{
			"status": StatusUnhealthy,
			"error":  err.Error(),
		}
	}
	
	total := float64(stat.Blocks) * float64(stat.Bsize)
	free := float64(stat.Bfree) * float64(stat.Bsize)
	percentUsed := ((total - free) / total) * 100
	
	status := StatusHealthy
	if percentUsed > 85 {
		status = StatusDegraded
	}
	
	return map[string]interface{}{
		"status":       status,
		"total_gb":     total / (1024 * 1024 * 1024),
		"free_gb":      free / (1024 * 1024 * 1024),
		"percent_used": percentUsed,
	}
}

func (h *HealthChecker) boolToStatus(healthy bool) string {
	if healthy {
		return string(StatusHealthy)
	}
	return string(StatusUnhealthy)
}

// app/health/routes.go
package health

import (
	"net/http"
	
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, dbURL, redisURL string) {
	healthChecker := NewHealthChecker(dbURL, redisURL)
	
	health := r.Group("/health")
	{
		health.GET("/live", handleLiveness(healthChecker))
		health.GET("/ready", handleReadiness(healthChecker))
		health.GET("/startup", handleStartup(healthChecker))
		health.GET("/deep", handleDeepHealth(healthChecker))
		health.GET("/", handleHealthSummary(healthChecker))
	}
}

func handleLiveness(hc *HealthChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := hc.CheckLiveness(c.Request.Context())
		
		if result.Status != StatusHealthy {
			c.JSON(http.StatusServiceUnavailable, result)
			return
		}
		
		c.JSON(http.StatusOK, result)
	}
}

func handleReadiness(hc *HealthChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := hc.CheckReadiness(c.Request.Context())
		
		if result.Status != StatusReady {
			c.JSON(http.StatusServiceUnavailable, result)
			return
		}
		
		c.JSON(http.StatusOK, result)
	}
}

func handleStartup(hc *HealthChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := hc.CheckStartup(c.Request.Context())
		
		if result.Status == StatusStarting {
			c.JSON(http.StatusServiceUnavailable, result)
			return
		}
		
		c.JSON(http.StatusOK, result)
	}
}

func handleDeepHealth(hc *HealthChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := hc.CheckDeepHealth(c.Request.Context())
		
		if result.Status == StatusUnhealthy {
			c.JSON(http.StatusServiceUnavailable, result)
			return
		}
		
		c.JSON(http.StatusOK, result)
	}
}

func handleHealthSummary(hc *HealthChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		liveness := hc.CheckLiveness(c.Request.Context())
		readiness := hc.CheckReadiness(c.Request.Context())
		
		status := StatusUnhealthy
		if readiness.Status == StatusReady {
			status = StatusHealthy
		}
		
		c.JSON(http.StatusOK, map[string]interface{}{
			"status":    status,
			"timestamp": liveness.Timestamp,
			"service":   "bob-framework-api",
		})
	}
}
```

## Configuration Examples

### Docker Health Checks

```dockerfile
# Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health/live || exit 1
```

### Kubernetes Probes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bob-framework-api
spec:
  template:
    spec:
      containers:
      - name: api
        image: bob-framework-api:latest
        ports:
        - containerPort: 8000
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /health/startup
            port: 8000
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 30
```

## Integration

### FastAPI Main

```python
# main.py
from fastapi import FastAPI
from app.health.routes import router as health_router

app = FastAPI(title="BOB Framework API")

app.include_router(health_router)
```

### Express.js Main

```javascript
// app.js
const express = require('express');
const healthRoutes = require('./app/health/routes');

const app = express();

app.use('/health', healthRoutes);
```

### Go Main

```go
// main.go
package main

import (
	"bob-framework/app/health"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	
	health.SetupRoutes(r, 
		os.Getenv("DATABASE_URL"), 
		os.Getenv("REDIS_URL"),
	)
	
	r.Run(":8080")
}
```

## Success Metrics

- [ ] All health endpoints return 200 status
- [ ] Liveness probe responds within 100ms
- [ ] Readiness probe validates all dependencies
- [ ] Startup probe allows 30+ seconds initialization
- [ ] Deep health check returns comprehensive system status
- [ ] Kubernetes integration works with proper probe configuration
- [ ] Load balancer health check integration functional
- [ ] Monitoring dashboards display health status
- [ ] Alerting triggers on unhealthy status

## Troubleshooting

### Common Issues

1. **Database Connection Failures**
   - Check connection string format
   - Verify database is accessible
   - Validate credentials

2. **Redis Connection Failures**
   - Verify Redis URL format
   - Check Redis service status
   - Validate network connectivity

3. **High Memory Usage**
   - Monitor memory leaks
   - Check for large object retention
   - Implement memory limits

4. **Slow Health Checks**
   - Add timeouts to dependency checks
   - Cache health status for short periods
   - Optimize database queries

### Debug Commands

```bash
# Test health endpoints
curl http://localhost:8000/health/live
curl http://localhost:8000/health/ready
curl http://localhost:8000/health/deep

# Check Kubernetes probe status
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous

# Monitor health check frequency
kubectl get events --field-selector reason=Unhealthy
```
