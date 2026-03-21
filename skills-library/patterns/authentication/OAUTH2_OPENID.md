---
id: oauth2-openid-v1
name: OAuth 2.0 / OpenID Connect Authentication
category: authentication
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: High
status: complete
stacks: [fastapi, express, django, go]
universal: true
tags: [oauth2, openid, authentication, authorization, sso, security]
---

# SKILL: OAuth 2.0 / OpenID Connect Authentication

## Problem

Applications need secure, standards-based authentication for:
- User login with external providers (Google, GitHub, etc.)
- Single Sign-On (SSO) across multiple applications
- Secure API access with scoped permissions
- Token-based authentication with refresh capabilities
- User profile and identity information

Without OAuth 2.0/OpenID Connect:
- Insecure password storage and handling
- No support for external identity providers
- Limited user experience with registration friction
- No standardized token management
- Security vulnerabilities in authentication flows

## Solution Overview

Implement OAuth 2.0/OpenID Connect with:
- **Authorization Code Flow**: Secure browser-based authentication
- **PKCE**: Proof Key for Code Exchange (mobile/SPA security)
- **Token Management**: Access tokens, refresh tokens, ID tokens
- **Provider Integration**: Multiple OAuth providers (Google, GitHub, etc.)
- **Session Management**: Secure session handling and token storage
- **Middleware**: Protected routes and API endpoints

This enables secure, standards-compliant authentication with external providers.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `app/auth/oauth_providers.py` | OAuth provider configurations | service | fastapi |
| `app/auth/oauth_handlers.py` | OAuth flow handlers | controller | fastapi |
| `app/auth/token_manager.py` | Token management | service | fastapi |
| `app/auth/middleware.py` | Auth middleware | middleware | fastapi |
| `app/auth/providers/google.py` | Google OAuth integration | service | fastapi |
| `app/auth/providers/github.py` | GitHub OAuth integration | service | fastapi |
| `app/auth/oauth_providers.js` | OAuth provider configurations | service | express |
| `app/auth/oauth_handlers.js` | OAuth flow handlers | controller | express |
| `app/auth/token_manager.js` | Token management | service | express |
| `app/auth/middleware.js` | Auth middleware | middleware | express |
| `app/auth/oauth.go` | OAuth provider management | service | go |
| `app/auth/handlers.go` | OAuth flow handlers | controller | go |
| `app/auth/middleware.go` | Auth middleware | middleware | go |

### Code Patterns

#### Stack: FastAPI + OAuth 2.0

```python
# app/auth/oauth_providers.py
from dataclasses import dataclass
from typing import Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass
class OAuthProvider:
    name: str
    client_id: str
    client_secret: str
    authorize_url: str
    token_url: str
    user_info_url: str
    scopes: str
    redirect_uri: str

class OAuthProviders:
    def __init__(self):
        self.providers = {
            "google": OAuthProvider(
                name="google",
                client_id=os.getenv("GOOGLE_CLIENT_ID"),
                client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
                authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
                token_url="https://oauth2.googleapis.com/token",
                user_info_url="https://www.googleapis.com/oauth2/v2/userinfo",
                scopes="openid email profile",
                redirect_uri=os.getenv("GOOGLE_REDIRECT_URI")
            ),
            "github": OAuthProvider(
                name="github",
                client_id=os.getenv("GITHUB_CLIENT_ID"),
                client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
                authorize_url="https://github.com/login/oauth/authorize",
                token_url="https://github.com/login/oauth/access_token",
                user_info_url="https://api.github.com/user",
                scopes="user:email",
                redirect_uri=os.getenv("GITHUB_REDIRECT_URI")
            ),
            "microsoft": OAuthProvider(
                name="microsoft",
                client_id=os.getenv("MICROSOFT_CLIENT_ID"),
                client_secret=os.getenv("MICROSOFT_CLIENT_SECRET"),
                authorize_url="https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
                token_url="https://login.microsoftonline.com/common/oauth2/v2.0/token",
                user_info_url="https://graph.microsoft.com/v1.0/me",
                scopes="openid email profile",
                redirect_uri=os.getenv("MICROSOFT_REDIRECT_URI")
            )
        }
    
    def get_provider(self, name: str) -> Optional[OAuthProvider]:
        return self.providers.get(name)
    
    def get_authorize_url(self, provider_name: str, state: str, code_verifier: str = None) -> str:
        provider = self.get_provider(provider_name)
        if not provider:
            raise ValueError(f"Provider {provider_name} not found")
        
        params = {
            "client_id": provider.client_id,
            "redirect_uri": provider.redirect_uri,
            "scope": provider.scopes,
            "response_type": "code",
            "state": state
        }
        
        # Add PKCE for SPA/mobile security
        if code_verifier:
            import hashlib
            import base64
            import secrets
            
            code_challenge = base64.urlsafe_b64encode(
                hashlib.sha256(code_verifier.encode()).digest()
            ).decode().rstrip('=')
            
            params["code_challenge"] = code_challenge
            params["code_challenge_method"] = "S256"
        
        from urllib.parse import urlencode
        return f"{provider.authorize_url}?{urlencode(params)}"

# app/auth/token_manager.py
import jwt
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from sqlalchemy.orm import Session
from app.models import User, OAuthAccount
from app.core.database import get_db

class TokenManager:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.access_token_expire = timedelta(hours=1)
        self.refresh_token_expire = timedelta(days=30)
    
    def create_tokens(self, user_id: str, provider: str = None) -> Dict[str, Any]:
        """Create access and refresh tokens"""
        now = datetime.utcnow()
        
        # Access token (short-lived)
        access_payload = {
            "sub": user_id,
            "type": "access",
            "iat": now,
            "exp": now + self.access_token_expire,
            "provider": provider
        }
        
        access_token = jwt.encode(
            access_payload,
            self.secret_key,
            algorithm="HS256"
        )
        
        # Refresh token (long-lived)
        refresh_payload = {
            "sub": user_id,
            "type": "refresh",
            "iat": now,
            "exp": now + self.refresh_token_expire,
            "jti": secrets.token_urlsafe(32)  # Unique ID for token revocation
        }
        
        refresh_token = jwt.encode(
            refresh_payload,
            self.secret_key,
            algorithm="HS256"
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer",
            "expires_in": int(self.access_token_expire.total_seconds()),
            "refresh_expires_in": int(self.refresh_token_expire.total_seconds())
        }
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=["HS256"],
                options={"verify_exp": True}
            )
            
            if payload.get("type") != token_type:
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, Any]]:
        """Create new access token from refresh token"""
        payload = self.verify_token(refresh_token, "refresh")
        if not payload:
            return None
        
        # Create new access token
        user_id = payload["sub"]
        new_tokens = self.create_tokens(user_id)
        
        return {
            "access_token": new_tokens["access_token"],
            "token_type": "Bearer",
            "expires_in": new_tokens["expires_in"]
        }

# app/auth/oauth_handlers.py
import secrets
import httpx
from fastapi import HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.auth.oauth_providers import OAuthProviders
from app.auth.token_manager import TokenManager
from app.models import User, OAuthAccount
from app.core.database import get_db

class OAuthHandlers:
    def __init__(self, db: Session, token_manager: TokenManager):
        self.db = db
        self.token_manager = token_manager
        self.providers = OAuthProviders()
    
    async def authorize(self, provider_name: str, redirect_uri: str = None):
        """Start OAuth authorization flow"""
        provider = self.providers.get_provider(provider_name)
        if not provider:
            raise HTTPException(status_code=400, detail=f"Provider {provider_name} not supported")
        
        # Generate state for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Generate PKCE code verifier for SPA/mobile
        code_verifier = secrets.token_urlsafe(64)
        
        # Store state and code_verifier in session/cache
        # In production, use Redis or database
        session_data = {
            "state": state,
            "code_verifier": code_verifier,
            "provider": provider_name
        }
        
        # Generate authorization URL
        auth_url = self.providers.get_authorize_url(
            provider_name, 
            state, 
            code_verifier
        )
        
        return RedirectResponse(
            url=auth_url,
            headers={"Set-Cookie": f"oauth_state={state}; HttpOnly; Secure; SameSite=Strict"}
        )
    
    async def callback(self, provider_name: str, code: str, state: str, error: str = None):
        """Handle OAuth callback"""
        if error:
            raise HTTPException(status_code=400, detail=f"OAuth error: {error}")
        
        # Verify state
        stored_state = self._get_oauth_state()
        if not stored_state or stored_state != state:
            raise HTTPException(status_code=400, detail="Invalid state parameter")
        
        # Get provider and exchange code for tokens
        provider = self.providers.get_provider(provider_name)
        token_data = await self._exchange_code_for_tokens(provider, code, stored_state.get("code_verifier"))
        
        if not token_data:
            raise HTTPException(status_code=400, detail="Failed to exchange authorization code")
        
        # Get user information
        user_info = await self._get_user_info(provider, token_data["access_token"])
        
        # Find or create user and OAuth account
        user = await self._find_or_create_user(provider_name, user_info, token_data)
        
        # Create application tokens
        app_tokens = self.token_manager.create_tokens(user.id, provider_name)
        
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?access_token={app_tokens['access_token']}&refresh_token={app_tokens['refresh_token']}"
        )
    
    async def refresh_token(self, refresh_token: str):
        """Refresh access token"""
        new_tokens = self.token_manager.refresh_access_token(refresh_token)
        
        if not new_tokens:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        return new_tokens
    
    async def logout(self, token: str):
        """Logout user and revoke tokens"""
        payload = self.token_manager.verify_token(token)
        if payload:
            # In production, add token to blacklist
            # Or use token versioning
            pass
        
        return {"message": "Logged out successfully"}
    
    async def _exchange_code_for_tokens(self, provider: OAuthProvider, code: str, code_verifier: str = None):
        """Exchange authorization code for access token"""
        data = {
            "client_id": provider.client_id,
            "client_secret": provider.client_secret,
            "code": code,
            "redirect_uri": provider.redirect_uri,
            "grant_type": "authorization_code"
        }
        
        if code_verifier:
            data["code_verifier"] = code_verifier
        
        async with httpx.AsyncClient() as client:
            response = await client.post(provider.token_url, data=data)
            
            if response.status_code != 200:
                return None
            
            return response.json()
    
    async def _get_user_info(self, provider: OAuthProvider, access_token: str):
        """Get user information from provider"""
        headers = {"Authorization": f"Bearer {access_token}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(provider.user_info_url, headers=headers)
            
            if response.status_code != 200:
                return None
            
            return response.json()
    
    async def _find_or_create_user(self, provider_name: str, user_info: dict, token_data: dict):
        """Find existing user or create new one"""
        # Check if OAuth account exists
        oauth_account = self.db.query(OAuthAccount).filter(
            OAuthAccount.provider == provider_name,
            OAuthAccount.provider_user_id == str(user_info["id"])
        ).first()
        
        if oauth_account:
            # Update OAuth account
            oauth_account.access_token = token_data["access_token"]
            oauth_account.refresh_token = token_data.get("refresh_token")
            self.db.commit()
            return oauth_account.user
        
        # Create new user and OAuth account
        user = User(
            email=user_info.get("email"),
            name=user_info.get("name"),
            avatar_url=user_info.get("picture"),
            provider=provider_name
        )
        
        self.db.add(user)
        self.db.flush()  # Get user ID
        
        oauth_account = OAuthAccount(
            user_id=user.id,
            provider=provider_name,
            provider_user_id=str(user_info["id"]),
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"),
            user_info=user_info
        )
        
        self.db.add(oauth_account)
        self.db.commit()
        
        return user
    
    def _get_oauth_state(self):
        """Get OAuth state from session/cache"""
        # In production, use Redis or database session
        return {"state": "stored_state", "code_verifier": "stored_verifier"}

# app/auth/middleware.py
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.token_manager import TokenManager

security = HTTPBearer()

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    token_manager: TokenManager = Depends(get_token_manager)
):
    """Get current authenticated user"""
    
    # Check Authorization header
    if not credentials:
        # Check cookie for SPA support
        token = request.cookies.get("access_token")
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
    else:
        token = credentials.credentials
    
    # Verify token
    payload = token_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user from database
    user_id = payload["sub"]
    user = request.app.state.db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

async def get_optional_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    token_manager: TokenManager = Depends(get_token_manager)
):
    """Get current user if authenticated, otherwise None"""
    
    try:
        return await get_current_user(request, credentials, token_manager)
    except HTTPException:
        return None

# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from app.auth.oauth_handlers import OAuthHandlers
from app.auth.middleware import get_current_user, get_optional_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_oauth_handlers(request: Request):
    """Dependency injection for OAuth handlers"""
    return OAuthHandlers(
        db=request.app.state.db,
        token_manager=request.app.state.token_manager
    )

@router.get("/authorize/{provider}")
async def authorize(
    provider: str,
    request: Request,
    oauth_handlers: OAuthHandlers = Depends(get_oauth_handlers)
):
    """Start OAuth authorization with specified provider"""
    return await oauth_handlers.authorize(provider)

@router.get("/callback/{provider}")
async def oauth_callback(
    provider: str,
    code: str,
    state: str,
    error: str = None,
    oauth_handlers: OAuthHandlers = Depends(get_oauth_handlers)
):
    """Handle OAuth callback from provider"""
    return await oauth_handlers.callback(provider, code, state, error)

@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    oauth_handlers: OAuthHandlers = Depends(get_oauth_handlers)
):
    """Refresh access token"""
    return await oauth_handlers.refresh_token(refresh_token)

@router.post("/logout")
async def logout(
    request: Request,
    oauth_handlers: OAuthHandlers = Depends(get_oauth_handlers)
):
    """Logout user"""
    token = request.cookies.get("access_token")
    result = await oauth_handlers.logout(token)
    
    response = JSONResponse(content=result)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response

@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "avatar_url": current_user.avatar_url,
        "provider": current_user.provider
    }

# Protected route example
@router.get("/protected")
async def protected_route(
    current_user: User = Depends(get_current_user)
):
    """Example of protected route"""
    return {
        "message": "This is a protected route",
        "user": current_user.email
    }
```

#### Stack: Express.js + OAuth 2.0

```javascript
// app/auth/oauth_providers.js
const dotenv = require('dotenv');
dotenv.config();

class OAuthProvider {
    constructor(config) {
        this.name = config.name;
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.authorizeUrl = config.authorizeUrl;
        this.tokenUrl = config.tokenUrl;
        this.userInfoUrl = config.userInfoUrl;
        this.scopes = config.scopes;
        this.redirectUri = config.redirectUri;
    }
}

class OAuthProviders {
    constructor() {
        this.providers = {
            google: new OAuthProvider({
                name: 'google',
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenUrl: 'https://oauth2.googleapis.com/token',
                userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
                scopes: 'openid email profile',
                redirectUri: process.env.GOOGLE_REDIRECT_URI
            }),
            github: new OAuthProvider({
                name: 'github',
                clientId: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                authorizeUrl: 'https://github.com/login/oauth/authorize',
                tokenUrl: 'https://github.com/login/oauth/access_token',
                userInfoUrl: 'https://api.github.com/user',
                scopes: 'user:email',
                redirectUri: process.env.GITHUB_REDIRECT_URI
            }),
            microsoft: new OAuthProvider({
                name: 'microsoft',
                clientId: process.env.MICROSOFT_CLIENT_ID,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
                authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
                scopes: 'openid email profile',
                redirectUri: process.env.MICROSOFT_REDIRECT_URI
            })
        };
    }
    
    getProvider(name) {
        return this.providers[name];
    }
    
    getAuthorizeUrl(providerName, state, codeVerifier = null) {
        const provider = this.getProvider(providerName);
        if (!provider) {
            throw new Error(`Provider ${providerName} not found`);
        }
        
        const params = new URLSearchParams({
            client_id: provider.clientId,
            redirect_uri: provider.redirectUri,
            scope: provider.scopes,
            response_type: 'code',
            state: state
        });
        
        // Add PKCE for SPA/mobile security
        if (codeVerifier) {
            const crypto = require('crypto');
            const codeChallenge = crypto
                .createHash('sha256')
                .update(codeVerifier)
                .digest('base64url');
            
            params.append('code_challenge', codeChallenge);
            params.append('code_challenge_method', 'S256');
        }
        
        return `${provider.authorizeUrl}?${params.toString()}`;
    }
}

module.exports = { OAuthProvider, OAuthProviders };

// app/auth/token_manager.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TokenManager {
    constructor(secretKey) {
        this.secretKey = secretKey;
        this.accessTokenExpire = '1h';
        this.refreshTokenExpire = '30d';
    }
    
    createTokens(userId, provider = null) {
        const now = Math.floor(Date.now() / 1000);
        
        // Access token (short-lived)
        const accessPayload = {
            sub: userId,
            type: 'access',
            iat: now,
            exp: now + (60 * 60), // 1 hour
            provider: provider
        };
        
        const accessToken = jwt.sign(accessPayload, this.secretKey, {
            algorithm: 'HS256'
        });
        
        // Refresh token (long-lived)
        const refreshPayload = {
            sub: userId,
            type: 'refresh',
            iat: now,
            exp: now + (60 * 60 * 24 * 30), // 30 days
            jti: crypto.randomBytes(32).toString('hex') // Unique ID for token revocation
        };
        
        const refreshToken = jwt.sign(refreshPayload, this.secretKey, {
            algorithm: 'HS256'
        });
        
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: 60 * 60,
            refreshExpiresIn: 60 * 60 * 24 * 30
        };
    }
    
    verifyToken(token, tokenType = 'access') {
        try {
            const payload = jwt.verify(token, this.secretKey, {
                algorithms: ['HS256']
            });
            
            if (payload.type !== tokenType) {
                return null;
            }
            
            return payload;
        } catch (error) {
            return null;
        }
    }
    
    refreshAccessToken(refreshToken) {
        const payload = this.verifyToken(refreshToken, 'refresh');
        if (!payload) {
            return null;
        }
        
        // Create new access token
        const userId = payload.sub;
        const newTokens = this.createTokens(userId);
        
        return {
            accessToken: newTokens.accessToken,
            tokenType: 'Bearer',
            expiresIn: newTokens.expiresIn
        };
    }
}

module.exports = TokenManager;

// app/auth/oauth_handlers.js
const axios = require('axios');
const crypto = require('crypto');
const { OAuthProviders } = require('./oauth_providers');
const TokenManager = require('./token_manager');

class OAuthHandlers {
    constructor(db, tokenManager) {
        this.db = db;
        this.tokenManager = tokenManager;
        this.providers = new OAuthProviders();
    }
    
    async authorize(providerName, redirectUri = null) {
        const provider = this.providers.getProvider(providerName);
        if (!provider) {
            throw new Error(`Provider ${providerName} not supported`);
        }
        
        // Generate state for CSRF protection
        const state = crypto.randomBytes(32).toString('hex');
        
        // Generate PKCE code verifier for SPA/mobile
        const codeVerifier = crypto.randomBytes(64).toString('hex');
        
        // Store state and code_verifier in session/cache
        const sessionData = {
            state,
            codeVerifier,
            provider: providerName
        };
        
        // In production, use Redis or database session
        this.storeSessionData(state, sessionData);
        
        // Generate authorization URL
        const authUrl = this.providers.getAuthorizeUrl(
            providerName,
            state,
            codeVerifier
        );
        
        return {
            redirectUrl: authUrl,
            state: state
        };
    }
    
    async callback(providerName, code, state, error = null) {
        if (error) {
            throw new Error(`OAuth error: ${error}`);
        }
        
        // Verify state
        const storedState = this.getSessionData(state);
        if (!storedState || storedState.state !== state) {
            throw new Error('Invalid state parameter');
        }
        
        // Get provider and exchange code for tokens
        const provider = this.providers.getProvider(providerName);
        const tokenData = await this.exchangeCodeForTokens(
            provider,
            code,
            storedState.codeVerifier
        );
        
        if (!tokenData) {
            throw new Error('Failed to exchange authorization code');
        }
        
        // Get user information
        const userInfo = await this.getUserInfo(provider, tokenData.access_token);
        
        // Find or create user and OAuth account
        const user = await this.findOrCreateUser(providerName, userInfo, tokenData);
        
        // Create application tokens
        const appTokens = this.tokenManager.createTokens(user.id, providerName);
        
        return {
            user,
            tokens: appTokens
        };
    }
    
    async refreshToken(refreshToken) {
        const newTokens = this.tokenManager.refreshAccessToken(refreshToken);
        
        if (!newTokens) {
            throw new Error('Invalid refresh token');
        }
        
        return newTokens;
    }
    
    async logout(token) {
        const payload = this.tokenManager.verifyToken(token);
        if (payload) {
            // In production, add token to blacklist
            // Or use token versioning
        }
        
        return { message: 'Logged out successfully' };
    }
    
    async exchangeCodeForTokens(provider, code, codeVerifier = null) {
        const data = {
            client_id: provider.clientId,
            client_secret: provider.clientSecret,
            code: code,
            redirect_uri: provider.redirectUri,
            grant_type: 'authorization_code'
        };
        
        if (codeVerifier) {
            data.code_verifier = codeVerifier;
        }
        
        try {
            const response = await axios.post(provider.tokenUrl, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Token exchange failed:', error.response?.data || error.message);
            return null;
        }
    }
    
    async getUserInfo(provider, accessToken) {
        try {
            const response = await axios.get(provider.userInfoUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Get user info failed:', error.response?.data || error.message);
            return null;
        }
    }
    
    async findOrCreateUser(providerName, userInfo, tokenData) {
        // Check if OAuth account exists
        const oauthAccount = await this.db.query(
            'SELECT * FROM oauth_accounts WHERE provider = $1 AND provider_user_id = $2',
            [providerName, userInfo.id.toString()]
        );
        
        if (oauthAccount.rows.length > 0) {
            // Update OAuth account
            await this.db.query(
                'UPDATE oauth_accounts SET access_token = $1, refresh_token = $2 WHERE id = $3',
                [tokenData.access_token, tokenData.refresh_token || null, oauthAccount.rows[0].id]
            );
            
            // Get user
            const user = await this.db.query(
                'SELECT * FROM users WHERE id = $1',
                [oauthAccount.rows[0].user_id]
            );
            
            return user.rows[0];
        }
        
        // Create new user and OAuth account
        const userResult = await this.db.query(
            'INSERT INTO users (email, name, avatar_url, provider) VALUES ($1, $2, $3, $4) RETURNING *',
            [userInfo.email, userInfo.name, userInfo.picture, providerName]
        );
        
        const user = userResult.rows[0];
        
        await this.db.query(
            'INSERT INTO oauth_accounts (user_id, provider, provider_user_id, access_token, refresh_token, user_info) VALUES ($1, $2, $3, $4, $5, $6)',
            [user.id, providerName, userInfo.id.toString(), tokenData.access_token, tokenData.refresh_token || null, JSON.stringify(userInfo)]
        );
        
        return user;
    }
    
    storeSessionData(key, data) {
        // In production, use Redis or database session
        // For demo, using in-memory storage
        if (!this.sessionStore) {
            this.sessionStore = new Map();
        }
        this.sessionStore.set(key, data);
    }
    
    getSessionData(key) {
        // In production, use Redis or database session
        return this.sessionStore ? this.sessionStore.get(key) : null;
    }
}

module.exports = OAuthHandlers;

// app/auth/middleware.js
const jwt = require('jsonwebtoken');

function createAuthMiddleware(tokenManager) {
    return (req, res, next) => {
        // Check Authorization header
        let token = null;
        
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else {
            // Check cookie for SPA support
            token = req.cookies?.access_token;
        }
        
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Verify token
        const payload = tokenManager.verifyToken(token);
        if (!payload) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Add user to request
        req.user = payload;
        req.token = token;
        
        next();
    };
}

function createOptionalAuthMiddleware(tokenManager) {
    return (req, res, next) => {
        // Same as above but doesn't block if no token
        let token = null;
        
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else {
            token = req.cookies?.access_token;
        }
        
        if (token) {
            const payload = tokenManager.verifyToken(token);
            if (payload) {
                req.user = payload;
                req.token = token;
            }
        }
        
        next();
    };
}

module.exports = { createAuthMiddleware, createOptionalAuthMiddleware };

// app/routes/auth.js
const express = require('express');
const router = express.Router();
const OAuthHandlers = require('../auth/oauth_handlers');
const TokenManager = require('../auth/token_manager');
const { createAuthMiddleware, createOptionalAuthMiddleware } = require('../auth/middleware');

const tokenManager = new TokenManager(process.env.JWT_SECRET_KEY);

router.get('/authorize/:provider', async (req, res) => {
    try {
        const handlers = new OAuthHandlers(req.app.db, tokenManager);
        const result = await handlers.authorize(req.params.provider);
        
        res.redirect(result.redirectUrl);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/callback/:provider', async (req, res) => {
    try {
        const { code, state, error } = req.query;
        
        const handlers = new OAuthHandlers(req.app.db, tokenManager);
        const result = await handlers.callback(req.params.provider, code, state, error);
        
        // Redirect to frontend with tokens
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?access_token=${result.tokens.accessToken}&refresh_token=${result.tokens.refreshToken}`;
        res.redirect(redirectUrl);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        const handlers = new OAuthHandlers(req.app.db, tokenManager);
        const result = await handlers.refreshToken(refreshToken);
        
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const token = req.cookies?.access_token || req.body.token;
        
        const handlers = new OAuthHandlers(req.app.db, tokenManager);
        const result = await handlers.logout(token);
        
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/me', createAuthMiddleware(tokenManager), (req, res) => {
    res.json({
        id: req.user.sub,
        // Add other user fields as needed
    });
});

// Protected route example
router.get('/protected', createAuthMiddleware(tokenManager), (req, res) => {
    res.json({
        message: 'This is a protected route',
        user: req.user.sub
    });
});

module.exports = router;
```

## Configuration Examples

### Environment Variables

```bash
# .env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback/google

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback/github

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/callback/microsoft

# JWT Settings
JWT_SECRET_KEY=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OAuth accounts table
CREATE TABLE oauth_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    user_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- Token blacklist (optional)
CREATE TABLE token_blacklist (
    id SERIAL PRIMARY KEY,
    jti VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Client Implementation

### JavaScript Client

```javascript
class OAuthClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.accessToken = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
    }
    
    async login(provider) {
        // Redirect to OAuth provider
        window.location.href = `${this.baseURL}/auth/authorize/${provider}`;
    }
    
    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
        }
    }
    
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        
        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.accessToken = data.accessToken;
                localStorage.setItem('access_token', data.accessToken);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            // Clear tokens and redirect to login
            this.logout();
            throw error;
        }
    }
    
    async logout() {
        try {
            await fetch(`${this.baseURL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.accessToken = null;
        this.refreshToken = null;
        
        // Redirect to login
        window.location.href = '/login';
    }
    
    async authenticatedRequest(url, options = {}) {
        // Add auth header
        const authOptions = {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, authOptions);
            
            if (response.status === 401) {
                // Token expired, try to refresh
                await this.refreshAccessToken();
                
                // Retry request with new token
                authOptions.headers.Authorization = `Bearer ${this.accessToken}`;
                return fetch(url, authOptions);
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    }
}

// Usage
const oauthClient = new OAuthClient('http://localhost:8000');

// Login with Google
oauthClient.login('google');

// Handle OAuth callback
if (window.location.pathname.includes('/auth/callback')) {
    oauthClient.handleCallback();
}

// Make authenticated request
const response = await oauthClient.authenticatedRequest('/api/protected');
```

## Success Metrics

- [ ] OAuth authorization flow works with Google, GitHub, Microsoft
- [ ] PKCE implementation for SPA/mobile security
- [ ] Token creation and verification works
- [ ] Refresh token flow functions correctly
- [ ] Protected routes enforce authentication
- [ ] Session management and logout work
- [ ] CSRF protection with state parameter
- [ ] User account creation and linking works
- [ ] Frontend client integration complete

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Check OAuth provider console settings
   - Verify redirect URI matches exactly
   - Include http/https and port correctly

2. **State Parameter Mismatch**
   - Ensure state is stored in session
   - Check state parameter persistence
   - Verify CSRF protection implementation

3. **Token Exchange Failures**
   - Verify client ID and secret
   - Check authorization code is valid
   - Ensure redirect URI matches

4. **Refresh Token Issues**
   - Check refresh token storage
   - Verify refresh token expiration
   - Implement proper error handling

### Debug Commands

```bash
# Test OAuth flow
curl -X GET "http://localhost:8000/auth/authorize/google"

# Test token refresh
curl -X POST "http://localhost:8000/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token"}'

# Verify JWT token
echo "your-jwt-token" | cut -d'.' -f2 | base64 -d
```
