---
id: graphql-api-v1
name: GraphQL API Design
category: backend
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: High
status: complete
stacks: [nodejs, python, go]
universal: true
tags: [graphql, api, schema, resolvers, subscriptions]
---

# SKILL: GraphQL API Design

## Problem

Modern applications need flexible APIs for:
- Efficient data fetching with specific fields
- Single endpoint for multiple data types
- Strongly typed schema definitions
- Real-time data subscriptions
- Introspection and self-documentation
- Mobile-friendly data fetching

Without GraphQL:
- REST over-fetching or under-fetching
- Multiple round trips for related data
- Versioning challenges with endpoints
- No built-in documentation
- Limited client-side optimization opportunities

## Solution Overview

Implement GraphQL APIs with:
- **Schema Definition**: Type-safe API contracts
- **Resolvers**: Data fetching and business logic
- **Query/Mutation**: Read and write operations
- **Subscriptions**: Real-time data updates
- **Data Loaders**: N+1 query problem prevention
- **Authentication**: JWT integration and authorization
- **Performance**: Query optimization and caching

This enables flexible, efficient APIs with excellent developer experience.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `schema/typeDefs.js` | GraphQL schema definitions | schema | nodejs |
| `resolvers/userResolver.js` | User resolvers | resolver | nodejs |
| `resolvers/postResolver.js` | Post resolvers | resolver | nodejs |
| `schema/loaders.js` | Data loaders for batching | loader | nodejs |
| `middleware/auth.js` | Authentication middleware | middleware | nodejs |
| `server/graphqlServer.js` | GraphQL server setup | server | nodejs |
| `app.js` | Application entry point | server | nodejs |
| `schema/schema.graphql` | GraphQL schema definitions | schema | python |
| `resolvers/user_resolver.py` | User resolvers | resolver | python |
| `resolvers/post_resolver.py` | Post resolvers | resolver | python |
| `loaders/data_loaders.py` | Data loaders for batching | loader | python |
| `middleware/auth.py` | Authentication middleware | middleware | python |
| `server/graphql_server.py` | GraphQL server setup | server | python |
| `app.py` | Application entry point | server | python |
| `schema/schema.graphql` | GraphQL schema definitions | schema | go |
| `resolvers/user_resolver.go` | User resolvers | resolver | go |
| `resolvers/post_resolver.go` | Post resolvers | resolver | go |
| `loaders/data_loaders.go` | Data loaders for batching | loader | go |
| `middleware/auth.go` | Authentication middleware | middleware | go |
| `server/graphql_server.go` | GraphQL server setup | server | go |
| `main.go` | Application entry point | server | go |

### Code Patterns

#### Stack: Node.js + Apollo Server

```javascript
// schema/typeDefs.js
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    avatarUrl: String
    createdAt: String!
    updatedAt: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String
    user: User
  }

  input CreateUserInput {
    email: String!
    name: String!
    password: String!
  }

  input CreatePostInput {
    title: String!
    content: String!
  }

  type Query {
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    posts(limit: Int, offset: Int): [Post!]!
    searchPosts(query: String!): [Post!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    logout: AuthPayload!
    createUser(input: CreateUserInput!): User!
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: CreatePostInput!): Post!
    deletePost(id: ID!): Boolean!
  }

  type Subscription {
    postCreated: Post!
    userUpdated: User!
  }
`;

module.exports = typeDefs;

// resolvers/userResolver.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');

class UserResolver {
  constructor() {
    this.users = new Map(); // Mock database
  }

  async me(parent, args, context) {
    if (!context.user) {
      throw new AuthenticationError('Not authenticated');
    }
    return context.user;
  }

  async user(parent, { id }, context) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async users(parent, { limit = 20, offset = 0 }, context) {
    const allUsers = Array.from(this.users.values());
    return allUsers.slice(offset, offset + limit);
  }

  async createUser(parent, { input }, context) {
    const { email, name, password } = input;
    
    // Check if user already exists
    for (const [id, user] of this.users) {
      if (user.email === email) {
        throw new Error('User already exists');
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: `user_${Date.now()}`,
      email,
      name,
      password: hashedPassword,
      avatarUrl: `https://example.com/avatar/${Date.now()}.jpg`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      posts: []
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async login(parent, { email, password }, context) {
    // Find user
    let user = null;
    for (const [id, u] of this.users) {
      if (u.email === email) {
        user = u;
        break;
      }
    }
    
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        posts: user.posts
      }
    };
  }

  async logout(parent, args, context) {
    // In a real app, you would invalidate the token
    return {
      token: null,
      user: null
    };
  }
}

module.exports = UserResolver;

// resolvers/postResolver.js
class PostResolver {
  constructor() {
    this.posts = new Map(); // Mock database
  }

  async post(parent, { id }, context) {
    const post = this.posts.get(id);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }

  async posts(parent, { limit = 20, offset = 0 }, context) {
    const allPosts = Array.from(this.posts.values());
    return allPosts.slice(offset, offset + limit);
  }

  async searchPosts(parent, { query }, context) {
    const allPosts = Array.from(this.posts.values());
    const searchTerm = query.toLowerCase();
    
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm)
    );
  }

  async createPost(parent, { input }, context) {
    if (!context.user) {
      throw new AuthenticationError('Not authenticated');
    }
    
    const post = {
      id: `post_${Date.now()}`,
      title: input.title,
      content: input.content,
      author: context.user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.posts.set(post.id, post);
    
    // Update user's posts
    context.user.posts.push(post);
    
    return post;
  }

  async updatePost(parent, { id, input }, context) {
    if (!context.user) {
      throw new AuthenticationError('Not authenticated');
    }
    
    const post = this.posts.get(id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    if (post.author.id !== context.user.id) {
      throw new AuthenticationError('Not authorized');
    }
    
    const updatedPost = {
      ...post,
      title: input.title,
      content: input.content,
      updatedAt: new Date().toISOString()
    };
    
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(parent, { id }, context) {
    if (!context.user) {
      throw new AuthenticationError('Not authenticated');
    }
    
    const post = this.posts.get(id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    if (post.author.id !== context.user.id) {
      throw new AuthenticationError('Not authorized');
    }
    
    this.posts.delete(id);
    return true;
  }
}

module.exports = PostResolver;

// schema/loaders.js
const { DataLoader } = require('dataloader');

class Loaders {
  constructor(userResolver, postResolver) {
    this.userLoader = new DataLoader(async (userIds) => {
      const users = await Promise.all(
        userIds.map(id => userResolver.user(null, { id }))
      );
      return users;
    });
    
    this.postLoader = new DataLoader(async (postIds) => {
      const posts = await Promise.all(
        postIds.map(id => postResolver.post(null, { id }))
      );
      return posts;
    });
  }

  getUserLoader() {
    return this.userLoader;
  }

  getPostLoader() {
    return this.postLoader;
  }
}

module.exports = Loaders;

// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.sub,
      email: decoded.email
    };
  } catch (error) {
    req.user = null;
  }
  
  next();
};

module.exports = authMiddleware;

// server/graphqlServer.js
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginLandingPageDisabled } = require('apollo-server-core');
const { createServer } = require('http');
const express = require('express');
const cors = require('cors');

const { typeDefs } = require('../schema/typeDefs');
const UserResolver = require('../resolvers/userResolver');
const PostResolver = require('../resolvers/postResolver');
const Loaders = require('../schema/loaders');
const authMiddleware = require('../middleware/auth');

class GraphQLServer {
  constructor() {
    this.userResolver = new UserResolver();
    this.postResolver = new PostResolver();
    this.loaders = new Loaders(this.userResolver, this.postResolver);
  }

  createServer() {
    const app = express();
    
    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(authMiddleware);

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers: {
        Query: {
          me: () => this.userResolver.me,
          user: (parent, args) => this.userResolver.user(parent, args),
          users: (parent, args) => this.userResolver.users(parent, args),
          posts: (parent, args) => this.postResolver.posts(parent, args),
          searchPosts: (parent, args) => this.postResolver.searchPosts(parent, args)
        },
        Mutation: {
          login: (parent, args) => this.userResolver.login(parent, args),
          logout: (parent, args) => this.userResolver.logout(parent, args),
          createUser: (parent, args) => this.userResolver.createUser(parent, args),
          createPost: (parent, args) => this.postResolver.createPost(parent, args),
          updatePost: (parent, args) => this.postResolver.updatePost(parent, args),
          deletePost: (parent, args) => this.postResolver.deletePost(parent, args)
        },
        Subscription: {
          postCreated: {
            subscribe: () => this.postCreatedSubscription()
          },
          userUpdated: {
            subscribe: () => this.userUpdatedSubscription()
          }
        }
      },
      context: ({ req }) => ({
        user: req.user,
        loaders: this.loaders
      }),
      plugins: [
        ApolloServerPluginLandingPageDisabled(),
        {
          requestDidStart() {
            console.log('GraphQL request started');
          },
          requestDidEnd() {
            console.log('GraphQL request ended');
          }
        }
      ],
      introspection: true,
      playground: true
    });

    return server;
  }

  async postCreatedSubscription() {
    // Implementation would use PubSub for real-time updates
    return {
      postCreated: {
        subscribe: {
          next: () => {
            // Emit post created events
          }
        }
      }
    };
  }

  async userUpdatedSubscription() {
    // Implementation would use PubSub for real-time updates
    return {
      userUpdated: {
        subscribe: {
          next: () => {
            // Emit user updated events
          }
        }
      }
    };
  }
}

// app.js
const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const GraphQLServer = require('./server/graphqlServer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create and start GraphQL server
const server = new GraphQLServer();
const apolloServer = server.createServer();

apolloServer.applyMiddleware({ app });

const httpServer = createServer(app);
httpServer.listen(4000, () => {
  console.log('GraphQL server running on http://localhost:4000/graphql');
});
```

#### Stack: Python + Strawberry

```python
# schema/schema.graphql
import strawberry
from typing import List, Optional
from datetime import datetime
import strawberry.types

@strawberry.type
class User:
    id: strawberry.ID
    email: str
    name: str
    avatar_url: str
    created_at: datetime
    updated_at: datetime

@strawberry.type
class Post:
    id: strawberry.ID
    title: str
    content: str
    author: User
    created_at: datetime
    updated_at: datetime

@strawberry.input
class CreateUserInput:
    email: str
    name: str
    password: str

@strawberry.input
class CreatePostInput:
    title: str
    content: str

@strawberry.type
class Query:
    @strawberry.field
    def me(self, info: strawberry.Info) -> Optional[User]:
        # Get current user from context
        return info.context.get("user")
    
    @strawberry.field
    def user(self, id: strawberry.ID) -> Optional[User]:
        # Get user by ID
        return get_user_by_id(str(id))
    
    @strawberry.field
    def users(self, limit: int = 20, offset: int = 0) -> List[User]:
        # Get users with pagination
        return get_users(limit, offset)
    
    @strawberry.field
    def posts(self, limit: int = 20, offset: int = 0) -> List[Post]:
        # Get posts with pagination
        return get_posts(limit, offset)
    
    @strawberry.field
    def search_posts(self, query: str) -> List[Post]:
        # Search posts
        return search_posts(query)

@strawberry.type
class Mutation:
    @strawberry.mutation
    def login(self, email: str, password: str, info: strawberry.Info) -> AuthPayload:
        # Login user and return token
        return login_user(email, password, info)
    
    @strawberry.mutation
    def create_user(self, input: CreateUserInput) -> User:
        # Create new user
        return create_user(input.email, input.name, input.password)
    
    @strawberry.mutation
    def create_post(self, input: CreatePostInput, info: strawberry.Info) -> Post:
        # Create new post
        user = info.context.get("user")
        if not user:
            raise Exception("Not authenticated")
        
        return create_post(input.title, input.content, user)

@strawberry.type
class AuthPayload:
    token: Optional[str]
    user: Optional[User]

# resolvers/user_resolver.py
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional

from schema.schema import User, CreateUserInput

def get_user_by_id(user_id: str) -> Optional[User]:
    # Mock database implementation
    users = get_all_users()
    return users.get(user_id)

def get_users(limit: int = 20, offset: int = 0) -> list[User]:
    # Mock database implementation
    users = list(get_all_users().values())
    return users[offset:offset + limit]

def login_user(email: str, password: str, info) -> AuthPayload:
    # Find user
    users = get_all_users()
    user = None
    for user_data in users.values():
        if user_data["email"] == email:
            user = user_data
            break
    
    if not user:
        raise Exception("Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(password, user["password"]):
        raise Exception("Invalid credentials")
    
    # Generate JWT token
    token = jwt.encode(
        {"sub": user["id"], "email": email},
        "your-secret-key",
        algorithm="HS256",
        exp=datetime.utcnow() + timedelta(days=7)
    )
    
    return AuthPayload(token=token, user=User(**user))

def create_user(email: str, name: str, password: str) -> User:
    # Check if user already exists
    users = get_all_users()
    for user_data in users.values():
        if user_data["email"] == email:
            raise Exception("User already exists")
    
    # Hash password
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    
    # Create user
    user_id = f"user_{datetime.now().timestamp()}"
    new_user = User(
        id=user_id,
        email=email,
        name=name,
        avatar_url=f"https://example.com/avatar/{user_id}.jpg",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Save to database (mock)
    users[user_id] = {
        "id": user_id,
        "email": email,
        "name": name,
        "password": hashed_password,
        "avatar_url": new_user.avatar_url,
        "created_at": new_user.created_at.isoformat(),
        "updated_at": new_user.updated_at.isoformat()
    }
    
    return new_user

def get_all_users():
    # Mock database - in real implementation, use actual database
    return {
        "user_1": {
            "id": "user_1",
            "email": "user1@example.com",
            "name": "User One",
            "password": bcrypt.hashpw("password123".encode(), bcrypt.gensalt()),
            "avatar_url": "https://example.com/avatar1.jpg",
            "created_at": datetime(2023, 1, 1).isoformat(),
            "updated_at": datetime(2023, 1, 1).isoformat()
        }
    }

# resolvers/post_resolver.py
from typing import List
from datetime import datetime

from schema.schema import Post, CreatePostInput, User

def get_posts(limit: int = 20, offset: int = 0) -> list[Post]:
    # Mock database implementation
    posts = list(get_all_posts().values())
    return posts[offset:offset + limit]

def search_posts(query: str) -> list[Post]:
    # Mock database implementation
    posts = list(get_all_posts().values())
    query_lower = query.lower()
    
    return [
        post for post in posts
        if query_lower in post.title.lower() or query_lower in post.content.lower()
    ]

def create_post(title: str, content: str, author: User) -> Post:
    # Create post
    post_id = f"post_{datetime.now().timestamp()}"
    new_post = Post(
        id=post_id,
        title=title,
        content=content,
        author=author,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Save to database (mock)
    posts = get_all_posts()
    posts[post_id] = {
        "id": new_post.id,
        "title": new_post.title,
        "content": new_post.content,
        "author_id": new_post.author.id,
        "created_at": new_post.created_at.isoformat(),
        "updated_at": new_post.updated_at.isoformat()
    }
    
    return new_post

def get_all_posts():
    # Mock database - in real implementation, use actual database
    return {
        "post_1": {
            "id": "post_1",
            "title": "First Post",
            "content": "This is the first post content",
            "author_id": "user_1",
            "created_at": datetime(2023, 1, 1).isoformat(),
            "updated_at": datetime(2023, 1, 1).isoformat()
        }
    }

# server/graphql_server.py
import asyncio
from strawberry.schema import Query, Mutation
from strawberry.extensions.django import make_sync_executable_schema
from strawberry.schema import schema
from django.core.asgi import ASGIApplication
from strawberry.django import GraphQLView
from middleware.auth import auth_middleware

async def create_graphql_app() -> ASGIApplication:
    """
    Create GraphQL application with Strawberry
    """
    
    # Create executable schema
    schema = make_sync_executable_schema(schema)
    
    # Create ASGI application
    app = GraphQLView(schema, debug=True)
    
    # Add authentication middleware
    app = auth_middleware(app)
    
    return app

# app.py
import os
from django.core.asgi import get_asgi_application
from server.graphql_server import create_graphql_app

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

application = get_asgi_application(create_graphql_app())
```

#### Stack: Go + gqlgen

```go
// schema/schema.graphql
package schema

//go:generate go run github.com/99designs/gqlgen generate

type User struct {
	ID       string    `json:"id"`
	Email    string    `json:"email"`
	Name     string    `json:"name"`
	AvatarURL string    `json:"avatarUrl"`
	CreatedAt string    `json:"createdAt"`
	UpdatedAt string    `json:"updatedAt"`
}

type Post struct {
	ID        string  `json:"id"`
	Title     string  `json:"title"`
	Content   string  `json:"content"`
	Author    User    `json:"author"`
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}

type CreateUserInput struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type AuthPayload struct {
	Token string `json:"token,omitempty"`
	User  *User  `json:"user,omitempty"`
}

type Query struct {
	User  func(ctx context.Context, args struct{ ID string }) (*User, error) `json:"user" graphql:"user"`
	Users func(ctx context.Context, args struct {
		Limit  int32  `json:"limit"`
		Offset int32  `json:"offset"`
	}) ([]*User, error) `json:"users" graphql:"users"`
	Posts func(ctx context.Context, args struct {
		Limit  int32  `json:"limit"`
		Offset int32  `json:"offset"`
	}) ([]*Post, error) `json:"posts" graphql:"posts"`
}

type Mutation struct {
	Login      func(ctx context.Context, args struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}) (*AuthPayload, error) `json:"login" graphql:"login"`
	CreateUser func(ctx context.Context, args struct {
		Input CreateUserInput `json:"input"`
	}) (*User, error) `json:"createUser" graphql:"createUser"`
	CreatePost  func(ctx context.Context, args struct {
		Input struct {
			Title   string `json:"title"`
			Content string `json:"content"`
		} `json:"input"`
	}) (*Post, error) `json:"createPost" graphql:"createPost"`
}

type Subscription struct {
	PostCreated func(ctx context.Context) (<-chan *Post, error) `json:"postCreated" graphql:"postCreated"`
}

// resolvers/user_resolver.go
package resolvers

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"yourproject/schema"
)

type UserResolver struct{}

func (r *UserResolver) User(ctx context.Context, args struct{ ID string }) (*schema.User, error) {
	// Mock database implementation
	user, exists := getUserByID(args.ID)
	if !exists {
		return nil, fmt.Errorf("user not found")
	}
	return user, nil
}

func (r *UserResolver) Users(ctx context.Context, args struct {
	Limit  int32
	Offset int32
}) ([]*schema.User, error) {
	// Mock database implementation
	users := getAllUsers()
	
	limit := int(args.Limit)
	if limit <= 0 {
		limit = 20
	}
	
	offset := int(args.Offset)
	if offset < 0 {
		offset = 0
	}
	
	if offset >= len(users) {
		return []*schema.User{}, nil
	}
	
	end := offset + limit
	if end > len(users) {
		end = len(users)
	}
	
	result := make([]*schema.User, 0, end-offset)
	for i := offset; i < end; i++ {
		result = append(result, users[i])
	}
	
	return result, nil
}

func (r *UserResolver) Login(ctx context.Context, args struct {
	Email    string
	Password string
}) (*schema.AuthPayload, error) {
	// Find user
	user, exists := getUserByEmail(args.Email)
	if !exists {
		return nil, fmt.Errorf("invalid credentials")
	}
	
	// Verify password
	err := bcrypt.CompareHashAndPassword(args.Password, user.Password)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}
	
	// Generate JWT token
	token, err := jwt.NewWithClaims(jwt.MapClaims{
		"sub": user.ID,
		"email": user.Email,
	}).SignedString([]byte("your-secret-key"), jwt.SigningMethodHS256)
	
	if err != nil {
		return nil, err
	}
	
	return &schema.AuthPayload{
		Token: token,
		User:  user,
	}, nil
}

// Database helper functions
func getUserByID(id string) (*schema.User, bool) {
	// Mock database implementation
	users := getAllUsers()
	user, exists := users[id]
	return user, exists
}

func getUserByEmail(email string) (*schema.User, bool) {
	// Mock database implementation
	users := getAllUsers()
	for _, user := range users {
		if user.Email == email {
			return user, true
		}
	}
	return nil, false
}

func getAllUsers() map[string]*schema.User {
	// Mock database implementation
	return map[string]*schema.User{
		"user_1": {
			ID:        "user_1",
			Email:    "user1@example.com",
			Name:     "User One",
			AvatarURL: "https://example.com/avatar1.jpg",
			CreatedAt: time.Now().Format(time.RFC3339),
			UpdatedAt: time.Now().Format(time.RFC3339),
		},
	}
}

// server/graphql_server.go
package server

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"yourproject/graph/generated"
	"yourproject/resolvers"
	"yourproject/middleware"
)

type GraphQLServer struct {
	srv *handler.Server
}

func NewGraphQLServer() *GraphQLServer {
	// Create GraphQL server
	srv := handler.NewDefaultServer(
		generated.NewExecutableSchema(generated.Config{
			Resolvers: &resolvers.ResolverRoot{},
		}),
	)
	
	// Add middleware
	srv.AddMiddleware(middleware.AuthMiddleware())
	
	return &GraphQLServer{srv: srv}
}

func (s *GraphQLServer) Start(port string) error {
	// Create HTTP server
	http.Handle("/graphql", s.srv)
	http.Handle("/playground", handler.Playground("GraphQL Playground"))
	
	log.Printf("GraphQL server starting on :%s", port)
	return http.ListenAndServe(":"+port, nil)
}

// main.go
package main

import (
	"log"
	"os"

	"yourproject/server"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	server := server.NewGraphQLServer()
	if err := server.Start(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
```

## Client Implementation

### Apollo Client (React)

```javascript
// client/apolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  headers: {
    authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
  },
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// hooks/useGraphQL.js
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';
import { client } from './apolloClient';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      avatarUrl
      createdAt
      updatedAt
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        avatarUrl
      }
    }
  }
`;

export function useUser(id) {
  return useQuery(GET_USER, {
    variables: { id },
    skip: !id,
  });
}

export function useLogin() {
  return useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { token } = data.login;
      localStorage.setItem('token', token);
    },
  });
}

const POST_CREATED_SUBSCRIPTION = gql`
  subscription PostCreated {
    postCreated {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

export function usePostCreatedSubscription() {
  return useSubscription(POST_CREATED_SUBSCRIPTION);
}
```

## Configuration Examples

### Package.json

```json
{
  "dependencies": {
    "apollo-server-express": "^3.12.0",
    "graphql": "^16.6.0",
    "strawberry-graphql-django": "^0.12.0",
    "@apollo/client": "^3.7.0",
    "dataloader": "^2.2.0"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^2.16.0",
    "@graphql-codegen/typescript": "^2.8.0",
    "strawberry-graphql": "^0.12.0"
  }
}
```

### GraphQL Code Generation

```bash
# Generate Go code
go generate github.com/99designs/gqlgen

# Generate TypeScript code
graphql-codegen --schema schema.graphql --operations src/**/*.graphql --output src/generated/

# Generate Python code
strawberry graphql-codegen schema/schema.graphql
```

## Success Metrics

- [ ] GraphQL schema compiles successfully
- [ ] All queries resolve correctly
- [ ] Mutations work with proper validation
- [ ] Subscriptions deliver real-time updates
- [ ] Authentication middleware works
- [ ] Data loaders prevent N+1 problems
- [ ] Introspection provides schema documentation
- [ ] Playground allows interactive testing
- [ ] Performance is optimized with caching

## Troubleshooting

### Common Issues

1. **Schema Compilation Errors**
   - Check GraphQL syntax and type definitions
   - Verify resolver signatures match schema
   - Ensure proper imports and exports

2. **Query Resolution Failures**
   - Check resolver implementations
   - Verify database connections
   - Check error handling in resolvers

3. **Authentication Issues**
   - Verify JWT middleware is properly applied
   - Check token format and validation
   - Ensure context is passed correctly

4. **Performance Problems**
   - Implement data loaders for batching
   - Add query complexity analysis
   - Use caching for frequently accessed data

### Debug Commands

```bash
# Test GraphQL endpoint
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ user { id email name } }"}' \
  http://localhost:4000/graphql

# Generate schema
curl http://localhost:4000/graphql

# Query introspection
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __schema { types { name fields { name type } } } }"}' \
  http://localhost:4000/graphql
```

## Best Practices

### Schema Design

1. **Specific Fields**: Only request needed data
2. **Type Safety**: Use strong typing throughout
3. **Pagination**: Implement cursor-based pagination
4. **Error Handling**: Use proper GraphQL error types
5. **Versioning**: Plan for schema evolution

### Performance Optimization

1. **Data Loaders**: Batch database queries
2. **Query Complexity**: Analyze and limit complex queries
3. **Caching**: Cache frequently accessed data
4. **Persisted Queries**: Use for static queries
5. **Subscription Optimization**: Use efficient pub/sub systems

### Security

1. **Authentication**: JWT-based auth middleware
2. **Authorization**: Field-level permission checks
3. **Rate Limiting**: Implement query rate limiting
4. **Input Validation**: Validate all inputs
5. **Depth Limiting**: Limit query depth to prevent abuse
