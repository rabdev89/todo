---
id: grpc-api-v1
name: gRPC API Design
category: backend
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: High
status: complete
stacks: [go, python, nodejs]
universal: true
tags: [grpc, api, protobuf, streaming, microservices]
---

# SKILL: gRPC API Design

## Problem

Modern applications need high-performance APIs for:
- Low-latency communication between services
- Type-safe service definitions
- Efficient binary serialization
- Streaming capabilities
- Multi-language client support
- Microservices architecture

Without gRPC:
- REST APIs have higher overhead
- No strict service contracts
- Poor performance for high-frequency calls
- Limited streaming capabilities
- Language-specific serialization issues

## Solution Overview

Implement gRPC services with:
- **Protocol Buffers**: Language-agnostic service definitions
- **Code Generation**: Auto-generated client/server stubs
- **Unary Calls**: Request-response pattern
- **Streaming**: Bidirectional and server streaming
- **Interceptors**: Cross-cutting concerns (auth, logging)
- **Error Handling**: Standardized error responses
- **Health Checks**: gRPC health service integration

This enables type-safe, high-performance APIs with excellent tooling support.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `proto/user.proto` | User service definition | proto | go |
| `proto/auth.proto` | Auth service definition | proto | go |
| `proto/health.proto` | Health service definition | proto | go |
| `internal/service/user/service.go` | User service implementation | service | go |
| `internal/service/auth/service.go` | Auth service implementation | service | go |
| `internal/service/health/service.go` | Health service implementation | service | go |
| `internal/interceptors/auth.go` | Authentication interceptor | middleware | go |
| `internal/interceptors/logging.go` | Logging interceptor | middleware | go |
| `internal/server/grpc_server.go` | gRPC server setup | server | go |
| `cmd/server/main.go` | Server entry point | server | go |
| `proto/user_service.proto` | User service definition | proto | python |
| `services/user_service.py` | User service implementation | service | python |
| `services/auth_service.py` | Auth service implementation | service | python |
| `services/health_service.py` | Health service implementation | service | python |
| `interceptors/auth_interceptor.py` | Authentication interceptor | middleware | python |
| `server/grpc_server.py` | gRPC server setup | server | python |
| `app/main.py` | Application entry point | server | python |

### Code Patterns

#### Stack: Go + gRPC

```protobuf
// proto/user.proto
syntax = "proto3";

package user.v1;

option go_package = "github.com/yourproject/proto/user/v1;userv1";

import "google/protobuf/timestamp.proto";
import "google/protobuf/empty.proto";

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (google.protobuf.Empty);
  rpc SearchUsers(SearchUsersRequest) returns (SearchUsersResponse);
  rpc StreamUsers(StreamUsersRequest) returns (stream UserEvent);
}

message User {
  string id = 1;
  string email = 2;
  string name = 3;
  string avatar_url = 4;
  google.protobuf.Timestamp created_at = 5;
  google.protobuf.Timestamp updated_at = 6;
}

message GetUserRequest {
  string user_id = 1;
}

message GetUserResponse {
  User user = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
  string filter = 3;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total_count = 2;
  int32 page = 3;
}

message CreateUserRequest {
  string email = 2;
  string name = 3;
  string password = 4;
}

message CreateUserResponse {
  User user = 1;
}

message UpdateUserRequest {
  string user_id = 1;
  string email = 2;
  string name = 3;
}

message UpdateUserResponse {
  User user = 1;
}

message DeleteUserRequest {
  string user_id = 1;
}

message SearchUsersRequest {
  string query = 1;
  int32 limit = 2;
}

message SearchUsersResponse {
  repeated User users = 1;
}

message StreamUsersRequest {
  repeated string user_ids = 1;
}

message UserEvent {
  string event_type = 1;
  User user = 2;
  google.protobuf.Timestamp timestamp = 3;
}

// proto/auth.proto
syntax = "proto3";

package auth.v1;

option go_package = "github.com/yourproject/proto/auth/v1;authv1";

service AuthService {
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc Logout(LogoutRequest) returns (LogoutResponse);
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse);
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
}

message LoginRequest {
  string email = 1;
  string password = 2;
}

message LoginResponse {
  string access_token = 1;
  string refresh_token = 2;
  int64 expires_in = 3;
  User user = 4;
}

message LogoutRequest {
  string token = 1;
}

message LogoutResponse {
  bool success = 1;
}

message RefreshTokenRequest {
  string refresh_token = 1;
}

message RefreshTokenResponse {
  string access_token = 1;
  string refresh_token = 2;
  int64 expires_in = 3;
}

message ValidateTokenRequest {
  string token = 1;
}

message ValidateTokenResponse {
  bool valid = 1;
  User user = 2;
}

// proto/health.proto
syntax = "proto3";

package health.v1;

option go_package = "github.com/yourproject/proto/health/v1;healthv1";

import "google/protobuf/empty.proto";

service HealthService {
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
  rpc Watch(HealthWatchRequest) returns (stream HealthCheckResponse);
}

message HealthCheckRequest {
  string service = 1;
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
    SERVICE_UNKNOWN = 3;
  }
  ServingStatus status = 1;
  string message = 2;
}

message HealthWatchRequest {
  int32 interval_seconds = 1;
}

// internal/service/user/service.go
package user

import (
	"context"
	"errors"
	"fmt"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"

	pb "github.com/yourproject/proto/user/v1;userv1"
)

type Server struct {
	pb.UnimplementedUserServiceServer
}

func (s *Server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
	// Validate request
	if req.GetUserId() == "" {
		return nil, status.Error(codes.InvalidArgument, "user_id is required")
	}

	// Get user from database
	user, err := s.getUserFromDB(ctx, req.GetUserId())
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return nil, status.Error(codes.NotFound, "user not found")
		}
		return nil, status.Error(codes.Internal, "database error")
	}

	return user, nil
}

func (s *Server) ListUsers(ctx context.Context, req *pb.ListUsersRequest) (*pb.ListUsersResponse, error) {
	page := int(req.GetPage())
	pageSize := int(req.GetPageSize())
	
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	// Get users from database with pagination
	users, totalCount, err := s.listUsersFromDB(ctx, page, pageSize, req.GetFilter())
	if err != nil {
		return nil, status.Error(codes.Internal, "database error")
	}

	return &pb.ListUsersResponse{
		Users:    users,
		TotalCount: int32(totalCount),
		Page:      int32(page),
	}, nil
}

func (s *Server) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.CreateUserResponse, error) {
	// Validate request
	if req.GetEmail() == "" || req.GetName() == "" || req.GetPassword() == "" {
		return nil, status.Error(codes.InvalidArgument, "email, name, and password are required")
	}

	// Check if user already exists
	exists, err := s.userExistsInDB(ctx, req.GetEmail())
	if err != nil {
		return nil, status.Error(codes.Internal, "database error")
	}
	if exists {
		return nil, status.Error(codes.AlreadyExists, "user already exists")
	}

	// Create user in database
	user, err := s.createUserInDB(ctx, req.GetEmail(), req.GetName(), req.GetPassword())
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to create user")
	}

	return &pb.CreateUserResponse{
		User: user,
	}, nil
}

func (s *Server) UpdateUser(ctx context.Context, req *pb.UpdateUserRequest) (*pb.UpdateUserResponse, error) {
	// Similar validation and database operations
	user, err := s.updateUserInDB(ctx, req.GetUserId(), req.GetEmail(), req.GetName())
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to update user")
	}

	return &pb.UpdateUserResponse{
		User: user,
	}, nil
}

func (s *Server) DeleteUser(ctx context.Context, req *pb.DeleteUserRequest) (*emptypb.Empty, error) {
	err := s.deleteUserFromDB(ctx, req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to delete user")
	}

	return &emptypb.Empty{}, nil
}

func (s *Server) SearchUsers(ctx context.Context, req *pb.SearchUsersRequest) (*pb.SearchUsersResponse, error) {
	limit := int(req.GetLimit())
	if limit < 1 || limit > 100 {
		limit = 20
	}

	users, err := s.searchUsersInDB(ctx, req.GetQuery(), limit)
	if err != nil {
		return nil, status.Error(codes.Internal, "search failed")
	}

	return &pb.SearchUsersResponse{
		Users: users,
	}, nil
}

func (s *Server) StreamUsers(req *pb.StreamUsersRequest, stream pb.UserService_StreamUsersServer) error {
	userIDs := req.GetUserIds()
	
	for _, userID := range userIDs {
		// Get user from database
		user, err := s.getUserFromDB(stream.Context(), userID)
		if err != nil {
			return status.Error(codes.Internal, "failed to get user")
		}

		// Send user event
		event := &pb.UserEvent{
			EventType: "user_update",
			User:      user,
			Timestamp: &timestamppb.Timestamp{
				Seconds: time.Now().Unix(),
			},
		}

		if err := stream.Send(event); err != nil {
			return err
		}
	}

	return nil
}

// Database helper methods (implementations would go here)
func (s *Server) getUserFromDB(ctx context.Context, userID string) (*pb.User, error) {
	// Database implementation
	return &pb.User{
		Id:        userID,
		Email:     "user@example.com",
		Name:       "John Doe",
		AvatarUrl: "https://example.com/avatar.jpg",
		CreatedAt:  &timestamppb.Timestamp{Seconds: time.Now().Unix()},
		UpdatedAt:  &timestamppb.Timestamp{Seconds: time.Now().Unix()},
	}, nil
}

// internal/interceptors/auth.go
package interceptors

import (
	"context"
	"strings"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"

	"github.com/golang-jwt/jwt/v4"
)

type AuthInterceptor struct {
	jwtSecret []byte
}

func NewAuthInterceptor(jwtSecret string) *AuthInterceptor {
	return &AuthInterceptor{
		jwtSecret: []byte(jwtSecret),
	}
}

func (a *AuthInterceptor) Unary() grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		// Skip auth for login endpoint
		if strings.Contains(info.FullMethod, "/auth.v1.AuthService/") {
			return handler(ctx, req)
		}

		// Extract token from metadata
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, grpc.Errorf(codes.Unauthenticated, "missing metadata")
		}

		tokens := md.Get("authorization")
		if len(tokens) == 0 {
			return nil, grpc.Errorf(codes.Unauthenticated, "missing authorization token")
		}

		token := strings.TrimPrefix(tokens[0], "Bearer ")
		
		// Validate JWT token
		claims, err := jwt.Parse(token, a.jwtSecret)
		if err != nil {
			return nil, grpc.Errorf(codes.Unauthenticated, "invalid token: %v", err)
		}

		// Add user info to context
		newCtx := context.WithValue(ctx, "user_id", claims["sub"])
		newCtx = context.WithValue(newCtx, "user", claims)

		return handler(newCtx, req)
	}
}

// internal/server/grpc_server.go
package server

import (
	"net"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	
	pb "github.com/yourproject/proto/user/v1;userv1"
	authpb "github.com/yourproject/proto/auth/v1;authv1"
	healthpb "github.com/yourproject/proto/health/v1;healthv1"
	
	"github.com/yourproject/internal/service/user"
	"github.com/yourproject/internal/service/auth"
	"github.com/yourproject/internal/service/health"
	"github.com/yourproject/internal/interceptors"
)

func RunGRPCServer() error {
	// Create gRPC server
	s := grpc.NewServer(
		grpc.UnaryInterceptor(interceptors.NewAuthInterceptor(os.Getenv("JWT_SECRET")).Unary),
	)

	// Register services
	pb.RegisterUserServiceServer(s, &user.Server{})
	authpb.RegisterAuthServiceServer(s, &auth.Server{})
	healthpb.RegisterHealthServiceServer(s, &health.Server{})

	// Enable reflection for development
	grpc.EnableReflection(s)

	// Create listener
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		return fmt.Errorf("failed to listen: %v", err)
	}

	// Start server
	fmt.Println("gRPC server listening on :50051")
	return s.Serve(lis)
}

// cmd/server/main.go
package main

import (
	"log"
	"os"

	"github.com/yourproject/internal/server"
)

func main() {
	if err := server.RunGRPCServer(); err != nil {
		log.Fatalf("Failed to start gRPC server: %v", err)
	}
}
```

#### Stack: Python + gRPC

```python
# proto/user_service.proto
syntax = "proto3";

package user_service;

import "google/protobuf/timestamp.proto";
import "google/protobuf/empty.proto";

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (google.protobuf.Empty);
}

message User {
  string id = 1;
  string email = 2;
  string name = 3;
  string avatar_url = 4;
  google.protobuf.Timestamp created_at = 5;
  google.protobuf.Timestamp updated_at = 6;
}

message GetUserRequest {
  string user_id = 1;
}

message GetUserResponse {
  User user = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
  string filter = 3;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total_count = 2;
}

# services/user_service.py
import grpc
from concurrent import futures
import time
from typing import Iterable

import user_service_pb2
import user_service_pb2_grpc

class UserServiceServicer(user_service_pb2_grpc.UserServiceServicer):
    def GetUser(self, request, context):
        """Get user by ID"""
        user_id = request.user_id
        
        if not user_id:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("user_id is required")
            return user_service_pb2.GetUserResponse()
        
        # Get user from database
        user = self.get_user_from_db(user_id)
        if not user:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("User not found")
            return user_service_pb2.GetUserResponse()
        
        return user_service_pb2.GetUserResponse(user=user)
    
    def ListUsers(self, request, context):
        """List users with pagination"""
        page = max(1, request.page)
        page_size = min(100, max(1, request.page_size))
        
        users, total_count = self.list_users_from_db(
            page, page_size, request.filter
        )
        
        return user_service_pb2.ListUsersResponse(
            users=users,
            total_count=total_count,
            page=page
        )
    
    def CreateUser(self, request, context):
        """Create new user"""
        if not request.email or not request.name or not request.password:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("email, name, and password are required")
            return user_service_pb2.CreateUserResponse()
        
        # Check if user already exists
        if self.user_exists_in_db(request.email):
            context.set_code(grpc.StatusCode.ALREADY_EXISTS)
            context.set_details("User already exists")
            return user_service_pb2.CreateUserResponse()
        
        # Create user in database
        user = self.create_user_in_db(
            request.email, request.name, request.password
        )
        
        return user_service_pb2.CreateUserResponse(user=user)
    
    def UpdateUser(self, request, context):
        """Update existing user"""
        user = self.get_user_from_db(request.user_id)
        if not user:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("User not found")
            return user_service_pb2.UpdateUserResponse()
        
        # Update user in database
        updated_user = self.update_user_in_db(
            request.user_id, request.email, request.name
        )
        
        return user_service_pb2.UpdateUserResponse(user=updated_user)
    
    def DeleteUser(self, request, context):
        """Delete user"""
        success = self.delete_user_from_db(request.user_id)
        if not success:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("User not found")
            return user_service_pb2.google.protobuf.Empty()
        
        return user_service_pb2.google.protobuf.Empty()
    
    # Database helper methods
    def get_user_from_db(self, user_id):
        """Mock database implementation"""
        return user_service_pb2.User(
            id=user_id,
            email="user@example.com",
            name="John Doe",
            avatar_url="https://example.com/avatar.jpg",
            created_at=time.time(),
            updated_at=time.time()
        )
    
    def list_users_from_db(self, page, page_size, filter_text):
        """Mock database implementation"""
        users = [
            user_service_pb2.User(
                id=f"user_{i}",
                email=f"user{i}@example.com",
                name=f"User {i}",
                avatar_url=f"https://example.com/avatar{i}.jpg"
            )
            for i in range(1, 21)  # Mock 20 users
        ]
        
        if filter_text:
            users = [u for u in users if filter_text.lower() in u.name.lower()]
        
        start_idx = (page - 1) * page_size
        end_idx = min(start_idx + page_size, len(users))
        
        return users[start_idx:end_idx], len(users)
    
    def user_exists_in_db(self, email):
        """Mock database implementation"""
        return email in [f"user{i}@example.com" for i in range(1, 6)]
    
    def create_user_in_db(self, email, name, password):
        """Mock database implementation"""
        return user_service_pb2.User(
            id="new_user_id",
            email=email,
            name=name,
            avatar_url="https://example.com/default_avatar.jpg",
            created_at=time.time(),
            updated_at=time.time()
        )

def serve():
    # Create gRPC server
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    user_service_pb2_grpc.add_UserServiceServicer_to_server(
        UserServiceServicer(), server
    )
    
    # Enable reflection
    server.add_insecure_port('[::]:50051')
    server.add_insecure_port('0.0.0.0:50052')
    
    # Start server
    server.start()
    print("gRPC server started on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
```

## Client Implementation

### Go Client

```go
// client/user_client.go
package client

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	
	pb "github.com/yourproject/proto/user/v1;userv1"
)

type UserClient struct {
	conn   *grpc.ClientConn
	client pb.UserServiceClient
}

func NewUserClient(serverAddr string) (*UserClient, error) {
	// Connect to gRPC server
	conn, err := grpc.Dial(serverAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("failed to connect: %v", err)
	}

	client := pb.NewUserServiceClient(conn)

	return &UserClient{
		conn:   conn,
		client: client,
	}, nil
}

func (c *UserClient) Close() error {
	return c.conn.Close()
}

func (c *UserClient) GetUser(ctx context.Context, userID string) (*pb.User, error) {
	req := &pb.GetUserRequest{
		UserId: userID,
	}

	return c.client.GetUser(ctx, req)
}

func (c *UserClient) ListUsers(ctx context.Context, page, pageSize int32, filter string) (*pb.ListUsersResponse, error) {
	req := &pb.ListUsersRequest{
		Page:     page,
		PageSize:  pageSize,
		Filter:    filter,
	}

	return c.client.ListUsers(ctx, req)
}

func (c *UserClient) CreateUser(ctx context.Context, email, name, password string) (*pb.User, error) {
	req := &pb.CreateUserRequest{
		Email:    email,
		Name:     name,
		Password:  password,
	}

	return c.client.CreateUser(ctx, req)
}

// Usage
func main() {
	client, err := NewUserClient("localhost:50051")
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	defer client.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user
	user, err := client.GetUser(ctx, "user123")
	if err != nil {
		log.Fatalf("GetUser failed: %v", err)
	}

	fmt.Printf("User: %+v\n", user)

	// List users
	users, err := client.ListUsers(ctx, 1, 20, "")
	if err != nil {
		log.Fatalf("ListUsers failed: %v", err)
	}

	fmt.Printf("Found %d users\n", len(users.Users))
}
```

### Python Client

```python
# client/user_client.py
import grpc
import user_service_pb2
import user_service_pb2_grpc

class UserClient:
    def __init__(self, server_address):
        self.channel = grpc.insecure_channel(server_address)
        self.stub = user_service_pb2_grpc.UserServiceStub(self.channel)
    
    def get_user(self, user_id):
        request = user_service_pb2.GetUserRequest(user_id=user_id)
        try:
            response = self.stub.GetUser(request)
            return response.user
        except grpc.RpcError as e:
            print(f"GetUser failed: {e}")
            return None
    
    def list_users(self, page=1, page_size=20, filter=""):
        request = user_service_pb2.ListUsersRequest(
            page=page, page_size=page_size, filter=filter
        )
        try:
            response = self.stub.ListUsers(request)
            return response.users, response.total_count
        except grpc.RpcError as e:
            print(f"ListUsers failed: {e}")
            return [], 0
    
    def create_user(self, email, name, password):
        request = user_service_pb2.CreateUserRequest(
            email=email, name=name, password=password
        )
        try:
            response = self.stub.CreateUser(request)
            return response.user
        except grpc.RpcError as e:
            print(f"CreateUser failed: {e}")
            return None
    
    def close(self):
        self.channel.close()

# Usage
def main():
    client = UserClient('localhost:50051')
    
    try:
        # Get user
        user = client.get_user('user123')
        if user:
            print(f"User: {user.name} ({user.email})")
        
        # List users
        users, total = client.list_users(page=1, page_size=10)
        print(f"Found {len(users)} users out of {total}")
        
        # Create user
        new_user = client.create_user('new@example.com', 'New User', 'password123')
        if new_user:
            print(f"Created user: {new_user.name}")
            
    finally:
        client.close()

if __name__ == '__main__':
    main()
```

## Configuration Examples

### Protocol Buffer Compilation

```bash
# Generate Go code
protoc --go_out=. --go_opt=paths=source_relative proto/*.proto

# Generate Python code
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. proto/*.proto

# Generate JavaScript code
protoc --js_out=import_style=commonjs,binary:. --grpc_out=import_style=commonjs,binary:. proto/*.proto
```

### Docker Configuration

```dockerfile
# gRPC Server Dockerfile
FROM golang:1.19-alpine AS builder

WORKDIR /app
COPY proto/ ./proto/
COPY go.mod go.sum ./
RUN go mod download
RUN go mod tidy
RUN protoc --go_out=. --go_opt=paths=source_relative proto/*.proto

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app .
EXPOSE 50051
CMD ["./server"]
```

## Success Metrics

- [ ] Protocol buffer definitions compile successfully
- [ ] gRPC server starts and accepts connections
- [ ] Unary RPC calls work correctly
- [ ] Streaming RPC calls work correctly
- [ ] Authentication interceptor functions properly
- [ ] Error handling works across all services
- [ ] Client libraries connect and call services
- [ ] Performance is significantly better than REST
- [ ] Type safety maintained across all implementations

## Troubleshooting

### Common Issues

1. **Compilation Failures**
   - Check protoc version compatibility
   - Verify proto file syntax
   - Ensure proper import paths

2. **Connection Refused**
   - Check server is running on correct port
   - Verify firewall settings
   - Ensure proper address binding

3. **Authentication Failures**
   - Verify JWT secret matches between client and server
   - Check token format in metadata
   - Ensure interceptor chain is correct

4. **Streaming Issues**
   - Verify server implements streaming interface correctly
   - Check client context cancellation
   - Monitor for backpressure issues

### Debug Commands

```bash
# Test gRPC service with grpcurl
grpcurl -plaintext -d '{"user_id": "123"}' localhost:50051 user.v1.UserService/GetUser

# List all services via reflection
grpcurl -plaintext localhost:50051 list

# Generate client code
protoc --go_out=. --go_opt=paths=source_relative proto/*.proto

# Test with gRPC CLI
grpc_cli call --method GetUser --arg user_id=123
```

## Best Practices

### Service Design

1. **Idempotency**: Design operations to be idempotent
2. **Error Handling**: Use appropriate gRPC status codes
3. **Validation**: Validate all inputs before processing
4. **Streaming**: Use streaming for large datasets
5. **Deadlines**: Implement proper context cancellation
6. **Metadata**: Use metadata for cross-cutting concerns

### Performance Optimization

1. **Connection Pooling**: Reuse gRPC connections
2. **Compression**: Enable message compression
3. **Flow Control**: Implement proper backpressure handling
4. **Caching**: Cache frequently accessed data
5. **Batching**: Batch multiple operations when possible

### Security

1. **Authentication**: Implement JWT or token-based auth
2. **Authorization**: Use interceptors for permission checks
3. **Encryption**: Use TLS for all connections
4. **Rate Limiting**: Implement rate limiting in interceptors
5. **Validation**: Validate all incoming requests
