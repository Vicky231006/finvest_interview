# Architectural Flaw & Security Mitigation Strategy

## 🚨 The Root Flaw: Client-Side Trust Assumption
The application loophole occurred because the previous architecture operated under the flawed assumption that the backend could trust any data sent from the client-side user interface. 

Frontend form validation (written in JavaScript inside a user's browser) is fundamentally an element of user experience—**it is not security**. An attacker can easily bypass the web browser UI entirely using API clients (`curl`, Postman, automated scripts) to fire raw HTTP `POST` requests directly to an open, unverified backend route configuration (e.g., `/api/register`). If the backend saves these payloads without secondary verification, registration checks and payment protocols are completely bypassed.

---

## 🔒 The Permanent Architectural Fix

### 1. Zero-Trust Server-Side Schema Validation
Never store raw client request content without isolation screening. All inbound parameters must run through strict structural verification at the backend controller gate level using object parser libraries (such as **Zod** or **Joi**). If data structures violate requirements (e.g., non-edu email patterns), the payload is rejected on the spot before interacting with any system databases.

### 2. Cryptographically Enforced Gateway Webhooks
To verify that payments were successfully handled, the backend database write process must be completely decoupled from client control triggers. 
* The system configuration must register an official **Server-to-Server Webhook Endpoint** directly with the payment provider infrastructure (such as Razorpay or Stripe).
* Upon a successful checkout transaction, the provider's server contacts your backend webhook directly, carrying a cryptographically signed signature header computed with a shared private secret keyspace (`HMAC-SHA256`).
* Your backend re-computes this cryptographic signature locally. Only when signatures match perfectly does the registration write update execute, guaranteeing every entry represents a genuine, paid transaction.