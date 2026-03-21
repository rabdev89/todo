---
id: websockets-v1
name: WebSocket Real-Time Communication
category: architecture
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: High
status: complete
stacks: [fastapi, express, django, go]
universal: true
tags: [websockets, real-time, communication, events, streaming]
---

# SKILL: WebSocket Real-Time Communication

## Problem

Modern applications need real-time bidirectional communication for:
- Live notifications and updates
- Real-time collaboration features
- Live dashboards and monitoring
- Chat and messaging systems
- Live data streaming

Without WebSocket support:
- Applications rely on inefficient polling
- Real-time features are impossible
- User experience suffers from latency
- Server resources wasted on repeated requests
- Scalability issues with many concurrent connections

## Solution Overview

Implement WebSocket connections for persistent bidirectional communication:
- **Connection Management**: Handle connection lifecycle
- **Message Routing**: Direct messages to specific clients or groups
- **Room/Channel Support**: Group clients for targeted broadcasting
- **Authentication**: Secure WebSocket connections
- **Error Handling**: Graceful connection failure recovery
- **Scalability**: Support horizontal scaling with Redis pub/sub

This enables instant, efficient real-time communication between clients and server.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `app/websocket/connection_manager.py` | Connection lifecycle | service | fastapi |
| `app/websocket/handlers.py` | Message handlers | controller | fastapi |
| `app/websocket/middleware.py` | Auth middleware | middleware | fastapi |
| `app/websocket/connection_manager.js` | Connection lifecycle | service | express |
| `app/websocket/handlers.js` | Message handlers | controller | express |
| `app/websocket/middleware.js` | Auth middleware | middleware | express |
| `app/websocket/manager.go` | Connection manager | service | go |
| `app/websocket/handlers.go` | Message handlers | controller | go |
| `app/websocket/middleware.go` | Auth middleware | middleware | go |

### Code Patterns

#### Stack: FastAPI + WebSockets

```python
# app/websocket/connection_manager.py
import json
import asyncio
from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
import redis.asyncio as redis
from datetime import datetime
import uuid

class ConnectionManager:
    def __init__(self, redis_url: str = None):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_rooms: Dict[str, Set[str]] = {}
        self.redis_client = None
        
        if redis_url:
            self.redis_client = redis.from_url(redis_url)
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept and store WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_rooms[user_id] = set()
        
        # Notify others of user joining
        await self.broadcast_to_room("system", {
            "type": "user_joined",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        print(f"User {user_id} connected. Total connections: {len(self.active_connections)}")
    
    async def disconnect(self, user_id: str):
        """Remove WebSocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        
        if user_id in self.user_rooms:
            rooms = self.user_rooms[user_id].copy()
            for room in rooms:
                await self.leave_room(user_id, room)
            del self.user_rooms[user_id]
        
        # Notify others of user leaving
        await self.broadcast_to_room("system", {
            "type": "user_left",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        print(f"User {user_id} disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, user_id: str, message: dict):
        """Send message to specific user"""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending to {user_id}: {e}")
                await self.disconnect(user_id)
    
    async def join_room(self, user_id: str, room: str):
        """Add user to room"""
        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = set()
        
        self.user_rooms[user_id].add(room)
        
        # Notify room members
        await self.broadcast_to_room(room, {
            "type": "user_joined_room",
            "user_id": user_id,
            "room": room,
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_user=user_id)
        
        print(f"User {user_id} joined room {room}")
    
    async def leave_room(self, user_id: str, room: str):
        """Remove user from room"""
        if user_id in self.user_rooms:
            self.user_rooms[user_id].discard(room)
            
            # Notify room members
            await self.broadcast_to_room(room, {
                "type": "user_left_room",
                "user_id": user_id,
                "room": room,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            print(f"User {user_id} left room {room}")
    
    async def broadcast_to_room(self, room: str, message: dict, exclude_user: str = None):
        """Broadcast message to all users in room"""
        message_str = json.dumps(message)
        
        # Send to local connections
        disconnected_users = []
        for user_id, websocket in self.active_connections.items():
            if user_id != exclude_user and user_id in self.user_rooms and room in self.user_rooms[user_id]:
                try:
                    await websocket.send_text(message_str)
                except Exception as e:
                    print(f"Error broadcasting to {user_id}: {e}")
                    disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            await self.disconnect(user_id)
        
        # Use Redis for multi-server support
        if self.redis_client:
            await self.redis_client.publish(f"room:{room}", message_str)
    
    async def broadcast_to_all(self, message: dict):
        """Broadcast message to all connected users"""
        message_str = json.dumps(message)
        
        disconnected_users = []
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message_str)
            except Exception as e:
                print(f"Error broadcasting to {user_id}: {e}")
                disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            await self.disconnect(user_id)
        
        # Use Redis for multi-server support
        if self.redis_client:
            await self.redis_client.publish("broadcast", message_str)
    
    async def get_connection_stats(self):
        """Get connection statistics"""
        return {
            "total_connections": len(self.active_connections),
            "rooms": {
                room: len([uid for uid, rooms in self.user_rooms.items() if room in rooms])
                for room in set(room for rooms in self.user_rooms.values() for room in rooms)
            },
            "users": list(self.active_connections.keys())
        }

# app/websocket/middleware.py
from fastapi import WebSocket, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

security = HTTPBearer()

async def get_current_user_websocket(
    websocket: WebSocket,
    token: str = None
):
    """Authenticate WebSocket connection"""
    
    if not token:
        await websocket.close(code=4001, reason="Authentication required")
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Verify JWT token
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET_KEY"),
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        
        if not user_id:
            raise jwt.InvalidTokenError("Invalid token payload")
        
        return user_id
        
    except jwt.ExpiredSignatureError:
        await websocket.close(code=4002, reason="Token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        await websocket.close(code=4003, reason="Invalid token")
        raise HTTPException(status_code=401, detail="Invalid token")

# app/websocket/handlers.py
from fastapi import WebSocket, Depends
from app.websocket.connection_manager import ConnectionManager
from app.websocket.middleware import get_current_user_websocket
import json
import asyncio

class WebSocketHandlers:
    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
    
    async def handle_connection(self, websocket: WebSocket, user_id: str):
        """Main WebSocket connection handler"""
        try:
            await self.connection_manager.connect(websocket, user_id)
            
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Route message based on type
                await self.route_message(user_id, message)
                
        except Exception as e:
            print(f"WebSocket error for {user_id}: {e}")
        finally:
            await self.connection_manager.disconnect(user_id)
    
    async def route_message(self, user_id: str, message: dict):
        """Route incoming message to appropriate handler"""
        message_type = message.get("type")
        
        if message_type == "join_room":
            room = message.get("room")
            if room:
                await self.connection_manager.join_room(user_id, room)
        
        elif message_type == "leave_room":
            room = message.get("room")
            if room:
                await self.connection_manager.leave_room(user_id, room)
        
        elif message_type == "chat_message":
            room = message.get("room", "general")
            await self.connection_manager.broadcast_to_room(room, {
                "type": "chat_message",
                "user_id": user_id,
                "message": message.get("message"),
                "timestamp": datetime.utcnow().isoformat()
            })
        
        elif message_type == "direct_message":
            target_user = message.get("target_user")
            if target_user:
                await self.connection_manager.send_personal_message(target_user, {
                    "type": "direct_message",
                    "from_user": user_id,
                    "message": message.get("message"),
                    "timestamp": datetime.utcnow().isoformat()
                })
        
        elif message_type == "typing":
            room = message.get("room", "general")
            await self.connection_manager.broadcast_to_room(room, {
                "type": "typing",
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }, exclude_user=user_id)
        
        elif message_type == "ping":
            await self.connection_manager.send_personal_message(user_id, {
                "type": "pong",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        else:
            await self.connection_manager.send_personal_message(user_id, {
                "type": "error",
                "message": f"Unknown message type: {message_type}",
                "timestamp": datetime.utcnow().isoformat()
            })

# app/api/websocket.py
from fastapi import WebSocket, APIRouter, Depends, Query
from app.websocket.connection_manager import ConnectionManager
from app.websocket.handlers import WebSocketHandlers
from app.websocket.middleware import get_current_user_websocket

router = APIRouter(prefix="/ws", tags=["WebSocket"])

# Global connection manager
connection_manager = ConnectionManager(
    redis_url=os.getenv("REDIS_URL")
)
handlers = WebSocketHandlers(connection_manager)

@router.websocket("/connect")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    user_id: str = Depends(get_current_user_websocket)
):
    """Main WebSocket endpoint"""
    await handlers.handle_connection(websocket, user_id)

@router.get("/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    return await connection_manager.get_connection_stats()

# app/main.py
from fastapi import FastAPI
from app.api.websocket import router as websocket_router

app = FastAPI(title="BOB Framework API")

app.include_router(websocket_router)
```

#### Stack: Express.js + WebSockets

```javascript
// app/websocket/connection_manager.js
const WebSocket = require('ws');
const redis = require('redis');
const jwt = require('jsonwebtoken');

class ConnectionManager {
    constructor(redisUrl = null) {
        this.connections = new Map(); // userId -> WebSocket
        this.userRooms = new Map(); // userId -> Set of rooms
        this.redisClient = null;
        
        if (redisUrl) {
            this.redisClient = redis.createClient({ url: redisUrl });
            this.redisClient.connect();
            this.setupRedisSubscriptions();
        }
    }
    
    setupRedisSubscriptions() {
        this.redisClient.subscribe('broadcast');
        this.redisClient.subscribe('room:*');
        
        this.redisClient.on('message', (channel, message) => {
            if (channel === 'broadcast') {
                this.broadcastToAll(JSON.parse(message));
            } else if (channel.startsWith('room:')) {
                const room = channel.replace('room:', '');
                this.broadcastToRoom(room, JSON.parse(message));
            }
        });
    }
    
    connect(ws, userId) {
        this.connections.set(userId, ws);
        this.userRooms.set(userId, new Set());
        
        // Notify others of user joining
        this.broadcastToRoom('system', {
            type: 'user_joined',
            user_id: userId,
            timestamp: new Date().toISOString()
        });
        
        console.log(`User ${userId} connected. Total connections: ${this.connections.size}`);
        
        // Handle WebSocket events
        ws.on('close', () => this.disconnect(userId));
        ws.on('error', (error) => {
            console.error(`WebSocket error for ${userId}:`, error);
            this.disconnect(userId);
        });
        
        // Send welcome message
        ws.send(JSON.stringify({
            type: 'connected',
            user_id: userId,
            timestamp: new Date().toISOString()
        }));
    }
    
    disconnect(userId) {
        const ws = this.connections.get(userId);
        if (ws) {
            ws.terminate();
            this.connections.delete(userId);
        }
        
        // Remove from all rooms
        if (this.userRooms.has(userId)) {
            const rooms = Array.from(this.userRooms.get(userId));
            for (const room of rooms) {
                this.leaveRoom(userId, room);
            }
            this.userRooms.delete(userId);
        }
        
        // Notify others of user leaving
        this.broadcastToRoom('system', {
            type: 'user_left',
            user_id: userId,
            timestamp: new Date().toISOString()
        });
        
        console.log(`User ${userId} disconnected. Total connections: ${this.connections.size}`);
    }
    
    sendPersonalMessage(userId, message) {
        const ws = this.connections.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error(`Error sending to ${userId}:`, error);
                this.disconnect(userId);
            }
        }
    }
    
    joinRoom(userId, room) {
        if (!this.userRooms.has(userId)) {
            this.userRooms.set(userId, new Set());
        }
        
        this.userRooms.get(userId).add(room);
        
        // Notify room members
        this.broadcastToRoom(room, {
            type: 'user_joined_room',
            user_id: userId,
            room: room,
            timestamp: new Date().toISOString()
        }, userId);
        
        console.log(`User ${userId} joined room ${room}`);
    }
    
    leaveRoom(userId, room) {
        if (this.userRooms.has(userId)) {
            this.userRooms.get(userId).delete(room);
            
            // Notify room members
            this.broadcastToRoom(room, {
                type: 'user_left_room',
                user_id: userId,
                room: room,
                timestamp: new Date().toISOString()
            });
            
            console.log(`User ${userId} left room ${room}`);
        }
    }
    
    broadcastToRoom(room, message, excludeUserId = null) {
        const messageStr = JSON.stringify(message);
        
        // Send to local connections
        for (const [userId, ws] of this.connections) {
            if (userId !== excludeUserId && 
                this.userRooms.has(userId) && 
                this.userRooms.get(userId).has(room)) {
                
                if (ws.readyState === WebSocket.OPEN) {
                    try {
                        ws.send(messageStr);
                    } catch (error) {
                        console.error(`Error broadcasting to ${userId}:`, error);
                        this.disconnect(userId);
                    }
                }
            }
        }
        
        // Use Redis for multi-server support
        if (this.redisClient) {
            this.redisClient.publish(`room:${room}`, messageStr);
        }
    }
    
    broadcastToAll(message) {
        const messageStr = JSON.stringify(message);
        
        // Send to local connections
        for (const [userId, ws] of this.connections) {
            if (ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(messageStr);
                } catch (error) {
                    console.error(`Error broadcasting to ${userId}:`, error);
                    this.disconnect(userId);
                }
            }
        }
        
        // Use Redis for multi-server support
        if (this.redisClient) {
            this.redisClient.publish('broadcast', messageStr);
        }
    }
    
    getConnectionStats() {
        const rooms = {};
        for (const [userId, userRooms] of this.userRooms) {
            for (const room of userRooms) {
                rooms[room] = (rooms[room] || 0) + 1;
            }
        }
        
        return {
            total_connections: this.connections.size,
            rooms,
            users: Array.from(this.connections.keys())
        };
    }
}

module.exports = ConnectionManager;

// app/websocket/middleware.js
const jwt = require('jsonwebtoken');

function authenticateWebSocket(socket, next) {
    const token = socket.handshake.query.token;
    
    if (!token) {
        socket.close(4001, 'Authentication required');
        return next(new Error('Authentication required'));
    }
    
    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );
        
        socket.userId = payload.sub;
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            socket.close(4002, 'Token expired');
        } else {
            socket.close(4003, 'Invalid token');
        }
        next(error);
    }
}

module.exports = { authenticateWebSocket };

// app/websocket/handlers.js
class WebSocketHandlers {
    constructor(connectionManager) {
        this.connectionManager = connectionManager;
    }
    
    async handleMessage(userId, message) {
        const messageType = message.type;
        
        switch (messageType) {
            case 'join_room':
                if (message.room) {
                    await this.connectionManager.joinRoom(userId, message.room);
                }
                break;
                
            case 'leave_room':
                if (message.room) {
                    await this.connectionManager.leaveRoom(userId, message.room);
                }
                break;
                
            case 'chat_message':
                const room = message.room || 'general';
                this.connectionManager.broadcastToRoom(room, {
                    type: 'chat_message',
                    user_id: userId,
                    message: message.message,
                    timestamp: new Date().toISOString()
                });
                break;
                
            case 'direct_message':
                if (message.target_user) {
                    this.connectionManager.sendPersonalMessage(message.target_user, {
                        type: 'direct_message',
                        from_user: userId,
                        message: message.message,
                        timestamp: new Date().toISOString()
                    });
                }
                break;
                
            case 'typing':
                const typingRoom = message.room || 'general';
                this.connectionManager.broadcastToRoom(typingRoom, {
                    type: 'typing',
                    user_id: userId,
                    timestamp: new Date().toISOString()
                }, userId);
                break;
                
            case 'ping':
                this.connectionManager.sendPersonalMessage(userId, {
                    type: 'pong',
                    timestamp: new Date().toISOString()
                });
                break;
                
            default:
                this.connectionManager.sendPersonalMessage(userId, {
                    type: 'error',
                    message: `Unknown message type: ${messageType}`,
                    timestamp: new Date().toISOString()
                });
        }
    }
}

module.exports = WebSocketHandlers;

// app/websocket/server.js
const WebSocket = require('ws');
const ConnectionManager = require('./connection_manager');
const WebSocketHandlers = require('./handlers');
const { authenticateWebSocket } = require('./middleware');

class WebSocketServer {
    constructor(server, options = {}) {
        this.wss = new WebSocket.Server({ 
            server,
            path: '/ws/connect'
        });
        
        this.connectionManager = new ConnectionManager(
            process.env.REDIS_URL
        );
        this.handlers = new WebSocketHandlers(this.connectionManager);
        
        this.setupServer();
    }
    
    setupServer() {
        this.wss.on('connection', (ws, req) => {
            // Authenticate connection
            authenticateWebSocket(ws, (error) => {
                if (error) {
                    return;
                }
                
                const userId = ws.userId;
                
                // Handle messages
                ws.on('message', (data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        this.handlers.handleMessage(userId, message);
                    } catch (error) {
                        console.error('Invalid message format:', error);
                    }
                });
                
                // Connect to manager
                this.connectionManager.connect(ws, userId);
            });
        });
        
        console.log('WebSocket server started');
    }
}

module.exports = WebSocketServer;

// app.js
const express = require('express');
const http = require('http');
const WebSocketServer = require('./app/websocket/server');

const app = express();
const server = http.createServer(app);

// Setup WebSocket server
const wsServer = new WebSocketServer(server);

app.get('/ws/stats', (req, res) => {
    res.json(wsServer.connectionManager.getConnectionStats());
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

#### Stack: Go + WebSockets

```go
// app/websocket/manager.go
package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/go-redis/redis/v8"
)

type Client struct {
	ID     string
	Rooms map[string]bool
	Conn   *websocket.Conn
	Send   chan []byte
}

type Hub struct {
	clients    map[string]*Client
	register   chan *Client
	unregister chan string
	broadcast  chan []byte
	rooms      map[string]map[string]*Client
	mutex      sync.RWMutex
	redis      *redis.Client
}

type Message struct {
	Type      string      `json:"type"`
	UserID    string      `json:"user_id,omitempty"`
	Room      string      `json:"room,omitempty"`
	Message   string      `json:"message,omitempty"`
	Target    string      `json:"target_user,omitempty"`
	Timestamp string      `json:"timestamp"`
	Data      interface{} `json:"data,omitempty"`
}

func NewHub(redisURL string) *Hub {
	hub := &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan string),
		broadcast:  make(chan []byte),
		rooms:      make(map[string]map[string]*Client),
	}
	
	if redisURL != "" {
		hub.redis = redis.NewClient(&redis.Options{
			Addr: redisURL,
		})
		hub.setupRedisSubscriptions()
	}
	
	go hub.run()
	return hub
}

func (h *Hub) setupRedisSubscriptions() {
	ctx := context.Background()
	
	// Subscribe to broadcast channel
	pubsub := h.redis.Subscribe(ctx, "broadcast", "room:*")
	
	go func() {
		for msg := range pubsub.Channel() {
			var message []byte
			if msg.Channel == "broadcast" {
				message = []byte(msg.Payload)
			} else if strings.HasPrefix(msg.Channel, "room:") {
				room := strings.TrimPrefix(msg.Channel, "room:")
				h.broadcastToRoom(room, message)
				continue
			}
			
			select {
			case h.broadcast <- message:
			default:
				close(h.broadcast)
			}
		}
	}()
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client.ID] = client
			h.rooms[client.ID] = make(map[string]bool)
			h.mutex.Unlock()
			
			// Notify others
			h.broadcastToRoom("system", Message{
				Type:      "user_joined",
				UserID:    client.ID,
				Timestamp: time.Now().UTC().Format(time.RFC3339),
			})
			
			log.Printf("User %s connected. Total connections: %d", client.ID, len(h.clients))
			
		case userID := <-h.unregister:
			h.mutex.Lock()
			if client, ok := h.clients[userID]; ok {
				// Remove from all rooms
				for room := range client.Rooms {
					h.leaveRoomUnsafe(userID, room)
				}
				
				delete(h.clients, userID)
				close(client.Send)
			}
			h.mutex.Unlock()
			
			// Notify others
			h.broadcastToRoom("system", Message{
				Type:      "user_left",
				UserID:    userID,
				Timestamp: time.Now().UTC().Format(time.RFC3339),
			})
			
			log.Printf("User %s disconnected. Total connections: %d", userID, len(h.clients))
			
		case message := <-h.broadcast:
			h.mutex.RLock()
			for _, client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

func (h *Hub) registerClient(client *Client) {
	h.register <- client
}

func (h *Hub) unregisterClient(userID string) {
	h.unregister <- userID
}

func (h *Hub) joinRoom(userID, room string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	
	if client, ok := h.clients[userID]; ok {
		client.Rooms[room] = true
		
		if h.rooms[room] == nil {
			h.rooms[room] = make(map[string]*Client)
		}
		h.rooms[room][userID] = client
		
		// Notify room members
		h.broadcastToRoomUnsafe(room, Message{
			Type:      "user_joined_room",
			UserID:    userID,
			Room:      room,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}, userID)
		
		log.Printf("User %s joined room %s", userID, room)
	}
}

func (h *Hub) leaveRoom(userID, room string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	
	h.leaveRoomUnsafe(userID, room)
}

func (h *Hub) leaveRoomUnsafe(userID, room string) {
	if client, ok := h.clients[userID]; ok {
		delete(client.Rooms, room)
		
		if roomClients, ok := h.rooms[room]; ok {
			delete(roomClients, userID)
			if len(roomClients) == 0 {
				delete(h.rooms, room)
			}
		}
		
		// Notify room members
		h.broadcastToRoomUnsafe(room, Message{
			Type:      "user_left_room",
			UserID:    userID,
			Room:      room,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		})
		
		log.Printf("User %s left room %s", userID, room)
	}
}

func (h *Hub) broadcastToRoom(room string, message Message) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	h.broadcastToRoomUnsafe(room, message)
}

func (h *Hub) broadcastToRoomUnsafe(room string, message Message) {
	messageJSON, _ := json.Marshal(message)
	
	// Send to local clients
	if roomClients, ok := h.rooms[room]; ok {
		for userID, client := range roomClients {
			if userID != message.UserID {
				select {
				case client.Send <- messageJSON:
				default:
					close(client.Send)
				}
			}
		}
	}
	
	// Use Redis for multi-server support
	if h.redis != nil {
		h.redis.Publish(context.Background(), "room:"+room, messageJSON)
	}
}

func (h *Hub) sendPersonalMessage(userID string, message Message) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	if client, ok := h.clients[userID]; ok {
		messageJSON, _ := json.Marshal(message)
		select {
		case client.Send <- messageJSON:
		default:
			close(client.Send)
		}
	}
}

func (h *Hub) broadcastToAll(message Message) {
	messageJSON, _ := json.Marshal(message)
	
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	for _, client := range h.clients {
		select {
		case client.Send <- messageJSON:
		default:
			close(client.Send)
		}
	}
	
	// Use Redis for multi-server support
	if h.redis != nil {
		h.redis.Publish(context.Background(), "broadcast", messageJSON)
	}
}

func (h *Hub) getStats() map[string]interface{} {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	roomStats := make(map[string]int)
	for room, clients := range h.rooms {
		roomStats[room] = len(clients)
	}
	
	users := make([]string, 0, len(h.clients))
	for userID := range h.clients {
		users = append(users, userID)
	}
	
	return map[string]interface{}{
		"total_connections": len(h.clients),
		"rooms":           roomStats,
		"users":           users,
	}
}

// app/websocket/handlers.go
package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WebSocketHandlers struct {
	hub *Hub
}

func NewWebSocketHandlers(hub *Hub) *WebSocketHandlers {
	return &WebSocketHandlers{hub: hub}
}

func (h *WebSocketHandlers) HandleWebSocket(c *gin.Context) {
	// Upgrade HTTP connection to WebSocket
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins in development
		},
	}
	
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	
	// Get user ID from token (simplified)
	userID := c.Query("user_id")
	if userID == "" {
		conn.Close()
		return
	}
	
	// Create client
	client := &Client{
		ID:     userID,
		Rooms:  make(map[string]bool),
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}
	
	// Register client
	h.hub.registerClient(client)
	
	// Start goroutines for reading/writing
	go h.readPump(client)
	go h.writePump(client)
}

func (h *WebSocketHandlers) readPump(client *Client) {
	defer func() {
		h.hub.unregisterClient(client.ID)
		client.Conn.Close()
	}()
	
	client.Conn.SetReadLimit(512)
	client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	
	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
		
		// Parse and handle message
		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("Invalid message: %v", err)
			continue
		}
		
		msg.UserID = client.ID
		msg.Timestamp = time.Now().UTC().Format(time.RFC3339)
		
		h.routeMessage(client.ID, msg)
	}
}

func (h *WebSocketHandlers) writePump(client *Client) {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		client.Conn.Close()
	}()
	
	for {
		select {
		case message, ok := <-client.Send:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			
			if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
			
		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (h *WebSocketHandlers) routeMessage(userID string, msg Message) {
	switch msg.Type {
	case "join_room":
		if msg.Room != "" {
			h.hub.joinRoom(userID, msg.Room)
		}
		
	case "leave_room":
		if msg.Room != "" {
			h.hub.leaveRoom(userID, msg.Room)
		}
		
	case "chat_message":
		room := "general"
		if msg.Room != "" {
			room = msg.Room
		}
		h.hub.broadcastToRoom(room, msg)
		
	case "direct_message":
		if msg.Target != "" {
			h.hub.sendPersonalMessage(msg.Target, msg)
		}
		
	case "typing":
		room := "general"
		if msg.Room != "" {
			room = msg.Room
		}
		h.hub.broadcastToRoom(room, msg)
		
	case "ping":
		h.hub.sendPersonalMessage(userID, Message{
			Type:      "pong",
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		})
		
	default:
		h.hub.sendPersonalMessage(userID, Message{
			Type:      "error",
			Message:   "Unknown message type: " + msg.Type,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		})
	}
}

// app/websocket/routes.go
package websocket

import (
	"net/http"
	
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, hub *Hub) {
	handlers := NewWebSocketHandlers(hub)
	
	r.GET("/ws/stats", func(c *gin.Context) {
		c.JSON(http.StatusOK, hub.getStats())
	})
	
	r.GET("/ws/connect", func(c *gin.Context) {
		handlers.HandleWebSocket(c)
	})
}

// main.go
package main

import (
	"log"
	"os"
	"bob-framework/websocket"
	
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func main() {
	r := gin.Default()
	
	// Create WebSocket hub
	hub := websocket.NewHub(os.Getenv("REDIS_URL"))
	
	// Setup WebSocket routes
	websocket.SetupRoutes(r, hub)
	
	r.Run(":8080")
}
```

## Client Implementation

### JavaScript Client

```javascript
class WebSocketClient {
    constructor(url, token) {
        this.url = url;
        this.token = token;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000;
    }
    
    connect() {
        const wsUrl = `${this.url}?token=${this.token}`;
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('Connected to WebSocket');
            this.reconnectAttempts = 0;
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    handleMessage(message) {
        switch (message.type) {
            case 'connected':
                console.log('Successfully connected:', message.user_id);
                break;
                
            case 'chat_message':
                this.displayChatMessage(message);
                break;
                
            case 'user_joined_room':
                this.displayUserJoined(message);
                break;
                
            case 'user_left_room':
                this.displayUserLeft(message);
                break;
                
            case 'typing':
                this.displayTypingIndicator(message);
                break;
                
            case 'pong':
                console.log('Pong received');
                break;
                
            case 'error':
                console.error('Server error:', message.message);
                break;
        }
    }
    
    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
    
    joinRoom(room) {
        this.send({
            type: 'join_room',
            room: room
        });
    }
    
    leaveRoom(room) {
        this.send({
            type: 'leave_room',
            room: room
        });
    }
    
    sendChatMessage(room, message) {
        this.send({
            type: 'chat_message',
            room: room,
            message: message
        });
    }
    
    sendDirectMessage(userId, message) {
        this.send({
            type: 'direct_message',
            target_user: userId,
            message: message
        });
    }
    
    startTyping(room) {
        this.send({
            type: 'typing',
            room: room
        });
    }
    
    ping() {
        this.send({
            type: 'ping'
        });
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }
    
    // UI methods (implement based on your framework)
    displayChatMessage(message) {
        console.log(`${message.user_id}: ${message.message}`);
    }
    
    displayUserJoined(message) {
        console.log(`${message.user_id} joined room ${message.room}`);
    }
    
    displayUserLeft(message) {
        console.log(`${message.user_id} left room ${message.room}`);
    }
    
    displayTypingIndicator(message) {
        console.log(`${message.user_id} is typing...`);
    }
}

// Usage
const client = new WebSocketClient('ws://localhost:8000/ws/connect', 'your-jwt-token');
client.connect();

// Join a room
client.joinRoom('general');

// Send a message
client.sendChatMessage('general', 'Hello, world!');
```

## Configuration Examples

### Environment Variables

```bash
# .env
JWT_SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379
WS_PORT=8000
WS_PATH=/ws/connect
```

### Docker Configuration

```dockerfile
# WebSocket-friendly Dockerfile
FROM node:16-alpine

# Install WebSocket dependencies
RUN npm install ws redis

EXPOSE 3000

CMD ["npm", "start"]
```

### Nginx WebSocket Proxy

```nginx
# nginx.conf
http {
    upstream websocket {
        server localhost:3000;
    }
    
    server {
        listen 80;
        
        location /ws/ {
            proxy_pass http://websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Success Metrics

- [ ] WebSocket connections established successfully
- [ ] Real-time message delivery works
- [ ] Room/channel functionality operational
- [ ] Authentication and authorization work
- [ ] Connection reconnection on failure
- [ ] Multi-server scaling with Redis pub/sub
- [ ] Performance under load (1000+ connections)
- [ ] Error handling and graceful degradation
- [ ] Client-side reconnection logic works
- [ ] Message routing and filtering work correctly

## Troubleshooting

### Common Issues

1. **Connection Failures**
   - Check WebSocket endpoint URL
   - Verify authentication token
   - Ensure firewall allows WebSocket connections

2. **Message Loss**
   - Check connection state before sending
   - Implement message queuing for disconnected clients
   - Add delivery confirmations

3. **Performance Issues**
   - Monitor connection count
   - Implement connection pooling
   - Use message batching for high-frequency updates

4. **Scaling Problems**
   - Use Redis pub/sub for multi-server support
   - Implement connection load balancing
   - Monitor memory usage per connection

### Debug Commands

```bash
# Test WebSocket connection
wscat -c ws://localhost:8000/ws/connect?token=your-token

# Monitor Redis pub/sub
redis-cli monitor

# Check connection count
curl http://localhost:8000/ws/stats

# Monitor WebSocket traffic
chrome://inspect/#devices
```
