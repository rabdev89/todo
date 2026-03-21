---
id: search-elasticsearch-v1
name: Search / Elasticsearch
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
tags: [search, elasticsearch, indexing, analytics, performance]
---

# SKILL: Search / Elasticsearch

## Problem

Modern applications need powerful search capabilities for:
- Full-text search across documents
- Faceted search and filtering
- Real-time search suggestions
- Complex queries and aggregations
- Performance at scale
- Analytics on search behavior
- Multi-language support

Without proper search:
- Database queries become slow and complex
- Poor user experience with basic search
- No relevance ranking or suggestions
- Limited scalability for large datasets
- No search analytics or insights

## Solution Overview

Implement search architecture with:
- **Elasticsearch Cluster**: Distributed search and analytics
- **Indexing Strategy**: Document mapping and updates
- **Query DSL**: Complex search with aggregations
- **Search Service**: Unified search API for applications
- **Performance Optimization**: Caching and query optimization
- **Analytics Integration**: Search behavior tracking
- **Multi-language Support**: Text analysis and language detection

This enables fast, relevant search with excellent user experience.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|-------|
| `config/elasticsearch_config.js` | Elasticsearch configuration | config | nodejs |
| `config/elasticsearch_config.py` | Elasticsearch configuration | config | python |
| `config/elasticsearch_config.go` | Elasticsearch configuration | config | go |
| `services/search_service.js` | Search service implementation | service | nodejs |
| `services/search_service.py` | Search service implementation | service | python |
| `services/search_service.go` | Search service implementation | service | go |
| `models/search_document.js` | Search document model | models | nodejs |
| `models/search_document.py` | Search document model | models | python |
| `models/search_document.go` | Search document model | models | go |
| `indexing/document_indexer.js` | Document indexer | indexing | nodejs |
| `indexing/document_indexer.py` | Document indexer | indexing | python |
| `indexing/document_indexer.go` | Document indexer | indexing | go |
| `middleware/search_logging.js` | Search logging middleware | middleware | nodejs |
| `middleware/search_logging.py` | Search logging middleware | middleware | python |
| `middleware/search_logging.go` | Search logging middleware | middleware | go |

### Code Patterns

#### Stack: Node.js + Elasticsearch

```javascript
// config/elasticsearch_config.js
const { Client } = require('@elastic/elasticsearch');

const config = {
  nodes: process.env.ELASTICSEARCH_NODES?.split(',') || ['http://localhost:9200'],
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
  },
  index: process.env.ELASTICSEARCH_INDEX || 'app_search',
  maxRetries: 3,
  requestTimeout: 30000,
  maxConnections: 20,
  sniffOnStart: false,
  sniffOnConnectionFault: true,
  compression: 'gzip',
  compressionLevel: 6,
  // Performance settings
  search: {
    default_operator: 'AND',
    default_minimum_should_match: '75%',
    default_phrase_slop: 3.0
  }
};

const client = new Client(config);

module.exports = { config, client };

// services/search_service.js
const { Client } = require('@elastic/elasticsearch');
const { config } = require('../config/elasticsearch_config');
const SearchDocument = require('../models/search_document');

class SearchService {
  constructor() {
    this.client = new Client(config.client);
    this.index = config.index;
  }

  async indexDocument(doc) {
    try {
      const result = await this.client.index({
        index: this.index,
        id: doc.id,
        body: doc
      });
      
      console.log(`Document indexed: ${doc.id}`);
      return result;
    } catch (error) {
      console.error('Indexing failed:', error);
      throw error;
    }
  }

  async searchDocuments(query, options = {}) {
    try {
      const searchQuery = {
        query: {
          multi_match: {
            'title': query,
            'content': query,
            'tags': query
          }
        },
        ...options
      };

      const result = await this.client.search({
        index: this.index,
        body: searchQuery
      });

      return result.body.hits.map(hit => ({
        id: hit._id,
        score: hit._score,
        source: hit._source
      }));
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  async suggest(query, field = 'title', options = {}) {
    try {
      const result = await this.client.search({
        index: this.index,
        body: {
          suggest: {
            [field]: {
              prefix: query,
              completion: {
                field: {
                  size: 5
                }
              }
            }
          }
        }
      });

      return result.body.suggest[field][0].options.map(option => option.text);
    } catch (error) {
      console.error('Suggestion failed:', error);
      throw error;
    }
  }

  async aggregateSearch(query, aggregation) {
    try {
      const result = await this.client.search({
        index: this.index,
        body: {
          size: 0,
          query: {
            match_all: {
              'content': query
            }
          },
          aggs: aggregation
        }
      });

      return result.body.aggregations;
    } catch (error) {
      console.error('Aggregation failed:', error);
      throw error;
    }
  }

  async deleteDocument(docId) {
    try {
      await this.client.delete({
        index: this.index,
        id: docId
      });
      
      console.log(`Document deleted: ${docId}`);
    } catch (error) {
      console.error('Deletion failed:', error);
      throw error;
    }
  }

  async updateDocument(docId, updates) {
    try {
      await this.client.update({
        index: this.index,
        id: docId,
        body: updates
      });
      
      console.log(`Document updated: ${docId}`);
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }
}

module.exports = SearchService;

// models/search_document.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const SearchDocument = sequelize.define('SearchDocument', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
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

module.exports = SearchDocument;

// indexing/document_indexer.js
const { Client } = require('@elastic/elasticsearch');
const { SearchDocument } = require('../models/search_document');
const { config } = require('../config/elasticsearch_config');

class DocumentIndexer {
  constructor() {
    this.client = new Client(config.client);
    this.index = config.index;
    this.batchSize = 100;
  }

  async indexBatch(documents) {
    const body = documents.flatMap(doc => [
      { index: { _index: this.index }, id: doc.id, body: doc }
    ]);

    try {
      const response = await this.client.bulk({ body });
      console.log(`Indexed ${body.length} documents`);
      return response;
    } catch (error) {
      console.error('Bulk indexing failed:', error);
      throw error;
    }
  }

  async reindexAll() {
    try {
      // Delete existing index
      await this.client.indices.delete({ index: this.index });
      
      // Recreate index with mapping
      await this.client.indices.create({
        index: this.index,
        body: {
          mappings: {
            properties: {
              title: { type: 'text' },
              content: { type: 'text' },
              tags: { type: 'keyword' },
              category: { type: 'keyword' },
              url: { type: 'text' },
              metadata: { type: 'object' }
            }
          }
        }
      });

      // Reindex all documents
      const documents = await SearchDocument.findAll();
      await this.indexBatch(documents);
      
      console.log('Reindex completed');
    } catch (error) {
      console.error('Reindex failed:', error);
      throw error;
    }
  }
}

module.exports = DocumentIndexer;
```

#### Stack: Python + Django + Elasticsearch

```python
# config/elasticsearch_config.py
from elasticsearch import Elasticsearch
from django.conf import settings

class ElasticsearchConfig:
    def __init__(self):
        self.client = Elasticsearch(
            hosts=settings.ELASTICSEARCH_HOSTS,
            http_auth=(
                settings.ELASTICSEARCH_USERNAME,
                settings.ELASTICSEARCH_PASSWORD
            ),
            timeout=30,
            max_retries=3,
            retry_on_timeout=True,
            retry_on_status=(429, 500, 502, 503, 504)
        )
        self.index = settings.ELASTICSEARCH_INDEX

    def get_client(self):
        return self.client

# services/search_service.py
from elasticsearch import Elasticsearch
from django.conf import settings
from .models import SearchDocument
from .config import ElasticsearchConfig

class SearchService:
    def __init__(self):
        self.es_config = ElasticsearchConfig()
        self.client = self.es_config.get_client()

    def index_document(self, doc):
        try:
            response = self.client.index(
                index=settings.ELASTICSEARCH_INDEX,
                id=doc.id,
                body=doc.__dict__
            )
            return response
        except Exception as e:
            raise Exception(f"Indexing failed: {e}")

    def search_documents(self, query, options=None):
        try:
            search_query = {
                'query': {
                    'multi_match': {
                        'title': query,
                        'content': query,
                        'tags': query
                    }
                }
            }
            
            if options:
                search_query.update(options)
            
            response = self.client.search(
                index=settings.ELASTICSEARCH_INDEX,
                body=search_query
            )
            
            return response['hits']['hits']
        except Exception as e:
            raise Exception(f"Search failed: {e}")

    def suggest(self, query, field='title', options=None):
        try:
            response = self.client.search(
                index=settings.ELASTICSEARCH_INDEX,
                body={
                    'suggest': {
                        field: {
                            'prefix': query,
                            'completion': {
                                'field': {
                                    'size': 5
                                }
                            }
                        }
                    }
                }
            }
            )
            
            return response['suggest'][field][0]['options']
        except Exception as e:
            raise Exception(f"Suggestion failed: {e}")

    def aggregate_search(self, query, aggregation):
        try:
            response = self.client.search(
                index=settings.ELASTICSEARCH_INDEX,
                body={
                    'size': 0,
                    'query': {
                        'match_all': {
                            'content': query
                        }
                    },
                    'aggs': aggregation
                }
            }
            
            return response['aggregations']
        except Exception as e:
            raise Exception(f"Aggregation failed: {e}")

# models/search_document.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SearchDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='author')
    tags = models.JSONField(default=list)
    category = models.CharField(max_length=100)
    url = models.URLField(blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        indexes = [
            models.Index(fields=['title', 'content', 'tags']),
            models.Index(fields=['category', 'url', 'metadata']),
        ]

# indexing/document_indexer.py
from elasticsearch import Elasticsearch
from django.conf import settings
from .models import SearchDocument
from .config import ElasticsearchConfig

class DocumentIndexer:
    def __init__(self):
        self.es_config = ElasticsearchConfig()
        self.client = self.es_config.get_client()

    def index_batch(self, documents):
        """Index a batch of documents"""
        body = []
        for doc in documents:
            body.append({
                'index': settings.ELASTICSEARCH_INDEX,
                'id': doc.id,
                'body': {
                    'title': doc.title,
                    'content': doc.content,
                    'author': doc.author_id,
                    'tags': doc.tags,
                    'category': doc.category,
                    'url': doc.url,
                    'metadata': doc.metadata
                }
            })
        
        try:
            response = self.client.bulk(body=body)
            print(f"Indexed {len(body)} documents")
            return response
        except Exception as e:
            raise Exception(f"Bulk indexing failed: {e}")

    def reindex_all(self):
        """Reindex all documents"""
        try:
            # Delete existing index
            self.client.indices.delete(index=settings.ELASTICSEARCH_INDEX)
            
            # Create index with mapping
            self.client.indices.create(
                index=settings.ELASTICSEARCH_INDEX,
                body={
                    'mappings': {
                        'properties': {
                            'title': {'type': 'text'},
                            'content': {'type': 'text'},
                            'tags': {'type': 'keyword'},
                            'category': {'type': 'keyword'},
                            'url': {'type': 'text'},
                            'metadata': {'type': 'object'}
                        }
                    }
                }
            )
            
            # Reindex all documents
            documents = SearchDocument.objects.all()
            batch_size = 100
            
            for i in range(0, len(documents), batch_size):
                batch = documents[i:i + batch_size]
                await self.index_batch(batch)
            
            print("Reindex completed")
        except Exception as e:
            raise Exception(f"Reindex failed: {e}")
```

## Configuration Examples

### Docker Compose

```yaml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - "xpack.security.enabled=false"
    ports:
      - "9200:9200"
    volumes:
      - ./elasticsearch/data:/usr/share/elasticsearch/data
      - ./elasticsearch/logs:/usr/share/elasticsearch/logs
      - ./elasticsearch/config:/usr/share/elasticsearch/config
```

### Environment Variables

```bash
# .env
ELASTICSEARCH_HOSTS=localhost:9200,localhost:9201,localhost:9202
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_INDEX=app_search
```

## Success Metrics

- [ ] Documents are indexed correctly
- [ ] Search returns relevant results
- [ ] Suggestions work properly
- [ ] Aggregations provide insights
- [ ] Performance is optimized with caching
- [ ] Search analytics are captured
- [ ] Multi-language support works

## Troubleshooting

### Common Issues

1. **Connection Failures**
   - Check Elasticsearch cluster health
   - Verify network connectivity
   - Monitor connection pool usage

2. **Indexing Errors**
   - Validate document structure before indexing
   - Handle mapping conflicts
   - Implement proper error handling

3. **Search Performance**
   - Optimize queries with filters
   - Use appropriate analyzers
   - Implement result caching
   - Monitor slow queries

4. **Memory Usage**
   - Monitor JVM heap usage
   - Adjust heap size as needed
   - Use circuit breakers for large queries

### Debug Commands

```bash
# Check cluster health
curl -X GET "http://localhost:9200/_cluster/health?pretty"

# Check index status
curl -X GET "http://localhost:9200/app_search/_status?pretty"

# Test search
curl -X GET "http://localhost:9200/app_search/_search?q=test&pretty"

# Monitor nodes
curl -X GET "http://localhost:9200/_nodes/stats?pretty"
```

## Best Practices

### Index Design

1. **Mapping Strategy**: Use explicit mappings
2. **Document Structure**: Flatten nested objects
3. **Type Selection**: Use appropriate field types
4. **Analysis**: Configure text analyzers properly

### Performance Optimization

1. **Bulk Indexing**: Index documents in batches
2. **Async Operations**: Use async indexing for better throughput
3. **Caching**: Cache frequent search results
4. **Query Optimization**: Use filters and pagination

### Security

1. **Access Control**: Implement search-level security
2. **Data Encryption**: Encrypt sensitive data
3. **Audit Logging**: Log all search operations
4. **Rate Limiting**: Implement query rate limiting

### Scalability

1. **Cluster Scaling**: Use multiple nodes
2. **Index Sharding**: Shard indices for scale
3. **Load Balancing**: Use load balancer for search requests
4. **Monitoring**: Comprehensive cluster monitoring
