---
id: file-upload-v1
name: File Upload & Storage
category: architecture
type: pattern
scope: service
version: 1.0.0
last_updated: 2024-03-07
author: framework
difficulty: Medium
status: active
stacks: [fastapi, express, django]
universal: false
effectiveness: 0.90
usage_count: 0
tags: [file-upload, storage, s3, validation, streaming, multipart]
---

# SKILL: File Upload & Storage

## Problem

File handling is problematic because:
- Large files crash the server (memory exhaustion)
- No validation of file types/content
- Uploads block the request thread
- No virus scanning for security
- Storage costs grow unchecked

## Solution Overview

Streaming file uploads with:
- Direct-to-storage streaming (bypass server memory)
- Content validation (magic numbers, not just extensions)
- Async processing for large files
- Virus scanning integration
- Storage lifecycle policies

## Implementation

### Files to Create

| File | Purpose | Stack |
|------|---------|-------|
| `upload/handlers.py` | Upload processing | all |
| `upload/validators.py` | File validation | all |
| `upload/storage.py` | Storage backends (S3, local) | all |
| `upload/security.py` | Virus scan, sanitization | all |

### Code Patterns

#### Stack: FastAPI + S3

**Streaming Upload Handler** (`upload/handlers.py`):
```python
import hashlib
import magic
from typing import AsyncGenerator, Optional
from fastapi import UploadFile, HTTPException
import boto3
import asyncio
from concurrent.futures import ThreadPoolExecutor

CHUNK_SIZE = 1024 * 1024  # 1MB chunks
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
    'text/csv': ['.csv'],
}

class StreamingUploadHandler:
    """
    Handle file uploads with streaming to S3
    
    Features:
    - Streams directly to S3 (no local temp files)
    - Validates content type by magic number
    - Calculates SHA256 hash for deduplication
    - Progress tracking for large uploads
    """
    
    def __init__(self, s3_client=None, bucket: str = None):
        self.s3 = s3_client or boto3.client('s3')
        self.bucket = bucket or "uploads-bucket"
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def handle_upload(
        self,
        file: UploadFile,
        user_id: str,
        allowed_types: dict = None
    ) -> dict:
        """
        Process file upload with validation and streaming
        
        Returns:
            dict with file_id, url, size, hash
        """
        allowed = allowed_types or ALLOWED_TYPES
        
        # 1. Validate file size (early rejection)
        await self._validate_size(file)
        
        # 2. Read first chunk for content validation
        first_chunk = await file.read(CHUNK_SIZE)
        
        # 3. Validate content type (magic number check)
        content_type = magic.from_buffer(first_chunk, mime=True)
        if content_type not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"File type '{content_type}' not allowed"
            )
        
        # 4. Generate unique ID and key
        file_id = self._generate_file_id()
        s3_key = f"uploads/{user_id}/{file_id}"
        
        # 5. Stream to S3 with hash calculation
        file_hash, size = await self._stream_to_s3(
            file, first_chunk, s3_key
        )
        
        # 6. Queue async processing (virus scan, thumbnail, etc.)
        await self._queue_processing(s3_key, content_type)
        
        return {
            "file_id": file_id,
            "original_name": file.filename,
            "content_type": content_type,
            "size": size,
            "sha256": file_hash,
            "url": f"/files/{file_id}",
            "status": "uploaded"
        }
    
    async def _validate_size(self, file: UploadFile):
        """Validate file size without loading entire file"""
        # Check Content-Length header if available
        if hasattr(file, 'size') and file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size: {MAX_FILE_SIZE} bytes"
            )
    
    async def _stream_to_s3(
        self,
        file: UploadFile,
        first_chunk: bytes,
        s3_key: str
    ) -> tuple:
        """
        Stream file chunks to S3
        
        Returns:
            (sha256_hash, total_size)
        """
        hasher = hashlib.sha256()
        hasher.update(first_chunk)
        
        # Use multipart upload for large files
        multipart = self.s3.create_multipart_upload(
            Bucket=self.bucket,
            Key=s3_key,
            ContentType=file.content_type
        )
        upload_id = multipart['UploadId']
        parts = []
        part_num = 1
        
        try:
            # Upload first chunk
            response = self.s3.upload_part(
                Bucket=self.bucket,
                Key=s3_key,
                UploadId=upload_id,
                PartNumber=part_num,
                Body=first_chunk
            )
            parts.append({'PartNumber': part_num, 'ETag': response['ETag']})
            part_num += 1
            
            total_size = len(first_chunk)
            
            # Stream remaining chunks
            while chunk := await file.read(CHUNK_SIZE):
                hasher.update(chunk)
                total_size += len(chunk)
                
                if total_size > MAX_FILE_SIZE:
                    self.s3.abort_multipart_upload(
                        Bucket=self.bucket,
                        Key=s3_key,
                        UploadId=upload_id
                    )
                    raise HTTPException(status_code=413, detail="File too large")
                
                # Run S3 upload in thread pool (non-blocking)
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    self.executor,
                    lambda: self.s3.upload_part(
                        Bucket=self.bucket,
                        Key=s3_key,
                        UploadId=upload_id,
                        PartNumber=part_num,
                        Body=chunk
                    )
                )
                parts.append({'PartNumber': part_num, 'ETag': response['ETag']})
                part_num += 1
            
            # Complete multipart upload
            self.s3.complete_multipart_upload(
                Bucket=self.bucket,
                Key=s3_key,
                UploadId=upload_id,
                MultipartUpload={'Parts': parts}
            )
            
            return hasher.hexdigest(), total_size
            
        except Exception:
            # Cleanup on failure
            self.s3.abort_multipart_upload(
                Bucket=self.bucket,
                Key=s3_key,
                UploadId=upload_id
            )
            raise
    
    async def _queue_processing(self, s3_key: str, content_type: str):
        """Queue async processing (virus scan, etc.)"""
        # Would integrate with background-jobs-v1 skill
        pass
    
    def _generate_file_id(self) -> str:
        """Generate unique file ID"""
        import uuid
        return str(uuid.uuid4())
```

**Content Validation** (`upload/validators.py`):
```python
import magic
import re
from pathlib import Path
from typing import Optional

class FileValidator:
    """
    Validate file uploads for security
    
    Checks:
    - Magic number (actual content type)
    - Extension matches content
    - No path traversal in filename
    - File size limits
    """
    
    DANGEROUS_EXTENSIONS = {
        '.exe', '.dll', '.bat', '.sh', '.php',
        '.jsp', '.asp', '.aspx', '.py', '.rb'
    }
    
    def __init__(self, max_size: int = 100 * 1024 * 1024):
        self.max_size = max_size
    
    def validate_filename(self, filename: str) -> bool:
        """
        Check filename for path traversal and dangerous extensions
        """
        # Normalize path
        path = Path(filename)
        
        # Check for path traversal (..)
        if '..' in filename or not path.name == filename:
            return False
        
        # Check extension
        ext = path.suffix.lower()
        if ext in self.DANGEROUS_EXTENSIONS:
            return False
        
        # No null bytes
        if '\x00' in filename:
            return False
        
        return True
    
    def validate_content_type(
        self,
        file_content: bytes,
        declared_type: str,
        allowed_types: dict
    ) -> tuple[bool, str]:
        """
        Validate content type by magic number
        
        Returns:
            (is_valid, actual_type)
        """
        actual_type = magic.from_buffer(file_content, mime=True)
        
        # Check if actual type is in allowed list
        if actual_type not in allowed_types:
            return False, actual_type
        
        # Verify declared type matches actual
        if declared_type and declared_type != actual_type:
            return False, actual_type
        
        return True, actual_type
    
    def sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename for safe storage
        - Remove path components
        - Keep only safe characters
        - Add random suffix to prevent overwrites
        """
        import uuid
        from pathlib import Path
        
        path = Path(filename)
        name = path.stem
        ext = path.suffix
        
        # Remove dangerous characters
        safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', name)
        
        # Add unique suffix
        unique = str(uuid.uuid4())[:8]
        
        return f"{safe_name}_{unique}{ext}"
```

**Storage Abstraction** (`upload/storage.py`):
```python
from abc import ABC, abstractmethod
from typing import BinaryIO, Optional
import boto3
import os
from pathlib import Path

class StorageBackend(ABC):
    """Abstract storage backend"""
    
    @abstractmethod
    async def upload(
        self,
        file_content: BinaryIO,
        key: str,
        content_type: str
    ) -> str:
        """Upload file and return URL"""
        pass
    
    @abstractmethod
    async def download(self, key: str) -> bytes:
        """Download file content"""
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete file"""
        pass
    
    @abstractmethod
    def get_url(self, key: str, expires: int = 3600) -> str:
        """Get presigned URL for file"""
        pass

class S3Storage(StorageBackend):
    """AWS S3 storage backend"""
    
    def __init__(self, bucket: str = None, region: str = "us-east-1"):
        self.bucket = bucket or os.getenv("S3_BUCKET")
        self.client = boto3.client('s3', region_name=region)
    
    async def upload(
        self,
        file_content: BinaryIO,
        key: str,
        content_type: str
    ) -> str:
        self.client.upload_fileobj(
            file_content,
            self.bucket,
            key,
            ExtraArgs={'ContentType': content_type}
        )
        return f"s3://{self.bucket}/{key}"
    
    async def download(self, key: str) -> bytes:
        response = self.client.get_object(Bucket=self.bucket, Key=key)
        return response['Body'].read()
    
    async def delete(self, key: str) -> bool:
        self.client.delete_object(Bucket=self.bucket, Key=key)
        return True
    
    def get_url(self, key: str, expires: int = 3600) -> str:
        return self.client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': key},
            ExpiresIn=expires
        )

class LocalStorage(StorageBackend):
    """Local filesystem storage (development)"""
    
    def __init__(self, base_path: str = "./uploads"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    async def upload(
        self,
        file_content: BinaryIO,
        key: str,
        content_type: str
    ) -> str:
        path = self.base_path / key
        path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(path, 'wb') as f:
            f.write(file_content.read())
        
        return str(path)
    
    async def download(self, key: str) -> bytes:
        path = self.base_path / key
        return path.read_bytes()
    
    async def delete(self, key: str) -> bool:
        path = self.base_path / key
        if path.exists():
            path.unlink()
            return True
        return False
    
    def get_url(self, key: str, expires: int = None) -> str:
        return f"/local-uploads/{key}"
```

## Key Principles

1. **Stream to Storage**: Don't buffer large files in memory

2. **Validate Early**: Check magic numbers, not just extensions

3. **Sanitize Names**: Prevent path traversal attacks

4. **Async Processing**: Queue virus scans, thumbnailing

5. **Lifecycle Management**: Auto-delete old temp files

## Integration

- **Background Jobs**: background-jobs-v1 for virus scanning
- **Rate Limiting**: rate-limiting-v1 for upload frequency
- **Logging**: structured-logging-v1 for audit trail
- **API**: api-design-v1 for upload endpoints

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Loading entire file | Memory exhaustion | Stream in chunks |
| Trusting file extension | Easy to spoof | Check magic numbers |
| Synchronous processing | Blocks requests | Async queue |
| No size limits | Storage abuse | Enforce max size |

## Validation Checklist

- [ ] Streaming upload (no local buffering)
- [ ] Magic number validation
- [ ] Path traversal protection
- [ ] Size limits enforced
- [ ] Virus scan queued
- [ ] Storage abstraction (S3/local)
- [ ] Lifecycle policies (auto-cleanup)
- [ ] Progress tracking for large files

## References

- [OWASP File Upload Security](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)
- [S3 Multipart Upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)

## Success Metrics

- **Memory**: Constant usage regardless of file size
- **Security**: 0 malicious uploads accepted
- **Performance**: Uploads don't block API
- **Reliability**: 99.9% upload success rate
