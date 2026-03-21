---
id: background-jobs-v1
name: Background Job Processing
category: architecture
type: pattern
scope: service
version: 1.0.0
last_updated: 2024-03-07
author: framework
difficulty: Medium
status: active
stacks: [fastapi, express, django, go]
universal: false
effectiveness: 0.90
usage_count: 0
tags: [background-jobs, queues, workers, celery, redis, async]
---

# SKILL: Background Job Processing

## Problem

Applications are slow and unresponsive when:
- Long operations block the main request thread
- Email sending happens synchronously during signup
- Image processing delays API responses
- No retry mechanism for failed jobs
- No visibility into job queue health

## Solution Overview

Asynchronous job processing with:
- Task queue (Redis/RabbitMQ) for job distribution
- Worker processes for job execution
- Job priorities and scheduling
- Dead letter queues for failed jobs
- Monitoring and retry logic

## Implementation

### Files to Create

| File | Purpose | Stack |
|------|---------|-------|
| `workers/queue.py` | Queue client and job submission | all |
| `workers/tasks.py` | Task definitions | all |
| `workers/worker.py` | Worker process runner | all |
| `workers/scheduler.py` | Job scheduling (cron-like) | all |
| `api/background.py` | API endpoints for job status | all |

### Code Patterns

#### Stack: FastAPI + Celery + Redis

**Queue Client** (`workers/queue.py`):
```python
from celery import Celery
from typing import Optional, Dict, Any
import os

# Celery app configuration
celery_app = Celery(
    'tasks',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    worker_prefetch_multiplier=1,  # Fair task distribution
)

def submit_task(
    task_name: str,
    args: tuple = (),
    kwargs: Optional[Dict[str, Any]] = None,
    countdown: Optional[int] = None,
    priority: int = 5
) -> str:
    """
    Submit a task to the queue
    
    Args:
        task_name: Name of the task function
        args: Positional arguments
        kwargs: Keyword arguments
        countdown: Delay in seconds before execution
        priority: 0-9 (0 = highest)
    """
    task = celery_app.send_task(
        task_name,
        args=args,
        kwargs=kwargs or {},
        countdown=countdown,
        priority=priority
    )
    return task.id

def get_task_status(task_id: str) -> Dict[str, Any]:
    """Get current status of a task"""
    result = celery_app.AsyncResult(task_id)
    return {
        "id": task_id,
        "status": result.status,
        "result": result.result if result.ready() else None,
        "date_done": result.date_done
    }

def revoke_task(task_id: str, terminate: bool = False):
    """Cancel a pending task"""
    celery_app.control.revoke(task_id, terminate=terminate)
```

**Task Definitions** (`workers/tasks.py`):
```python
from workers.queue import celery_app
from src.services.email_service import EmailService
from src.services.image_service import ImageService
from src.exceptions import ExternalServiceError
import logging

logger = logging.getLogger(__name__)

@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(ExternalServiceError,),
    retry_backoff=True
)
def send_email_task(self, to_email: str, template: str, context: dict):
    """
    Send email asynchronously with retry logic
    
    Args:
        to_email: Recipient email address
        template: Email template name
        context: Template variables
    """
    try:
        email_service = EmailService()
        email_service.send(
            to=to_email,
            template=template,
            context=context
        )
        logger.info(f"Email sent to {to_email}")
        return {"status": "sent", "recipient": to_email}
        
    except Exception as exc:
        logger.error(f"Email failed: {exc}")
        raise self.retry(exc=exc)

@celery_app.task(bind=True, max_retries=2)
def process_image_task(self, image_path: str, operations: list):
    """
    Process image (resize, compress, etc.) asynchronously
    
    Args:
        image_path: Path to source image
        operations: List of operations to apply
    """
    try:
        image_service = ImageService()
        
        # Update task state for progress tracking
        self.update_state(
            state='PROGRESS',
            meta={'current': 0, 'total': len(operations)}
        )
        
        results = []
        for i, operation in enumerate(operations):
            result = image_service.apply_operation(image_path, operation)
            results.append(result)
            
            # Report progress
            self.update_state(
                state='PROGRESS',
                meta={'current': i + 1, 'total': len(operations)}
            )
        
        return {
            "status": "completed",
            "source": image_path,
            "outputs": results
        }
        
    except Exception as exc:
        logger.error(f"Image processing failed: {exc}")
        raise self.retry(exc=exc)

@celery_app.task
def cleanup_old_data_task(days: int = 30):
    """
    Scheduled task to cleanup old data
    Run daily via beat scheduler
    """
    from src.services.cleanup_service import CleanupService
    
    cleanup = CleanupService()
    deleted_count = cleanup.remove_old_records(days=days)
    
    logger.info(f"Cleanup completed: {deleted_count} records deleted")
    return {"deleted": deleted_count}

@celery_app.task(bind=True, max_retries=5)
def external_api_call_task(self, endpoint: str, payload: dict):
    """
    Call external API with retry logic for transient failures
    """
    import requests
    
    try:
        response = requests.post(endpoint, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
        
    except requests.exceptions.RequestException as exc:
        # Retry with exponential backoff
        logger.warning(f"API call failed, retrying: {exc}")
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
```

**Worker Runner** (`workers/worker.py`):
```python
#!/usr/bin/env python
"""
Worker process entry point

Run with:
    python -m workers.worker

Or with Celery CLI:
    celery -A workers.queue worker --loglevel=info --concurrency=4
"""

import os
from workers.queue import celery_app

def start_worker(queues=None, concurrency=4):
    """Start worker process"""
    argv = [
        'worker',
        '--loglevel=info',
        f'--concurrency={concurrency}',
        '--pool=prefork',  # Use processes for CPU-bound tasks
    ]
    
    if queues:
        argv.extend(['-Q', ','.join(queues)])
    
    celery_app.worker_main(argv)

if __name__ == '__main__':
    # Auto-reload in development
    if os.getenv('ENV') == 'development':
        import watchgod
        watchgod.run_process('./workers', start_worker)
    else:
        start_worker()
```

**Scheduler Configuration** (`workers/scheduler.py`):
```python
from celery.schedules import crontab
from workers.queue import celery_app

# Periodic task schedule
celery_app.conf.beat_schedule = {
    'cleanup-old-data': {
        'task': 'workers.tasks.cleanup_old_data_task',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
        'args': (30,),  # Keep 30 days
    },
    'send-daily-reports': {
        'task': 'workers.tasks.send_report_task',
        'schedule': crontab(hour=8, minute=0),  # 8 AM daily
    },
    'health-check': {
        'task': 'workers.tasks.health_check_task',
        'schedule': 300.0,  # Every 5 minutes
    },
}

celery_app.conf.timezone = 'UTC'
```

**API Integration** (`api/background.py`):
```python
from fastapi import APIRouter, BackgroundTasks, HTTPException
from workers.queue import submit_task, get_task_status, revoke_task
from workers.tasks import send_email_task, process_image_task

router = APIRouter(prefix="/background", tags=["background-jobs"])

@router.post("/email")
async def queue_email(
    to: str,
    template: str,
    background_tasks: BackgroundTasks
):
    """
    Queue email for background sending
    FastAPI's BackgroundTasks for simple tasks
    """
    background_tasks.add_task(
        send_email_task.delay,
        to_email=to,
        template=template,
        context={}
    )
    return {"status": "queued"}

@router.post("/tasks/email")
async def submit_email_task(to: str, template: str):
    """
    Submit email task to Celery queue
    For tasks that need retries/persistence
    """
    task_id = submit_task(
        'workers.tasks.send_email_task',
        args=(to, template, {}),
        priority=5
    )
    return {"task_id": task_id, "status": "submitted"}

@router.post("/tasks/image")
async def submit_image_task(image_path: str, operations: list):
    """Submit image processing task"""
    task_id = submit_task(
        'workers.tasks.process_image_task',
        args=(image_path, operations),
        priority=3  # Higher priority
    )
    return {"task_id": task_id, "status": "submitted"}

@router.get("/tasks/{task_id}")
async def get_task(task_id: str):
    """Get task status and result"""
    status = get_task_status(task_id)
    return status

@router.delete("/tasks/{task_id}")
async def cancel_task(task_id: str):
    """Cancel a pending task"""
    revoke_task(task_id)
    return {"status": "revoked"}
```

## Key Principles

1. **Don't Block Requests**: Return immediately, process asynchronously

2. **Retry with Backoff**: Exponential backoff for transient failures

3. **Idempotency**: Jobs should be safe to run multiple times

4. **Visibility**: Track job status, progress, and failures

5. **Graceful Degradation**: Queue down? Fallback to synchronous or queue later

## Integration

- **Error Handling**: error-handling-v1 for job failure handling
- **Logging**: structured-logging-v1 for job audit trails
- **Monitoring**: Track queue depth, processing rates, failures
- **API Layer**: api-design-v1 for job submission endpoints

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No retry logic | Failed jobs lost forever | Configured retries with backoff |
| Blocking on job result | Defeats purpose | Poll status or use webhooks |
| No job timeout | Runaway jobs consume resources | Set task_time_limit |
| No dead letter queue | Failed jobs disappear | Store failed jobs for analysis |

## Validation Checklist

- [ ] Tasks have retry configuration
- [ ] Job status trackable via API
- [ ] Workers have monitoring/health checks
- [ ] Queue has persistence (Redis AOF or RabbitMQ durable)
- [ ] Dead letter queue configured
- [ ] Scheduled tasks (cron) defined
- [ ] Task idempotency verified
- [ ] Worker concurrency tuned

## References

- [Celery Documentation](https://docs.celeryq.dev/)
- [Redis Queue Patterns](https://redis.io/docs/manual/data-types/lists/#pattern-reliable-queue)

## Success Metrics

- **Latency**: API returns in <100ms (async processing)
- **Reliability**: 99.9% job completion rate
- **Retry Success**: 80% of retried jobs succeed
- **Queue Health**: <1000 jobs pending (alert threshold)
