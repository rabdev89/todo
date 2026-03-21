# SKILL: JWT Authentication

## Metadata
- **Category**: authentication
- **Scope**: service
- **Difficulty**: Medium
- **Last Updated**: 2024-03-07
- **Effectiveness**: High

## Problem
How to implement secure JWT-based authentication for API endpoints with token refresh, proper error handling, and role-based access control.

## Solution Overview
Implement a layered authentication system:
1. **Token Service** - Generate and validate JWTs
2. **Auth Middleware** - Verify tokens on protected routes
3. **User Service** - Handle user credentials and roles
4. **Refresh Logic** - Handle token expiration gracefully

## Implementation

### Files to Create

| File | Purpose | Layer |
|------|---------|-------|
| `src/services/auth/token_service.ts` | JWT generation/validation | service |
| `src/services/auth/auth_middleware.ts` | Route protection | service |
| `src/services/auth/user_service.ts` | User credential management | service |
| `src/models/auth/jwt_payload.ts` | Token payload types | model |
| `src/utils/auth/password_utils.ts` | Password hashing | utils |

### Code Pattern

#### Token Service
```typescript
// src/services/auth/token_service.ts
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../../models/auth/jwt_payload';

export class TokenService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  static generateTokens(userId: string, email: string, roles: string[]): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: JwtPayload = {
      sub: userId,
      email,
      roles,
      type: 'access'
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign(
      { sub: userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
      throw new AuthError('Invalid or expired token', 401);
    }
  }

  static verifyRefreshToken(token: string): { sub: string } {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { sub: string };
    } catch (error) {
      throw new AuthError('Invalid refresh token', 401);
    }
  }
}
```

#### Auth Middleware
```typescript
// src/services/auth/auth_middleware.ts
import { Request, Response, NextFunction } from 'express';
import { TokenService } from './token_service';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = TokenService.verifyAccessToken(token);
    req.user = {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRoles(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
```

#### User Service
```typescript
// src/services/auth/user_service.ts
import bcrypt from 'bcrypt';
import { TokenService } from './token_service';

export class UserService {
  static async authenticateUser(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    // Fetch user from database
    const user = await db.users.findByEmail(email);
    if (!user) return null;

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return null;

    // Generate tokens
    return TokenService.generateTokens(
      user.id,
      user.email,
      user.roles
    );
  }

  static async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string } | null> {
    try {
      const payload = TokenService.verifyRefreshToken(refreshToken);
      const user = await db.users.findById(payload.sub);
      
      if (!user) return null;

      const { accessToken } = TokenService.generateTokens(
        user.id,
        user.email,
        user.roles
      );

      return { accessToken };
    } catch (error) {
      return null;
    }
  }
}
```

#### JWT Payload Type
```typescript
// src/models/auth/jwt_payload.ts
export interface JwtPayload {
  sub: string;        // User ID
  email: string;
  roles: string[];
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
```

### Key Principles

1. **Separate Access and Refresh Tokens**
   - Access tokens: Short-lived (15 min), used for API calls
   - Refresh tokens: Long-lived (7 days), used only to get new access tokens

2. **Never Store Sensitive Data in JWT**
   - Only store user ID, email, roles
   - Never store passwords or secrets

3. **Use Strong Secrets**
   - JWT_SECRET: 256-bit minimum
   - JWT_REFRESH_SECRET: Different from access secret
   - Store in environment variables

4. **Proper Error Handling**
   - 401: Authentication failed (bad credentials/token)
   - 403: Authorization failed (insufficient permissions)

## Variations

### Variation A: Stateless (No Database for Refresh Tokens)
**Use when**: Simple applications, single device per user
**Difference**: Trust refresh tokens completely, no revocation possible

### Variation B: Stateful (Database-Tracked Refresh Tokens)
**Use when**: Multi-device, need token revocation
**Difference**: Store refresh token hashes in DB, validate on each refresh

```typescript
// Additional method for stateful version
static async revokeRefreshToken(userId: string, tokenHash: string): Promise<void> {
  await db.refreshTokens.delete({ userId, tokenHash });
}
```

## Integration

### With Other Skills

- **Repository Pattern**: Use for user database operations
- **Error Handling**: Integrate with global error handler for AuthError
- **API Patterns**: Apply to REST API endpoints
- **Testing**: Use testing patterns for auth integration tests

### Dependencies

- `jsonwebtoken` library
- `bcrypt` for password hashing
- User database table with email, password_hash, roles columns
- Environment variables: JWT_SECRET, JWT_REFRESH_SECRET

## Examples

### Example 1: Login Endpoint

```typescript
// src/api/routes/authRoutes.ts
import { Router } from 'express';
import { UserService } from '../../services/auth/user_service';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const tokens = await UserService.authenticateUser(email, password);
  
  if (!tokens) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  const result = await UserService.refreshAccessToken(refreshToken);
  
  if (!result) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  res.json({ accessToken: result.accessToken });
});

export default router;
```

### Example 2: Protected Route with Role Check

```typescript
// src/api/routes/adminRoutes.ts
import { Router } from 'express';
import { authMiddleware, requireRoles } from '../../services/auth/auth_middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Admin only route
router.get('/users', 
  requireRoles(['admin']),
  async (req, res) => {
    const users = await db.users.findAll();
    res.json(users);
  }
);

// Admin or manager route
router.get('/reports',
  requireRoles(['admin', 'manager']),
  async (req, res) => {
    const reports = await generateReports();
    res.json(reports);
  }
);

export default router;
```

## Common Mistakes

- **Storing passwords in JWT**: Never include passwords or secrets in token payload
- **Using same secret for access and refresh**: Always use different secrets
- **Not validating token expiration**: Always check exp claim
- **Storing tokens in localStorage**: Vulnerable to XSS, use httpOnly cookies when possible
- **No rate limiting on login**: Implement rate limiting to prevent brute force

## Validation Checklist

- [ ] JWT_SECRET is set and strong (256-bit minimum)
- [ ] JWT_REFRESH_SECRET is different from JWT_SECRET
- [ ] Access tokens expire in 15 minutes or less
- [ ] Refresh tokens expire in reasonable time (7-30 days)
- [ ] Passwords are hashed with bcrypt (10+ rounds)
- [ ] Auth middleware validates tokens on protected routes
- [ ] Role checks are enforced where required
- [ ] Error responses don't leak sensitive info
- [ ] Refresh endpoint is rate-limited
- [ ] Token payload doesn't contain sensitive data

## References

### Related Skills
- `skills-library/authentication/SESSION_AUTH.md` - Session-based alternative
- `skills-library/api-patterns/REST_ENDPOINTS.md` - API structure
- `skills-library/testing/AUTH_TESTING.md` - Testing auth flows

### External Resources
- [JWT.io](https://jwt.io/) - JWT debugger and validator
- [OWASP JWT Security](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/10-Testing_JSON_Web_Tokens)
- [jsonwebtoken library docs](https://github.com/auth0/node-jsonwebtoken)

## Success Metrics

- **Implementation Time**: 2-4 hours for initial setup
- **Test Coverage**: 90%+ for auth service
- **Security Audit**: Passes OWASP JWT guidelines
- **Performance**: Token validation < 10ms

---

**Effectiveness Tracking**:
- Applications: 0
- Success Rate: N/A
- Common Issues: None reported yet
- Last Validated: 2024-03-07
