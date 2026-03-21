# SKILL: Security Engineering & Auditing

## Metadata
- **Category**: agents
- **Scope**: universal
- **Difficulty**: Complex
- **Last Updated**: 2026-03-09
- **Effectiveness**: High

## Problem
Developers often treat security as an afterthought or a "check-the-box" exercise at the end of a project. This leads to vulnerabilities (OWASP Top 10), data breaches, and costly retrofitting.

## Solution Overview
The **Security Engineer Agent** proactively integrates security into the SDLC via Threat Modeling (STRIDE) during design and comprehensive Vulnerability Assessment during verification. It shifts security left.

## Implementation

### Files to Create
| File | Purpose | Layer |
|------|---------|-------|
| `SECURITY_AUDIT.md` | Audit findings, threat models, and remediation plan | Documentation |
| `threat_model.md` | STRIDE analysis for a specific Epic | Epic Management |

### Code Pattern (Remediation Example)
```typescript
// VULNERABLE: SQL Injection
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;

// SECURE: Parameterized Query
const query = 'SELECT * FROM users WHERE id = $1';
const values = [req.params.id];
await db.query(query, values);
```

### Key Principles
1.  **Defense in Depth**: Layered security (WAF -> Auth -> RBAC -> Data validation -> Encryption).
2.  **Least Privilege**: Components should only have the permissions they strictly need.
3.  **Secure Defaults**: Fail closed, deny by default.
4.  **Input Validation**: Validate at the boundary (API, UI), sanitize before storage/display.

## Variations

### Variation A: Threat Modeling (Design Phase)
Focus on architectural risks (STRIDE).
- **Spoofing**: Auth mechanisms.
- **Tampering**: Integrity checks.
- **Repudiation**: Logging/Auditing.
- **Info Disclosure**: Encryption/Masking.
- **DoS**: Rate limiting.
- **Elevation**: RBAC/ABAC.

### Variation B: Vulnerability Assessment (Verify Phase)
Focus on implementation flaws (OWASP).
- Injection, Broken Auth, XSS, Insecure Deserialization, etc.

## Integration

### With Other Skills
- **Planner**: Security requirements must be in the BLUEPRINT.
- **Executor**: Needs secure coding patterns (auth, validation).
- **Verifier**: Security tests (SAST/DAST) are part of verification.

### Dependencies
- Access to `PRD.md` (for requirements) and `system_architecture.md`.

## Examples

### Example 1: Auth Feature Audit
**Scenario**: User login flow.
**Threat**: Brute force attacks.
**Mitigation**: Implement rate limiting (Redis token bucket) and account lockout policies.

## Common Mistakes
- **Trusting Client Input**: Never trust data from the frontend.
- **Hardcoded Secrets**: Storing API keys in code (use env vars/vaults).
- **Vague Error Messages**: Leaking stack traces to the user (use generic errors).

## Validation Checklist
- [ ] Threat model created (STRIDE analysis).
- [ ] Authentication & Authorization verified.
- [ ] Input validation applied on all boundaries.
- [ ] Secrets management verified (no hardcoded keys).
- [ ] Logging enables audit trails without leaking PII.

## References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [STRIDE Model](https://en.wikipedia.org/wiki/STRIDE_(security))
