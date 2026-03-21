---
id: database-migrations-v1
name: Database Migration Strategies
category: database
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: Medium
status: complete
stacks: [fastapi, express, django, go]
universal: true
tags: [database, migrations, alembic, sqlalchemy, postgres, versioning]
---

# SKILL: Database Migration Strategies

## Problem

Applications need database schema evolution while maintaining:
- Data integrity during migrations
- Zero-downtime deployments
- Rollback capabilities
- Team collaboration on schema changes
- Production safety

Without proper migration strategies:
- Schema changes cause downtime
- Data corruption or loss occurs
- Rollbacks are impossible
- Multiple developers conflict on changes
- Production deployments become high-risk

## Solution Overview

Implement version-controlled database migrations with:
- **Forward migrations**: Apply schema changes incrementally
- **Rollback migrations**: Revert changes safely
- **Dry-run mode**: Preview changes before applying
- **Transaction safety**: All-or-nothing migrations
- **Environment isolation**: Dev/staging/prod separation
- **Automated testing**: Validate migrations in isolated environments

This enables safe, predictable schema evolution with zero downtime.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `migrations/env.py` | Alembic configuration | infrastructure | fastapi |
| `migrations/script.py.mako` | Migration template | infrastructure | fastapi |
| `migrations/versions/001_initial.py` | Initial schema | infrastructure | fastapi |
| `app/core/database.py` | Database connection | infrastructure | fastapi |
| `migrations/migrate.js` | Migration runner | infrastructure | express |
| `migrations/migrations/001_initial.sql` | SQL migrations | infrastructure | express |
| `migrations/migrate.go` | Migration runner | infrastructure | go |
| `migrations/migrations/001_initial.up.sql` | Up migration | infrastructure | go |
| `migrations/migrations/001_initial.down.sql` | Down migration | infrastructure | go |

### Code Patterns

#### Stack: FastAPI (Alembic)

```python
# migrations/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
from dotenv import load_dotenv

load_dotenv()

# Import your models
from app.models import Base

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the SQLAlchemy URL from environment
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

# Add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.
    
    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well. By skipping the Engine
    creation we don't even need a DBAPI to be available.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode.
    
    In this scenario we need to create an Engine and associate a connection
    with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

# migrations/script.py.mako
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}

def upgrade() -> None:
    ${upgrades if upgrades else "pass"}

def downgrade() -> None:
    ${downgrades if downgrades else "pass"}

# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=os.getenv("DEBUG", "false").lower() == "true"
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Dependency for database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database with all tables"""
    Base.metadata.create_all(bind=engine)

# Migration management commands
def create_migration(message: str):
    """Create a new migration"""
    import subprocess
    import os
    
    # Change to migrations directory
    os.chdir("migrations")
    
    # Run alembic revision
    result = subprocess.run([
        "alembic", "revision", "--autogenerate", "-m", message
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error creating migration: {result.stderr}")
        return False
    
    print(f"Migration created: {result.stdout}")
    return True

def upgrade_database(revision: str = "head"):
    """Upgrade database to specific revision"""
    import subprocess
    import os
    
    os.chdir("migrations")
    
    result = subprocess.run([
        "alembic", "upgrade", revision
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error upgrading database: {result.stderr}")
        return False
    
    print(f"Database upgraded to: {revision}")
    return True

def downgrade_database(revision: str):
    """Downgrade database to specific revision"""
    import subprocess
    import os
    
    os.chdir("migrations")
    
    result = subprocess.run([
        "alembic", "downgrade", revision
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error downgrading database: {result.stderr}")
        return False
    
    print(f"Database downgraded to: {revision}")
    return True

def get_current_revision():
    """Get current database revision"""
    import subprocess
    import os
    
    os.chdir("migrations")
    
    result = subprocess.run([
        "alembic", "current"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error getting current revision: {result.stderr}")
        return None
    
    return result.stdout.strip()

def get_migration_history():
    """Get migration history"""
    import subprocess
    import os
    
    os.chdir("migrations")
    
    result = subprocess.run([
        "alembic", "history", "--verbose"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error getting migration history: {result.stderr}")
        return None
    
    return result.stdout

# Example migration: migrations/versions/001_create_users_table.py
"""Create users table

Revision ID: 001
Revises: 
Create Date: 2024-03-07 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_created_at', 'users', ['created_at'])

def downgrade() -> None:
    # Drop indexes first
    op.drop_index('ix_users_created_at', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    
    # Drop table
    op.drop_table('users')
```

#### Stack: Express.js (Node.js)

```javascript
// migrations/migrate.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class MigrationManager {
    constructor(databaseUrl) {
        this.pool = new Pool({
            connectionString: databaseUrl,
            max: 1, // Use single connection for migrations
        });
        this.migrationsDir = path.join(__dirname, 'migrations');
    }

    async initialize() {
        // Create migrations table if it doesn't exist
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                version VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    async createMigration(name) {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
        const version = `${timestamp}_${name}`;
        
        const upSql = `-- Migration: ${version}\n-- Up\n\n-- Add your SQL here\n`;
        const downSql = `-- Migration: ${version}\n-- Down\n\n-- Add rollback SQL here\n`;
        
        const upFile = path.join(this.migrationsDir, `${version}.up.sql`);
        const downFile = path.join(this.migrationsDir, `${version}.down.sql`);
        
        fs.writeFileSync(upFile, upSql);
        fs.writeFileSync(downFile, downSql);
        
        console.log(`Created migration files:\n  ${upFile}\n  ${downFile}`);
        return version;
    }

    async getAppliedMigrations() {
        const result = await this.pool.query(
            'SELECT version FROM schema_migrations ORDER BY version'
        );
        return result.rows.map(row => row.version);
    }

    async getPendingMigrations() {
        const applied = await this.getAppliedMigrations();
        const allMigrations = await this.getAllMigrationFiles();
        
        return allMigrations.filter(migration => !applied.includes(migration));
    }

    async getAllMigrationFiles() {
        const files = fs.readdirSync(this.migrationsDir);
        const upFiles = files
            .filter(file => file.endsWith('.up.sql'))
            .map(file => file.replace('.up.sql', ''))
            .sort();
        
        return upFiles;
    }

    async migrate(targetVersion = null) {
        const startTime = performance.now();
        
        await this.initialize();
        
        const pendingMigrations = await this.getPendingMigrations();
        
        if (pendingMigrations.length === 0) {
            console.log('No pending migrations');
            return true;
        }

        console.log(`Found ${pendingMigrations.length} pending migrations`);
        
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            for (const migration of pendingMigrations) {
                if (targetVersion && migration > targetVersion) {
                    break;
                }
                
                console.log(`Applying migration: ${migration}`);
                
                // Read and execute up migration
                const upFile = path.join(this.migrationsDir, `${migration}.up.sql`);
                const upSql = fs.readFileSync(upFile, 'utf8');
                
                await client.query(upSql);
                
                // Record migration
                await client.query(
                    'INSERT INTO schema_migrations (version) VALUES ($1)',
                    [migration]
                );
                
                console.log(`✓ Applied migration: ${migration}`);
            }
            
            await client.query('COMMIT');
            
            const duration = (performance.now() - startTime).toFixed(2);
            console.log(`Migration completed in ${duration}ms`);
            
            return true;
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Migration failed:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async rollback(targetVersion) {
        const startTime = performance.now();
        
        await this.initialize();
        
        const appliedMigrations = await this.getAppliedMigrations();
        
        if (appliedMigrations.length === 0) {
            console.log('No migrations to rollback');
            return true;
        }

        // Find migrations to rollback
        const toRollback = [];
        for (let i = appliedMigrations.length - 1; i >= 0; i--) {
            const migration = appliedMigrations[i];
            toRollback.push(migration);
            
            if (migration === targetVersion) {
                break;
            }
        }

        if (toRollback.length === 0) {
            console.log(`No migrations to rollback to version: ${targetVersion}`);
            return true;
        }

        console.log(`Rolling back ${toRollback.length} migrations`);
        
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            for (const migration of toRollback) {
                console.log(`Rolling back migration: ${migration}`);
                
                // Read and execute down migration
                const downFile = path.join(this.migrationsDir, `${migration}.down.sql`);
                const downSql = fs.readFileSync(downFile, 'utf8');
                
                await client.query(downSql);
                
                // Remove migration record
                await client.query(
                    'DELETE FROM schema_migrations WHERE version = $1',
                    [migration]
                );
                
                console.log(`✓ Rolled back migration: ${migration}`);
            }
            
            await client.query('COMMIT');
            
            const duration = (performance.now() - startTime).toFixed(2);
            console.log(`Rollback completed in ${duration}ms`);
            
            return true;
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Rollback failed:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async getCurrentVersion() {
        await this.initialize();
        
        const result = await this.pool.query(
            'SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1'
        );
        
        return result.rows[0] ? result.rows[0].version : null;
    }

    async getMigrationHistory() {
        await this.initialize();
        
        const result = await this.pool.query(
            'SELECT version, applied_at FROM schema_migrations ORDER BY applied_at'
        );
        
        return result.rows;
    }

    async dryRun() {
        const pendingMigrations = await this.getPendingMigrations();
        
        console.log('Dry run - pending migrations:');
        
        for (const migration of pendingMigrations) {
            const upFile = path.join(this.migrationsDir, `${migration}.up.sql`);
            const upSql = fs.readFileSync(upFile, 'utf8');
            
            console.log(`\n--- Migration: ${migration} ---`);
            console.log(upSql);
            console.log('--- End Migration ---\n');
        }
    }
}

// CLI interface
async function main() {
    const command = process.argv[2];
    const arg = process.argv[3];
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL environment variable is required');
        process.exit(1);
    }
    
    const manager = new MigrationManager(databaseUrl);
    
    switch (command) {
        case 'create':
            if (!arg) {
                console.error('Migration name is required');
                process.exit(1);
            }
            await manager.createMigration(arg);
            break;
            
        case 'up':
        case 'migrate':
            await manager.migrate(arg);
            break;
            
        case 'down':
        case 'rollback':
            if (!arg) {
                console.error('Target version is required for rollback');
                process.exit(1);
            }
            await manager.rollback(arg);
            break;
            
        case 'current':
            const current = await manager.getCurrentVersion();
            console.log('Current version:', current || 'No migrations applied');
            break;
            
        case 'history':
            const history = await manager.getMigrationHistory();
            console.log('Migration History:');
            history.forEach(row => {
                console.log(`  ${row.version} - ${row.applied_at}`);
            });
            break;
            
        case 'dry-run':
            await manager.dryRun();
            break;
            
        default:
            console.log(`
Usage: node migrate.js <command> [args]

Commands:
  create <name>    Create a new migration
  up [version]      Run pending migrations (to specific version)
  down <version>    Rollback to specific version
  current           Show current migration version
  history           Show migration history
  dry-run           Show pending migrations without executing
            `);
    }
    
    await manager.pool.end();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = MigrationManager;

// Example migration: migrations/20240307100000_create_users.up.sql
-- Migration: 20240307100000_create_users
-- Up

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_created_at ON users (created_at);

-- migrations/20240307100000_create_users.down.sql
-- Migration: 20240307100000_create_users
-- Down

-- Drop indexes
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_users_email;

-- Drop table
DROP TABLE IF EXISTS users;
```

#### Stack: Go

```go
// migrations/migrate.go
package migrations

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

type MigrationManager struct {
	db            *sql.DB
	migrationsDir string
}

type Migration struct {
	Version   string
	UpSQL    string
	DownSQL  string
	AppliedAt *time.Time
}

func NewMigrationManager(db *sql.DB, migrationsDir string) *MigrationManager {
	return &MigrationManager{
		db:            db,
		migrationsDir: migrationsDir,
	}
}

func (m *MigrationManager) Initialize() error {
	// Create migrations table if it doesn't exist
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			id SERIAL PRIMARY KEY,
			version VARCHAR(255) NOT NULL UNIQUE,
			applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	_, err := m.db.Exec(query)
	return err
}

func (m *MigrationManager) CreateMigration(name string) error {
	timestamp := time.Now().Format("20060102150405")
	version := fmt.Sprintf("%s_%s", timestamp, name)
	
	upContent := fmt.Sprintf(`-- Migration: %s
-- Up

-- Add your SQL here
`, version)
	
	downContent := fmt.Sprintf(`-- Migration: %s
-- Down

-- Add rollback SQL here
`, version)
	
	upFile := filepath.Join(m.migrationsDir, version+".up.sql")
	downFile := filepath.Join(m.migrationsDir, version+".down.sql")
	
	if err := ioutil.WriteFile(upFile, []byte(upContent), 0644); err != nil {
		return err
	}
	
	if err := ioutil.WriteFile(downFile, []byte(downContent), 0644); err != nil {
		return err
	}
	
	fmt.Printf("Created migration files:\n  %s\n  %s\n", upFile, downFile)
	return nil
}

func (m *MigrationManager) GetAppliedMigrations() ([]string, error) {
	rows, err := m.db.Query("SELECT version FROM schema_migrations ORDER BY version")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var versions []string
	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		versions = append(versions, version)
	}
	
	return versions, rows.Err()
}

func (m *MigrationManager) GetAllMigrations() ([]Migration, error) {
	files, err := ioutil.ReadDir(m.migrationsDir)
	if err != nil {
		return nil, err
	}
	
	var migrations []Migration
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".up.sql") {
			version := strings.TrimSuffix(file.Name(), ".up.sql")
			
			upFile := filepath.Join(m.migrationsDir, file.Name())
			downFile := filepath.Join(m.migrationsDir, version+".down.sql")
			
			upSQL, err := ioutil.ReadFile(upFile)
			if err != nil {
				return nil, err
			}
			
			downSQL, err := ioutil.ReadFile(downFile)
			if err != nil {
				return nil, err
			}
			
			migrations = append(migrations, Migration{
				Version:  version,
				UpSQL:    string(upSQL),
				DownSQL:  string(downSQL),
			})
		}
	}
	
	// Sort migrations by version
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})
	
	return migrations, nil
}

func (m *MigrationManager) GetPendingMigrations() ([]Migration, error) {
	applied, err := m.GetAppliedMigrations()
	if err != nil {
		return nil, err
	}
	
	appliedMap := make(map[string]bool)
	for _, version := range applied {
		appliedMap[version] = true
	}
	
	allMigrations, err := m.GetAllMigrations()
	if err != nil {
		return nil, err
	}
	
	var pending []Migration
	for _, migration := range allMigrations {
		if !appliedMap[migration.Version] {
			pending = append(pending, migration)
		}
	}
	
	return pending, nil
}

func (m *MigrationManager) Migrate(targetVersion string) error {
	startTime := time.Now()
	
	if err := m.Initialize(); err != nil {
		return err
	}
	
	pending, err := m.GetPendingMigrations()
	if err != nil {
		return err
	}
	
	if len(pending) == 0 {
		fmt.Println("No pending migrations")
		return nil
	}
	
	fmt.Printf("Found %d pending migrations\n", len(pending))
	
	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	for _, migration := range pending {
		if targetVersion != "" && migration.Version > targetVersion {
			break
		}
		
		fmt.Printf("Applying migration: %s\n", migration.Version)
		
		// Execute up migration
		if _, err := tx.Exec(migration.UpSQL); err != nil {
			return fmt.Errorf("migration %s failed: %w", migration.Version, err)
		}
		
		// Record migration
		if _, err := tx.Exec(
			"INSERT INTO schema_migrations (version) VALUES ($1)",
			migration.Version,
		); err != nil {
			return fmt.Errorf("failed to record migration %s: %w", migration.Version, err)
		}
		
		fmt.Printf("✓ Applied migration: %s\n", migration.Version)
	}
	
	if err := tx.Commit(); err != nil {
		return err
	}
	
	duration := time.Since(startTime).Milliseconds()
	fmt.Printf("Migration completed in %dms\n", duration)
	
	return nil
}

func (m *MigrationManager) Rollback(targetVersion string) error {
	startTime := time.Now()
	
	if err := m.Initialize(); err != nil {
		return err
	}
	
	applied, err := m.GetAppliedMigrations()
	if err != nil {
		return err
	}
	
	if len(applied) == 0 {
		fmt.Println("No migrations to rollback")
		return nil
	}
	
	// Find migrations to rollback
	var toRollback []string
	for i := len(applied) - 1; i >= 0; i-- {
		version := applied[i]
		toRollback = append(toRollback, version)
		
		if version == targetVersion {
			break
		}
	}
	
	if len(toRollback) == 0 {
		fmt.Printf("No migrations to rollback to version: %s\n", targetVersion)
		return nil
	}
	
	fmt.Printf("Rolling back %d migrations\n", len(toRollback))
	
	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	for _, version := range toRollback {
		fmt.Printf("Rolling back migration: %s\n", version)
		
		// Read and execute down migration
		downFile := filepath.Join(m.migrationsDir, version+".down.sql")
		downSQL, err := ioutil.ReadFile(downFile)
		if err != nil {
			return fmt.Errorf("failed to read down migration %s: %w", version, err)
		}
		
		// Execute down migration
		if _, err := tx.Exec(string(downSQL)); err != nil {
			return fmt.Errorf("rollback %s failed: %w", version, err)
		}
		
		// Remove migration record
		if _, err := tx.Exec(
			"DELETE FROM schema_migrations WHERE version = $1",
			version,
		); err != nil {
			return fmt.Errorf("failed to remove migration %s: %w", version, err)
		}
		
		fmt.Printf("✓ Rolled back migration: %s\n", version)
	}
	
	if err := tx.Commit(); err != nil {
		return err
	}
	
	duration := time.Since(startTime).Milliseconds()
	fmt.Printf("Rollback completed in %dms\n", duration)
	
	return nil
}

func (m *MigrationManager) GetCurrentVersion() (string, error) {
	if err := m.Initialize(); err != nil {
		return "", err
	}
	
	var version string
	err := m.db.QueryRow(
		"SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1",
	).Scan(&version)
	
	if err == sql.ErrNoRows {
		return "", nil
	}
	
	return version, err
}

func (m *MigrationManager) DryRun() error {
	pending, err := m.GetPendingMigrations()
	if err != nil {
		return err
	}
	
	fmt.Println("Dry run - pending migrations:")
	
	for _, migration := range pending {
		fmt.Printf("\n--- Migration: %s ---\n", migration.Version)
		fmt.Println(migration.UpSQL)
		fmt.Println("--- End Migration ---\n")
	}
	
	return nil
}

// Example migration: migrations/20240307100000_create_users.up.sql
-- Migration: 20240307100000_create_users
-- Up

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_created_at ON users (created_at);

-- migrations/20240307100000_create_users.down.sql
-- Migration: 20240307100000_create_users
-- Down

-- Drop indexes
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_users_email;

-- Drop table
DROP TABLE IF EXISTS users;
```

## Configuration Examples

### Environment Variables

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/tita_chi
MIGRATIONS_DIR=./migrations
```

### Package.json Scripts

```json
{
  "scripts": {
    "migration:create": "alembic revision --autogenerate -m",
    "migration:up": "alembic upgrade head",
    "migration:down": "alembic downgrade -1",
    "migration:current": "alembic current",
    "migration:history": "alembic history",
    "migration:dry-run": "alembic upgrade --sql"
  }
}
```

## Integration

### FastAPI Application

```python
# main.py
from fastapi import FastAPI
from app.core.database import init_db, upgrade_database
import os

app = FastAPI(title="BOB Framework API")

@app.on_event("startup")
async def startup_event():
    # Auto-migrate on startup in production
    if os.getenv("AUTO_MIGRATE", "false").lower() == "true":
        upgrade_database()
    else:
        init_db()

# CLI for manual migration management
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "migrate":
            upgrade_database()
        elif command == "create-migration":
            if len(sys.argv) > 2:
                create_migration(sys.argv[2])
        elif command == "rollback":
            if len(sys.argv) > 2:
                downgrade_database(sys.argv[2])
```

### Express.js Application

```javascript
// app.js
const express = require('express');
const MigrationManager = require('./migrations/migrate');

const app = express();

// Auto-migrate on startup
async function start() {
    const manager = new MigrationManager(process.env.DATABASE_URL);
    
    if (process.env.AUTO_MIGRATE === 'true') {
        await manager.migrate();
        console.log('Database migrated successfully');
    }
    
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}

start().catch(console.error);
```

### Go Application

```go
// main.go
package main

import (
    "database/sql"
    "log"
    "os"
    "bob-framework/migrations"
    
    _ "github.com/lib/pq"
)

func main() {
    db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    manager := migrations.NewMigrationManager(db, "./migrations")
    
    // Auto-migrate on startup
    if os.Getenv("AUTO_MIGRATE") == "true" {
        if err := manager.Migrate(""); err != nil {
            log.Fatal("Migration failed:", err)
        }
        log.Println("Database migrated successfully")
    }
    
    // Start your application...
}
```

## Success Metrics

- [ ] Migration files are versioned and tracked
- [ ] Up and down migrations exist for each change
- [ ] Migrations run in transactions
- [ ] Rollback functionality works correctly
- [ ] Dry-run mode previews changes
- [ ] Migration history is maintained
- [ ] Zero-downtime deployment works
- [ ] Multiple developers can work concurrently
- [ ] Production migrations are safe and tested

## Troubleshooting

### Common Issues

1. **Migration Conflicts**
   - Use version control to detect conflicts
   - Communicate schema changes with team
   - Consider squashing migrations

2. **Long-Running Migrations**
   - Break into smaller batches
   - Add progress logging
   - Use lock tables to prevent conflicts

3. **Rollback Failures**
   - Test down migrations thoroughly
   - Keep data backup strategies
   - Document rollback procedures

4. **Environment Differences**
   - Use environment-specific configurations
   - Test migrations in staging first
   - Handle data type differences

### Debug Commands

```bash
# FastAPI/Alembic
alembic current                    # Show current version
alembic history                    # Show migration history
alembic upgrade head --sql          # Show SQL without executing
alembic downgrade -1                # Rollback one migration

# Node.js
node migrate.js current              # Show current version
node migrate.js history              # Show migration history
node migrate.js dry-run             # Preview migrations

# Go
./migrate current                   # Show current version
./migrate history                   # Show migration history
./migrate dry-run                   # Preview migrations
```
