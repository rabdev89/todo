---
id: multi-tenancy-v1
name: Multi-Tenancy
category: architecture
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: High
status: complete
stacks: [nodejs, python, go]
universal: true
tags: [multi-tenancy, saas, architecture, database, security]
---

# SKILL: Multi-Tenancy

## Problem

SaaS applications need to serve multiple customers from a single codebase while maintaining:
- Data isolation between tenants
- Customizable features per tenant
- Scalability to thousands of tenants
- Security and compliance requirements
- Performance under multi-tenant load
- Tenant-specific configurations

Without multi-tenancy:
- Single-tenant applications don't scale efficiently
- Data mixing between customers creates security risks
- High infrastructure costs per customer
- Difficult to customize features per client
- Compliance nightmares (GDPR, HIPAA, etc.)

## Solution Overview

Implement multi-tenancy with:
- **Database Isolation**: Separate schemas or row-level security
- **Tenant Context**: Middleware for tenant identification
- **Configuration Management**: Dynamic tenant settings
- **Security Policies**: Tenant-aware access control
- **Migration Tools**: Tenant data migration capabilities
- **Performance Optimization**: Connection pooling and caching strategies
- **Monitoring**: Per-tenant metrics and logging

This enables scalable, secure SaaS applications with proper data isolation.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `middleware/tenant_middleware.js` | Tenant identification middleware | middleware | nodejs |
| `middleware/tenant_middleware.py` | Tenant identification middleware | middleware | python |
| `middleware/tenant_middleware.go` | Tenant identification middleware | middleware | go |
| `models/tenant.py` | Tenant model definitions | models | python |
| `models/tenant.go` | Tenant model definitions | models | go |
| `database/migrations/tenant_migrations.py` | Multi-tenant migrations | database | python |
| `database/migrations/tenant_migrations.go` | Multi-tenant migrations | database | go |
| `services/tenant_service.py` | Tenant management service | service | python |
| `services/tenant_service.go` | Tenant management service | service | go |
| `config/tenant_config.py` | Tenant configuration | config | python |
| `config/tenant_config.go` | Tenant configuration | config | go |

### Code Patterns

#### Stack: Node.js + Express + PostgreSQL

```javascript
// middleware/tenant_middleware.js
const { Tenant } = require('../models/tenant');

const tenantMiddleware = (options = {}) => {
  return async (req, res, next) => {
    // Extract tenant from subdomain, header, or JWT
    const tenant = await extractTenant(req, options);
    
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }
    
    // Add tenant to request context
    req.tenant = tenant;
    req.tenantId = tenant.id;
    req.tenantConfig = tenant.config;
    
    // Add tenant-aware database connection
    req.db = getTenantDatabase(tenant);
    
    next();
  };
};

async function extractTenant(req, options) {
  // Method 1: Subdomain extraction
  const host = req.headers.host || req.hostname;
  if (host && options.subdomain) {
    const subdomain = host.split('.')[0];
    const tenant = await Tenant.findOne({ where: { subdomain, isActive: true } });
    if (tenant) return tenant;
  }
  
  // Method 2: Header extraction
  if (req.headers['x-tenant-id']) {
    const tenantId = req.headers['x-tenant-id'];
    const tenant = await Tenant.findByPk(tenantId);
    if (tenant && tenant.isActive) return tenant;
  }
  
  // Method 3: JWT token extraction
  if (req.headers.authorization) {
    const token = req.headers.authorization.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const tenant = await Tenant.findByPk(decoded.tenantId);
      if (tenant && tenant.isActive) return tenant;
    } catch (error) {
      // Invalid token
    }
  }
  
  // Method 4: Query parameter extraction
  if (req.query.tenant) {
    const tenant = await Tenant.findOne({ where: { slug: req.query.tenant, isActive: true } });
    if (tenant) return tenant;
  }
  
  // Method 5: Default tenant
  if (options.defaultTenant) {
    const tenant = await Tenant.findOne({ where: { isDefault: true } });
    if (tenant) return tenant;
  }
  
  return null;
}

function getTenantDatabase(tenant) {
  // Return tenant-specific database connection
  const { Pool } = require('pg');
  
  if (tenant.databaseConfig) {
    return new Pool(tenant.databaseConfig);
  }
  
  // Use schema-based connection
  return new Pool({
    host: process.env.DB_HOST,
    database: `tenant_${tenant.id}`,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true'
  });
}

module.exports = tenantMiddleware;

// models/tenant.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  subdomain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  databaseConfig: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  config: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  maxUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  storageQuota: {
    type: DataTypes.BIGINT,
    defaultValue: 1073741824 // 1GB in bytes
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Tenant;

// services/tenant_service.js
const { Tenant } = require('../models/tenant');
const { Op } = require('sequelize');

class TenantService {
  async createTenant(tenantData) {
    try {
      const tenant = await Tenant.create(tenantData);
      await this.setupTenantDatabase(tenant);
      return tenant;
    } catch (error) {
      throw new Error(`Failed to create tenant: ${error.message}`);
    }
  }
  
  async getTenantById(tenantId) {
    return await Tenant.findByPk(tenantId);
  }
  
  async getTenantBySlug(slug) {
    return await Tenant.findOne({ where: { slug, isActive: true } });
  }
  
  async updateTenant(tenantId, updateData) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    
    await tenant.update(updateData);
    return tenant;
  }
  
  async deactivateTenant(tenantId) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    
    await tenant.update({ isActive: false });
    return tenant;
  }
  
  async getTenantStats(tenantId) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    
    // Count users, storage usage, etc.
    return {
      id: tenant.id,
      name: tenant.name,
      userCount: await this.getUserCount(tenantId),
      storageUsed: await this.getStorageUsage(tenantId),
      lastActive: await this.getLastActiveDate(tenantId)
    };
  }
  
  async setupTenantDatabase(tenant) {
    if (tenant.databaseConfig) {
      // Use tenant's custom database configuration
      const { Pool } = require('pg');
      return new Pool(tenant.databaseConfig);
    }
    
    // Create tenant-specific schema
    const { sequelize } = require('../database/connection');
    
    // Import models and create schema
    const models = require('../models');
    Object.values(models).forEach(model => {
      if (model.name !== 'Tenant') {
        model.init(sequelize, {
          schema: `tenant_${tenant.id}`,
          freezeTableName: false
        });
      }
    });
    
    await sequelize.sync();
  }
  
  // Helper methods
  async getUserCount(tenantId) {
    // Implementation depends on your user model
    return 100; // Placeholder
  }
  
  async getStorageUsage(tenantId) {
    // Implementation depends on your storage tracking
    return 1024 * 1024 * 10; // Placeholder
  }
  
  async getLastActiveDate(tenantId) {
    // Implementation depends on your activity tracking
    return new Date();
  }
}

module.exports = TenantService;
```

#### Stack: Python + Django + PostgreSQL

```python
# middleware/tenant_middleware.py
from django.http import HttpResponseForbidden
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from .models import Tenant
import jwt

User = get_user_model()

class TenantMiddleware(MiddlewareMixin):
    def __init__(self, get_response):
        self.get_response = get_response

    def process_request(self, request):
        # Extract tenant from subdomain
        tenant = self.extract_tenant_from_subdomain(request)
        
        if not tenant:
            return HttpResponseForbidden("Tenant not found")
        
        # Add tenant to request
        request.tenant = tenant
        request.tenant_id = tenant.id
        request.tenant_config = tenant.config
        
        return None  # Continue processing

    def extract_tenant_from_subdomain(self, request):
        host = request.get_host()
        if not host:
            return None
        
        subdomain = host.split('.')[0]
        try:
            return Tenant.objects.get(
                subdomain=subdomain,
                is_active=True
            )
        except Tenant.DoesNotExist:
            return None

# models/tenant.py
from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import JSONField

User = get_user_model()

class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    subdomain = models.CharField(max_length=100, blank=True, null=True)
    domain = models.CharField(max_length=255, blank=True, null=True)
    database_config = JSONField(default=dict, blank=True, null=True)
    config = JSONField(default=dict, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    max_users = models.IntegerField(default=100)
    storage_quota = models.BigIntegerField(default=1073741824)  # 1GB
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenants'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name

# services/tenant_service.py
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import Tenant

class TenantService:
    @staticmethod
    def create_tenant(tenant_data):
        try:
            with transaction.atomic():
                tenant = Tenant.objects.create(**tenant_data)
                tenant.setup_tenant_database()
                return tenant
        except Exception as e:
            raise ValidationError(f"Failed to create tenant: {str(e)}")

    @staticmethod
    def get_tenant_by_id(tenant_id):
        try:
            return Tenant.objects.get(id=tenant_id, is_active=True)
        except Tenant.DoesNotExist:
            raise ValidationError("Tenant not found")

    @staticmethod
    def get_tenant_by_slug(slug):
        try:
            return Tenant.objects.get(slug=slug, is_active=True)
        except Tenant.DoesNotExist:
            raise ValidationError("Tenant not found")

    @staticmethod
    def update_tenant(tenant_id, update_data):
        try:
            tenant = Tenant.objects.get(id=tenant_id, is_active=True)
            for key, value in update_data.items():
                setattr(tenant, key, value)
            tenant.save()
            return tenant
        except Tenant.DoesNotExist:
            raise ValidationError("Tenant not found")

    @staticmethod
    def deactivate_tenant(tenant_id):
        try:
            tenant = Tenant.objects.get(id=tenant_id, is_active=True)
            tenant.is_active = False
            tenant.save()
            return tenant
        except Tenant.DoesNotExist:
            raise ValidationError("Tenant not found")

    @staticmethod
    def get_tenant_stats(tenant_id):
        try:
            tenant = Tenant.objects.get(id=tenant_id, is_active=True)
            
            # Get user count for this tenant
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user_count = User.objects.filter(tenant=tenant).count()
            
            return {
                'id': tenant.id,
                'name': tenant.name,
                'user_count': user_count,
                'storage_used': tenant.get_storage_usage(),
                'max_users': tenant.max_users,
                'storage_quota': tenant.storage_quota,
                'created_at': tenant.created_at,
                'updated_at': tenant.updated_at,
            }
        except Tenant.DoesNotExist:
            raise ValidationError("Tenant not found")

# database/migrations/tenant_migrations.py
from django.db import migrations
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def create_tenant_schema(apps, schema_name, tenant_id):
    """Create a separate schema for a tenant"""
    
    # This is a simplified example - in production, you'd want more sophisticated schema management
    class TenantMigration(migrations.Migration):
        dependencies = []
        
        def generate(self):
            # Create tenant-specific tables
            apps.register_model(f'tenant_{tenant_id}', models)
            
    return TenantMigration

# Example migration
class CreateTenantUserTable(migrations.Migration):
    dependencies = []

    def generate(self):
        # Create user table for tenant
        class TenantUser(models.Model):
            user = models.OneToOne(
                settings.AUTH_USER_MODEL,
                on_delete=models.CASCADE,
                related_name='tenant_users'
            )
            tenant = models.ForeignKey(
                'tenants.Tenant',
                on_delete=models.CASCADE,
                related_name='tenant_users'
            )
            
            # Add tenant-aware fields
            class Meta:
                db_table = f'tenant_{self.tenant_id}_users'
                unique_together = [['user', 'tenant']]
```

#### Stack: Go + Gin + PostgreSQL

```go
// middleware/tenant_middleware.go
package middleware

import (
	"context"
	"net/http"
	"strings"
	"database/sql"

	"yourproject/models"
)

type Tenant struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	Config   map[string]interface{} `json:"config"`
	IsActive bool   `json:"isActive"`
}

type TenantContext struct {
	Tenant   *Tenant
	TenantID string
	Config   map[string]interface{}
}

func TenantMiddleware(tenantService TenantService) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Extract tenant from subdomain
		tenant := extractTenantFromRequest(c, tenantService)
		if tenant == nil {
			c.JSON(400, gin.H{"error": "Tenant not found"})
			c.Abort()
			return
		}
		
		// Add tenant to context
		tenantCtx := &TenantContext{
			Tenant:   tenant,
			TenantID: tenant.ID,
			Config:   tenant.Config,
		}
		
		c.Set("tenant", tenantCtx)
		c.Next()
	})
}

func extractTenantFromRequest(c *gin.Context, tenantService TenantService) *Tenant {
	host := c.Request.Host
	if host == "" {
		return nil
	}
	
	// Extract from subdomain
	subdomain := strings.Split(host, ".")[0]
	tenant, err := tenantService.GetTenantBySlug(subdomain)
	if err != nil {
		return nil
	}
	
	return tenant
}

// models/tenant.go
package models

import (
	"database/sql"
	"time"
	"database/sql/driver"
	"github.com/google/uuid"
)

type Tenant struct {
	ID        string    `db:"id"`
	Name      string    `db:"name"`
	Slug      string    `db:"slug"`
	Subdomain string    `db:"subdomain"`
	Domain    string    `db:"domain"`
	Config    string    `db:"config"` // JSON string
	IsActive  bool     `db:"is_active"`
	MaxUsers  int       `db:"max_users"`
	StorageQuota int64    `db:"storage_quota"`
	CreatedAt time.Time   `db:"created_at"`
	UpdatedAt time.Time   `db:"updated_at"`
}

func (t *Tenant) BeforeCreate() error {
	if t.Name == "" {
		return errors.New("name is required")
	}
	if t.Slug == "" {
		return errors.New("slug is required")
	}
	return nil
}

// services/tenant_service.go
package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"yourproject/models"
)

type TenantService struct {
	db *sql.DB
}

func NewTenantService(db *sql.DB) *TenantService {
	return &TenantService{db: db}
}

func (s *TenantService) CreateTenant(ctx context.Context, tenant *Tenant) error {
	// Validate tenant
	if err := tenant.BeforeCreate(); err != nil {
		return err
	}
	
	// Create tenant
	query := `
		INSERT INTO tenants (id, name, slug, subdomain, domain, config, is_active, max_users, storage_quota, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	
	_, err := s.db.ExecContext(ctx, query,
		tenant.ID, tenant.Name, tenant.Slug, tenant.Subdomain, tenant.Domain,
		tenant.Config, tenant.IsActive, tenant.MaxUsers, tenant.StorageQuota,
		time.Now(), time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to create tenant: %w", err)
	}
	
	return nil
}

func (s *TenantService) GetTenantBySlug(slug string) (*Tenant, error) {
	tenant := &Tenant{}
	
	query := `
		SELECT id, name, slug, subdomain, domain, config, is_active, max_users, storage_quota, created_at, updated_at
		FROM tenants
		WHERE slug = $1 AND is_active = true
	`
	
	err := s.db.QueryRowContext(context.Background(), query, &tenant.ID, &tenant.Name, &tenant.Slug, &tenant.Subdomain, &tenant.Domain, &tenant.Config, &tenant.IsActive, &tenant.MaxUsers, &tenant.StorageQuota, &tenant.CreatedAt, &tenant.UpdatedAt).Scan()
	
	if err != nil {
		return nil, err
	}
	
	return tenant, nil
}

func (s *TenantService) GetTenantByID(ctx context.Context, id string) (*Tenant, error) {
	tenant := &Tenant{}
	
	query := `
		SELECT id, name, slug, subdomain, domain, config, is_active, max_users, storage_quota, created_at, updated_at
		FROM tenants
		WHERE id = $1 AND is_active = true
	`
	
	err := s.db.QueryRowContext(ctx, query, &tenant.ID, &tenant.Name, &tenant.Slug, &tenant.Subdomain, &tenant.Domain, &tenant.Config, &tenant.IsActive, &tenant.MaxUsers, &tenant.StorageQuota, &tenant.CreatedAt, &tenant.UpdatedAt).Scan()
	
	if err != nil {
		return nil, err
	}
	
	return tenant, nil
}

func (s *TenantService) GetTenantStats(ctx context.Context, tenantID string) (*TenantStats, error) {
	tenant, err := s.GetTenantByID(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	
	// Get user count for this tenant
	userCount, err := s.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM tenant_users WHERE tenant_id = $1",
		tenantID,
	).Scan()
	
	if err != nil {
		return nil, err
	}
	
	return &TenantStats{
		Tenant: tenant,
		UserCount: userCount,
	}, nil
}

type TenantStats struct {
	Tenant   *Tenant
	UserCount int
}

// database/migrations/tenant_migrations.go
package migrations

import (
	"database/sql"
	"fmt"
	"time"

	"yourproject/models"
)

type TenantMigration struct {
	Version string
	Up      func(*sql.DB) error
	Down    func(*sql.DB) error
}

func CreateTenantSchema(tenantID string) TenantMigration {
	return TenantMigration{
		Version: "1.0.0",
		Up: func(db *sql.DB) error {
			return createTenantTables(db, tenantID)
		},
		Down: func(db *sql.DB) error {
			return dropTenantTables(db, tenantID)
		},
	}
}

func createTenantTables(db *sql.DB, tenantID string) error {
	queries := []string{
		fmt.Sprintf(`
			CREATE TABLE IF NOT EXISTS tenant_%s_users (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				user_id INTEGER NOT NULL,
				tenant_id UUID NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
				UNIQUE (user_id, tenant_id)
			);
		`, tenantID),
		fmt.Sprintf(`
			CREATE TABLE IF NOT EXISTS tenant_%s_posts (
				id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
				tenant_id UUID NOT NULL,
				title VARCHAR(255) NOT NULL,
				content TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
			);
		`, tenantID),
	}
	
	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("failed to create table: %w", err)
		}
	}
	
	return nil
}

func dropTenantTables(db *sql.DB, tenantID string) error {
	queries := []string{
		fmt.Sprintf("DROP TABLE IF EXISTS tenant_%s_users", tenantID),
		fmt.Sprintf("DROP TABLE IF EXISTS tenant_%s_posts", tenantID),
	}
	
	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("failed to drop table: %w", err)
		}
	}
	
	return nil
}
```

## Configuration Examples

### Environment Variables

```bash
# .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=multitenant_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key
DEFAULT_TENANT=default
```

### Database Configuration

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'multitenant_db',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# settings.py
DATABASE_ROUTERS = {
    'tenant': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'tenant_{tenant_id}',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
        'ATOMIC_REQUESTS': True,
    }
}

# settings.py
DATABASE_ROUTERS = {
    'tenant': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'tenant_{tenant_id}',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
        'ATOMIC_REQUESTS': True,
    }
}
```

## Success Metrics

- [ ] Tenant isolation works correctly
- [ ] Dynamic database connections per tenant
- [ ] Tenant configuration management functional
- [ ] Multi-tenant routing works
- [ ] Security policies enforced per tenant
- [ ] Performance under load is acceptable
- [ ] Tenant provisioning and deactivation works

## Troubleshooting

### Common Issues

1. **Database Connection Leaks**
   - Use connection pooling per tenant
   - Ensure proper connection cleanup
   - Monitor connection counts

2. **Tenant Data Mixing**
   - Verify row-level security policies
   - Use proper foreign key constraints
   - Implement tenant-aware query filtering

3. **Performance Issues**
   - Implement database connection pooling
   - Use tenant-specific caching
   - Monitor slow queries per tenant

4. **Configuration Management**
   - Validate tenant configurations
   - Implement configuration versioning
   - Cache frequently accessed configurations

### Debug Commands

```bash
# Test tenant middleware
curl -H "x-tenant-id: tenant123" http://localhost:8000/api/users

# Check tenant database
psql -h localhost -U postgres -d multitenant_db -c "SELECT * FROM tenant_tenant123_users;"

# Test tenant routing
curl -H "Host: tenant123.yourapp.com" http://localhost:8000/api/users
```

## Best Practices

### Database Isolation

1. **Schema Separation**: Use separate schemas per tenant
2. **Row-Level Security**: Add tenant_id to all tables
3. **Connection Pooling**: Use separate pools per tenant
4. **Migration Management**: Version tenant migrations

### Security

1. **Tenant Isolation**: Ensure no cross-tenant data access
2. **Data Encryption**: Encrypt sensitive tenant data
3. **Access Control**: Implement tenant-specific permissions
4. **Audit Logging**: Log all tenant data access

### Performance

1. **Caching Strategy**: Tenant-aware caching
2. **Load Balancing**: Distribute tenants across database instances
3. **Resource Limits**: Enforce per-tenant resource quotas
4. **Monitoring**: Per-tenant performance metrics

### Scalability

1. **Horizontal Scaling**: Add/remove tenant instances
2. **Database Sharding**: Shard tenants across databases
3. **Microservices**: Tenant-specific microservice instances
4. **Serverless Architecture**: Auto-scale based on tenant load
