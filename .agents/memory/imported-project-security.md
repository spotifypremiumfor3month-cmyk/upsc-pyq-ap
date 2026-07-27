---
name: Imported project security
description: Security checks for repositories imported from external sources.
---

When setting up an imported repository, inspect tracked Replit and project configuration for hardcoded credentials before declaring the setup complete. Remove credentials from tracked files and use the environment secrets flow only when the application actually needs the value.

**Why:** Imported repositories can contain credentials that are unrelated to the app's current run command; leaving them in configuration creates an avoidable exposure even when the app itself works.

**How to apply:** Scan `.replit`, deployment configuration, environment examples, and source files for credential-like values during the initial setup verification. If a credential was exposed, recommend immediate revocation and replacement by the owner.