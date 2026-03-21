---
id: event-driven-architecture-v1
name: Event-Driven Architecture
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
tags: [events, messaging, kafka, rabbitmq, pubsub, microservices]
---

# SKILL: Event-Driven Architecture

## Problem

Modern applications need decoupled, scalable communication for:
- Loose coupling between microservices
- Asynchronous processing and resilience
- Event sourcing and audit trails
- Real-time data synchronization
- Scalable message processing
- Fault tolerance and recovery

Without event-driven architecture:
- Services are tightly coupled
- No audit trail of state changes
- Poor scalability under load
- Synchronous bottlenecks
- Difficult to add new consumers/producers

## Solution Overview

Implement event-driven architecture with:
- **Event Sourcing**: Immutable event logs as state source
- **Message Brokers**: Kafka, RabbitMQ, Redis Pub/Sub
- **Event Handlers**: Process events asynchronously
- **Event Schemas**: Type-safe event definitions
- **Dead Letter Queues**: Handle failed events
- **Event Replay**: Rebuild state from event logs
- **CQRS**: Separate read/write models

This enables scalable, resilient microservices with complete audit trails.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `events/schemas/user_events.proto` | User event definitions | schema | go |
| `events/schemas/order_events.proto` | Order event definitions | schema | go |
| `events/producer/event_producer.go` | Event producer implementation | producer | go |
| `events/consumer/event_consumer.go` | Event consumer implementation | consumer | go |
| `events/handlers/user_handler.go` | User event handlers | handler | go |
| `events/handlers/order_handler.go` | Order event handlers | handler | go |
| `events/store/event_store.go` | Event sourcing store | store | go |
| `events/projection/user_projection.go` | Read model projection | projection | go |
| `events/config/kafka_config.go` | Kafka configuration | config | go |
| `events/config/rabbitmq_config.go` | RabbitMQ configuration | config | go |
| `events/schemas/user_events.json` | User event schemas | schema | python |
| `events/producer/event_producer.py` | Event producer implementation | producer | python |
| `events/consumer/event_consumer.py` | Event consumer implementation | consumer | python |
| `events/handlers/user_handler.py` | User event handlers | handler | python |
| `events/store/event_store.py` | Event sourcing store | store | python |
| `events/projection/user_projection.py` | Read model projection | projection | python |
| `events/config/kafka_config.py` | Kafka configuration | config | python |
| `events/config/rabbitmq_config.py` | RabbitMQ configuration | config | python |

### Code Patterns

#### Stack: Go + Kafka + Event Sourcing

```protobuf
// events/schemas/user_events.proto
syntax = "proto3";

package user_events;

option go_package = "github.com/yourproject/events/schemas;userevents";

import "google/protobuf/timestamp.proto";

// Base event
message BaseEvent {
  string event_id = 1;
  string aggregate_id = 2;
  string aggregate_type = 3;
  int64 version = 4;
  google.protobuf.Timestamp occurred_at = 5;
  map<string, string> metadata = 6;
}

// User events
message UserCreated extends BaseEvent {
  string email = 7;
  string name = 8;
  string avatar_url = 9;
}

message UserUpdated extends BaseEvent {
  string email = 7;
  string name = 8;
  string avatar_url = 9;
  map<string, string> changed_fields = 10;
}

message UserDeleted extends BaseEvent {
  string email = 7;
  string name = 8;
}

message UserPasswordChanged extends BaseEvent {
  string new_hashed_password = 7;
}

// events/schemas/order_events.proto
syntax = "proto3";

package order_events;

option go_package = "github.com/yourproject/events/schemas;orderevents";

import "google/protobuf/timestamp.proto";

message OrderCreated extends BaseEvent {
  string order_id = 7;
  string customer_id = 8;
  repeated OrderItem items = 9;
  double total_amount = 10;
  string currency = 11;
}

message OrderUpdated extends BaseEvent {
  string order_id = 7;
  repeated OrderItem items = 9;
  double total_amount = 10;
  string currency = 11;
  map<string, string> changed_fields = 12;
}

message OrderCancelled extends BaseEvent {
  string order_id = 7;
  string reason = 8;
  string cancelled_by = 9;
}

message OrderItem {
  string product_id = 1;
  string product_name = 2;
  int32 quantity = 3;
  double unit_price = 4;
  double total_price = 5;
}

// events/producer/event_producer.go
package producer

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/Shopify/sarama"
	"github.com/google/uuid"
	
	userevents "github.com/yourproject/events/schemas"
)

type EventProducer struct {
	producer sarama.SyncProducer
	config  *sarama.Config
}

func NewEventProducer(brokers []string, topic string) (*EventProducer, error) {
	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Retry.Backoff = sarama.NewExponentialBackOffConfig()

	producer, err := sarama.NewSyncProducer(brokers, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create producer: %v", err)
	}

	return &EventProducer{
		producer: producer,
		config:  config,
	}, nil
}

func (p *EventProducer) PublishUserEvent(ctx context.Context, event userevents.BaseEvent) error {
	// Set common event fields
	event.EventId = uuid.New().String()
	event.OccurredAt = timestamppb.New(time.Now()).String()
	event.AggregateType = "user"
	event.Metadata = make(map[string]string)
	
	// Marshal event
	data, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %v", err)
	}
	
	// Publish to Kafka
	message := &sarama.ProducerMessage{
		Topic: "user-events",
		Value:  string(data),
		Headers: []sarama.RecordHeader{
			{Key: "event_type", Value: fmt.Sprintf("%T", event)},
			{Key: "aggregate_id", Value: event.AggregateId},
		},
	}
	
	_, _, err = p.producer.SendMessage(message)
	return err
}

func (p *EventProducer) PublishOrderEvent(ctx context.Context, event orderevents.BaseEvent) error {
	// Similar implementation for order events
	event.EventId = uuid.New().String()
	event.OccurredAt = timestamppb.New(time.Now()).String()
	event.AggregateType = "order"
	
	data, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %v", err)
	}
	
	message := &sarama.ProducerMessage{
		Topic: "order-events",
		Value:  string(data),
		Headers: []sarama.RecordHeader{
			{Key: "event_type", Value: fmt.Sprintf("%T", event)},
			{Key: "aggregate_id", Value: event.AggregateId},
		},
	}
	
	_, _, err = p.producer.SendMessage(message)
	return err
}

func (p *EventProducer) Close() error {
	return p.producer.Close()
}

// events/consumer/event_consumer.go
package consumer

import (
	"context"
	"encoding/json"
	"log"
	"sync"

	"github.com/Shopify/sarama"
	
	userevents "github.com/yourproject/events/schemas"
	orderevents "github.com/yourproject/events/schemas"
)

type EventConsumer struct {
	consumer sarama.ConsumerGroup
	handlers map[string]EventHandlerInterface
	wg      sync.WaitGroup
}

type EventHandlerInterface interface {
	Handle(ctx context.Context, event []byte) error
}

type UserEventHandler struct{}
type OrderEventHandler struct{}

func (h *UserEventHandler) Handle(ctx context.Context, eventBytes []byte) error {
	var baseEvent userevents.BaseEvent
	if err := json.Unmarshal(eventBytes, &baseEvent); err != nil {
		return fmt.Errorf("failed to unmarshal user event: %v", err)
	}
	
	switch baseEvent.AggregateType {
	case "user":
		return h.handleUserEvent(ctx, baseEvent)
	default:
		return fmt.Errorf("unknown aggregate type: %s", baseEvent.AggregateType)
	}
}

func (h *UserEventHandler) handleUserEvent(ctx context.Context, event userevents.BaseEvent) error {
	switch event := event.(type) {
	case *userevents.UserCreated:
		log.Printf("User created: %s", event.Email)
		return h.handleUserCreated(ctx, event)
	case *userevents.UserUpdated:
		log.Printf("User updated: %s", event.Email)
		return h.handleUserUpdated(ctx, event)
	case *userevents.UserDeleted:
		log.Printf("User deleted: %s", event.Email)
		return h.handleUserDeleted(ctx, event)
	case *userevents.UserPasswordChanged:
		log.Printf("User password changed: %s", event.AggregateId)
		return h.handleUserPasswordChanged(ctx, event)
	default:
		return fmt.Errorf("unknown user event type")
	}
}

func (h *UserEventHandler) handleUserCreated(ctx context.Context, event *userevents.UserCreated) error {
	// Process user created event
	log.Printf("Processing user created event for: %s", event.Email)
	return nil
}

func (h *UserEventHandler) handleUserUpdated(ctx context.Context, event *userevents.UserUpdated) error {
	// Process user updated event
	log.Printf("Processing user updated event for: %s", event.Email)
	return nil
}

func (h *UserEventHandler) handleUserDeleted(ctx context.Context, event *userevents.UserDeleted) error {
	// Process user deleted event
	log.Printf("Processing user deleted event for: %s", event.Email)
	return nil
}

func (h *UserEventHandler) handleUserPasswordChanged(ctx context.Context, event *userevents.UserPasswordChanged) error {
	// Process password changed event
	log.Printf("Processing password changed event for: %s", event.AggregateId)
	return nil
}

func NewEventConsumer(brokers []string, groupID string, topics []string) (*EventConsumer, error) {
	config := sarama.NewConfig()
	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRoundRobin
	config.Consumer.Offsets.Initial = sarama.OffsetNewest
	config.Consumer.Group.Session.Timeout = 10 * time.Second

	consumer, err := sarama.NewConsumerGroupFromClient("kafka", groupID, brokers, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create consumer: %v", err)
	}

	handlers := map[string]EventHandlerInterface{
		"user-events": &UserEventHandler{},
		"order-events": &OrderEventHandler{},
	}

	return &EventConsumer{
		consumer: consumer,
		handlers: handlers,
	}, nil
}

func (c *EventConsumer) Start(ctx context.Context) error {
	topics := []string{"user-events", "order-events"}
	
	consumer, err := c.consumer.Consume(topics, c.handlers)
	if err != nil {
		return fmt.Errorf("failed to start consumer: %v", err)
	}

	c.wg.Add(1)
	
	go func() {
		defer c.wg.Done()
		for {
			select {
			case err := <-consumer.Errors():
				log.Printf("Consumer error: %v", err)
			case msg := <-consumer.Messages():
				if handler, ok := c.handlers[msg.Topic]; ok {
					if err := handler.Handle(ctx, msg.Value); err != nil {
						log.Printf("Error handling message: %v", err)
					}
				}
			case <-ctx.Done():
				return
			}
		}
	}()

	return nil
}

func (c *EventConsumer) Close() error {
	if err := c.consumer.Close(); err != nil {
		return fmt.Errorf("failed to close consumer: %v", err)
	}
	
	c.wg.Wait()
	return nil
}

// events/store/event_store.go
package store

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"google.golang.org/protobuf/proto"
	"github.com/golang/protobuf/ptypes"
	
	userevents "github.com/yourproject/events/schemas"
)

type EventStore struct {
	events []userevents.BaseEvent
	mu    sync.RWMutex
}

func NewEventStore() *EventStore {
	return &EventStore{
		events: make([]userevents.BaseEvent, 0),
	}
}

func (es *EventStore) AppendEvent(event userevents.BaseEvent) error {
	es.mu.Lock()
	defer es.mu.Unlock()
	
	// Validate event
	if err := es.validateEvent(event); err != nil {
		return err
	}
	
	// Append event
	es.events = append(es.events, event)
	
	return nil
}

func (es *EventStore) validateEvent(event userevents.BaseEvent) error {
	// Validate event structure
	if event.EventId == "" {
		return fmt.Errorf("event_id is required")
	}
	
	if event.AggregateId == "" {
		return fmt.Errorf("aggregate_id is required")
	}
	
	if event.AggregateType == "" {
		return fmt.Errorf("aggregate_type is required")
	}
	
	return nil
}

func (es *EventStore) GetEventsForAggregate(aggregateID string, fromVersion int64) ([]userevents.BaseEvent, error) {
	es.mu.RLock()
	defer es.mu.RUnlock()
	
	var events []userevents.BaseEvent
	for _, event := range es.events {
		if event.AggregateId == aggregateID && event.Version > fromVersion {
			events = append(events, event)
		}
	}
	
	return events, nil
}

func (es *EventStore) GetAggregateState(aggregateID string) (*UserAggregate, error) {
	events, err := es.GetEventsForAggregate(aggregateID, 0)
	if err != nil {
		return nil, err
	}
	
	aggregate := &UserAggregate{}
	
	for _, event := range events {
		switch e := event.(type) {
		case *userevents.UserCreated:
			aggregate.ID = e.AggregateId
			aggregate.Email = e.Email
			aggregate.Name = e.Name
			aggregate.AvatarURL = e.AvatarUrl
			aggregate.Version = e.Version
		case *userevents.UserUpdated:
			aggregate.ApplyUpdate(e)
		case *userevents.UserDeleted:
			aggregate = nil // User deleted
		}
	}
	
	return aggregate, nil
}

type UserAggregate struct {
	ID        string
	Email     string
	Name      string
	AvatarURL string
	Version   int64
}

func (ua *UserAggregate) ApplyUpdate(event *userevents.UserUpdated) {
	ua.ID = event.AggregateId
	if event.Email != "" {
		ua.Email = event.Email
	}
	if event.Name != "" {
		ua.Name = event.Name
	}
	if event.AvatarUrl != "" {
		ua.AvatarURL = event.AvatarUrl
	}
	ua.Version = event.Version
}

// events/projection/user_projection.go
package projection

import (
	"context"
	"log"
	"sync"

	"yourproject/events/store"
	"yourproject/events/schemas"
)

type UserProjection struct {
	store  *store.EventStore
	users  map[string]*UserReadModel
	mu     sync.RWMutex
}

type UserReadModel struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatarUrl"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func NewUserProjection(eventStore *store.EventStore) *UserProjection {
	projection := &UserProjection{
		store: eventStore,
		users: make(map[string]*UserReadModel),
	}
	
	// Rebuild projection from events
	projection.rebuild()
	
	return projection
}

func (up *UserProjection) rebuild() error {
	up.mu.Lock()
	defer up.mu.Unlock()
	
	// Get all events from store
	events, err := up.store.GetEventsForAggregate("", 0)
	if err != nil {
		return err
	}
	
	// Build projection
	for _, event := range events {
		switch e := event.(type) {
		case *userevents.UserCreated:
			user := &UserReadModel{
				ID:        e.AggregateId,
				Email:     e.Email,
				Name:      e.Name,
				AvatarURL: e.AvatarUrl,
				CreatedAt: e.OccurredAt,
				UpdatedAt: e.OccurredAt,
			}
			up.users[e.AggregateId] = user
			
		case *userevents.UserUpdated:
			if user, exists := up.users[e.AggregateId]; exists {
				user.ApplyUpdate(e)
				user.UpdatedAt = e.OccurredAt
			}
			
		case *userevents.UserDeleted:
			delete(up.users, e.AggregateId)
		}
	}
	
	return nil
}

func (up *UserProjection) GetUser(id string) (*UserReadModel, error) {
	up.mu.RLock()
	defer up.mu.RUnlock()
	
	user, exists := up.users[id]
	if !exists {
		return nil, fmt.Errorf("user not found")
	}
	
	return user, nil
}

func (up *UserProjection) GetAllUsers() []*UserReadModel {
	up.mu.RLock()
	defer up.mu.RUnlock()
	
	users := make([]*UserReadModel, 0, len(up.users))
	i := 0
	for _, user := range up.users {
		users[i] = user
		i++
	}
	
	return users
}
```

#### Stack: Python + Redis Pub/Sub

```python
# events/schemas/user_events.json
{
  "UserCreated": {
    "type": "object",
    "properties": {
      "event_id": {"type": "string"},
      "aggregate_id": {"type": "string"},
      "aggregate_type": {"type": "string"},
      "version": {"type": "integer"},
      "occurred_at": {"type": "string", "format": "date-time"},
      "email": {"type": "string"},
      "name": {"type": "string"},
      "avatar_url": {"type": "string"}
    },
    "required": ["event_id", "aggregate_id", "aggregate_type", "occurred_at", "email", "name"]
  },
  
  "UserUpdated": {
    "type": "object",
    "properties": {
      "event_id": {"type": "string"},
      "aggregate_id": {"type": "string"},
      "aggregate_type": {"type": "string"},
      "version": {"type": "integer"},
      "occurred_at": {"type": "string", "format": "date-time"},
      "email": {"type": "string"},
      "name": {"type": "string"},
      "avatar_url": {"type": "string"},
      "changed_fields": {"type": "object"}
    },
    "required": ["event_id", "aggregate_id", "aggregate_type", "version", "occurred_at"]
  }
}

# events/producer/event_producer.py
import json
import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any

import redis.asyncio as redis
from jsonschema import validate

class EventProducer:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
        self.schemas = self._load_schemas()
    
    def _load_schemas(self) -> Dict[str, Any]:
        """Load event schemas for validation"""
        with open('events/schemas/user_events.json', 'r') as f:
            return json.load(f)
    
    async def publish_user_event(self, event_type: str, event_data: Dict[str, Any]) -> None:
        """Publish user event to Redis Pub/Sub"""
        
        # Validate event against schema
        schema = self.schemas.get(event_type)
        if schema:
            validate(instance=event_data, schema=schema)
        
        # Create event envelope
        event_envelope = {
            "event_id": str(uuid.uuid4()),
            "aggregate_id": event_data.get("aggregate_id"),
            "aggregate_type": "user",
            "version": event_data.get("version", 1),
            "occurred_at": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "data": event_data
        }
        
        # Publish to Redis Pub/Sub
        await self.redis.publish("user-events", json.dumps(event_envelope))
    
    async def publish_user_created(self, user_data: Dict[str, Any]) -> None:
        await self.publish_user_event("UserCreated", user_data)
    
    async def publish_user_updated(self, user_data: Dict[str, Any]) -> None:
        await self.publish_user_event("UserUpdated", user_data)
    
    async def publish_user_deleted(self, user_data: Dict[str, Any]) -> None:
        await self.publish_user_event("UserDeleted", user_data)

# events/consumer/event_consumer.py
import json
import asyncio
import logging
from typing import Dict, Any, Callable

import redis.asyncio as redis
from jsonschema import validate

class EventConsumer:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
        self.schemas = self._load_schemas()
        self.handlers = {
            "UserCreated": self.handle_user_created,
            "UserUpdated": self.handle_user_updated,
            "UserDeleted": self.handle_user_deleted,
        }
        self.pubsub = None
    
    def _load_schemas(self) -> Dict[str, Any]:
        """Load event schemas for validation"""
        with open('events/schemas/user_events.json', 'r') as f:
            return json.load(f)
    
    async def start_consuming(self) -> None:
        """Start consuming events from Redis Pub/Sub"""
        self.pubsub = await self.redis.pubsub()
        await self.pubsub.subscribe("user-events")
        
        logging.info("Started consuming user events")
        
        async for message in self.pubsub.listen():
            try:
                event_data = json.loads(message)
                event_type = event_data.get("event_type")
                
                # Validate event against schema
                schema = self.schemas.get(event_type)
                if schema:
                    validate(instance=event_data.get("data"), schema=schema)
                
                # Handle event
                handler = self.handlers.get(event_type)
                if handler:
                    await handler(event_data)
                    
            except Exception as e:
                logging.error(f"Error processing event: {e}")
    
    async def handle_user_created(self, event_data: Dict[str, Any]) -> None:
        """Handle user created event"""
        logging.info(f"User created: {event_data.get('data', {}).get('email')}")
        
        # Update read model, send notifications, etc.
        await self.update_user_projection(event_data)
    
    async def handle_user_updated(self, event_data: Dict[str, Any]) -> None:
        """Handle user updated event"""
        data = event_data.get("data", {})
        changed_fields = data.get("changed_fields", {})
        
        logging.info(f"User updated: {data.get('aggregate_id')} - Changed: {list(changed_fields.keys())}")
        
        # Update read model with changed fields
        await self.update_user_projection(event_data)
    
    async def handle_user_deleted(self, event_data: Dict[str, Any]) -> None:
        """Handle user deleted event"""
        logging.info(f"User deleted: {event_data.get('aggregate_id')}")
        
        # Remove from read model
        await self.remove_from_projection(event_data.get("aggregate_id"))
    
    async def update_user_projection(self, event_data: Dict[str, Any]) -> None:
        """Update user projection based on event"""
        # Implementation would update database or cache
        pass
    
    async def remove_from_projection(self, aggregate_id: str) -> None:
        """Remove user from projection"""
        # Implementation would delete from database or cache
        pass

# events/store/event_store.py
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

class EventStore:
    def __init__(self):
        self.events: List[Dict[str, Any]] = []
    
    def append_event(self, event: Dict[str, Any]) -> None:
        """Append event to store"""
        event["timestamp"] = datetime.utcnow().isoformat()
        self.events.append(event)
    
    def get_events_for_aggregate(self, aggregate_id: str, from_version: int = 0) -> List[Dict[str, Any]]:
        """Get all events for specific aggregate"""
        filtered_events = []
        for event in self.events:
            if (event.get("aggregate_id") == aggregate_id and 
                event.get("version", 1) > from_version):
                filtered_events.append(event)
        
        return filtered_events
    
    def get_aggregate_state(self, aggregate_id: str) -> Optional[Dict[str, Any]]:
        """Rebuild aggregate state from events"""
        events = self.get_events_for_aggregate(aggregate_id)
        
        if not events:
            return None
        
        # Rebuild state (simplified)
        state = {}
        for event in events:
            event_type = event.get("event_type")
            data = event.get("data", {})
            
            if event_type == "UserCreated":
                state = data.copy()
                state["version"] = event.get("version")
            elif event_type == "UserUpdated":
                if not state:
                    state = {}
                state.update(data.get("changed_fields", {}))
                state["version"] = event.get("version")
        
        return state

# events/projection/user_projection.py
import asyncio
import logging
from typing import Dict, Any, List, Optional

from events.store.event_store import EventStore

class UserProjection:
    def __init__(self, event_store: EventStore):
        self.event_store = event_store
        self.projection = {}
    
    async def rebuild_projection(self) -> None:
        """Rebuild user projection from events"""
        logging.info("Rebuilding user projection")
        
        # Get all user events
        events = self.event_store.get_events_for_aggregate("user")
        
        # Build projection
        for event in events:
            event_type = event.get("event_type")
            data = event.get("data", {})
            
            if event_type == "UserCreated":
                self.projection[data.get("aggregate_id")] = {
                    "id": data.get("aggregate_id"),
                    "email": data.get("email"),
                    "name": data.get("name"),
                    "avatar_url": data.get("avatar_url"),
                    "created_at": event.get("occurred_at"),
                    "updated_at": event.get("occurred_at"),
                }
            elif event_type == "UserUpdated":
                if data.get("aggregate_id") in self.projection:
                    user = self.projection[data.get("aggregate_id")]
                    changed_fields = data.get("changed_fields", {})
                    
                    for field, value in changed_fields.items():
                        if hasattr(user, field):
                            setattr(user, field, value)
                    
                    user.updated_at = event.get("occurred_at")
        
        logging.info(f"Projection rebuilt with {len(self.projection)} users")
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user from projection"""
        return self.projection.get(user_id)
    
    async def get_all_users(self) -> List[Dict[str, Any]]:
        """Get all users from projection"""
        return list(self.projection.values())
```

## Configuration Examples

### Kafka Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.1
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
      ZOOKEEPER_SYNC_LIMIT: 2
  
  kafka:
    image: confluentinc/cp-kafka:7.0.1
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
      KAFKA_DELETE_TOPIC_ENABLE: 'true'
```

### Redis Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
```

## Success Metrics

- [ ] Event schemas are well-defined and validated
- [ ] Producer publishes events reliably
- [ ] Consumer processes events correctly
- [ ] Event store maintains immutable log
- [ ] Projections update read models correctly
- [ ] Dead letter queues handle failed events
- [ ] Performance under load is acceptable
- [ ] Event replay works correctly

## Troubleshooting

### Common Issues

1. **Event Ordering**
   - Use partition keys for ordering within partitions
   - Implement sequence numbers for global ordering
   - Consider event versioning

2. **Duplicate Events**
   - Implement idempotent event handlers
   - Use deduplication based on event IDs
   - Check consumer group configurations

3. **Event Loss**
   - Monitor producer acknowledgments
   - Check consumer offsets
   - Implement retry mechanisms
   - Monitor broker health

4. **Schema Evolution**
   - Use versioned event schemas
   - Implement backward compatibility
   - Use schema validation with optional fields

### Debug Commands

```bash
# List Kafka topics
kafka-topics.sh --bootstrap-server localhost:9092 --list

# Consume events
kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic user-events --from-beginning

# Monitor Redis
redis-cli monitor

# Check consumer groups
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group user-consumer-group
```

## Best Practices

### Event Design

1. **Immutable Events**: Never modify events after creation
2. **Schema Validation**: Validate events against schemas
3. **Event Versioning**: Use semantic versioning for schemas
4. **Idempotency**: Design handlers to be idempotent
5. **Event Envelopes**: Use metadata for context

### Performance

1. **Batch Processing**: Process events in batches
2. **Async Processing**: Use async/await for I/O operations
3. **Connection Pooling**: Reuse connections to brokers
4. **Memory Management**: Manage memory for high-throughput systems

### Security

1. **Event Encryption**: Encrypt sensitive event data
2. **Access Control**: Implement topic-based ACLs
3. **Authentication**: Secure producer/consumer connections
4. **Audit Logging**: Log all event processing
5. **Data Privacy**: Ensure GDPR compliance
