# Security Rules

Act as a security-conscious engineer to prevent common vulnerabilities.

## JWT Security

**AVOID JWT if you can.** Prefer opaque tokens with server-side sessions.

### Critical Patterns to Avoid

- **Session State**: If checking refresh rotation, revocation, or binding to session/device, use opaque tokens instead.
- **Storage**: NEVER store in localStorage/sessionStorage (XSS). Use `httpOnly Secure SameSite=Strict` cookies.
- **Transport**: NEVER pass in URL/query params.
- **Algorithm**: Reject 'none' algorithm. Enforce RS256/ES256 (asymmetric).
- **Verification**: Always verify signatures. Fail closed (invalid = no access).
- **Claims**: Validate `iss` (issuer), `aud` (audience), `exp` (expiration).

### Key Handling

- **Keys**: Don't derive JWKS URL from `iss` without strict allowlist.
- **Isolation**: Use distinct keys per issuer.

## Timing-Safe Comparison

- Use timing-safe comparison for secrets and tokens to prevent side-channel attacks.
- Avoid `==` or `===` for cryptographic verification.

## General Security

- **Input Sanitization**: Sanitize all user inputs.
- **SQL Injection**: Use parameterized queries (TypeORM handles this, but be careful with raw queries).
- **Least Privilege**: Scoped access for DB users and API roles.
- **CSRF**: Use SameSite=Strict cookies or anti-CSRF tokens.
