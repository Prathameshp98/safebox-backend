

## 🔐 JWT Authentication – Full Flow (with Logout & Expired Refresh Token)

### 1. **Login**

* User logs in with email/password.
* Server validates → returns:

  * **Access token** (short-lived).
  * **Refresh token** (long-lived).

---

### 2. **Using Access Token**

* Client stores access token (in memory or local storage).
* Sends it with each API call in the header:

  ```
  Authorization: Bearer <access_token>
  ```

---

### 3. **Why Access Token Exists**

* **Lightweight** and **short-lived** → safer for frequent API calls.
* Refresh token is **long-lived** and stored safely (not sent with each request).
* If only one long-lived token was used → higher risk if stolen.

---

### 4. **Access Token Expiry**

* When expired:

  * Client detects via `exp` field or `401 Unauthorized`.
  * Client calls `/refresh` with refresh token.
  * Server verifies refresh token → returns **new access token**.

---

### 5. **Refresh Token Expiry**

* If refresh token is **also expired**:

  * Server responds with error (`401` or `403`).
  * Client must **force logout** → clear tokens, redirect to `/signin`.
* 🔑 **Best practice**: Backend should **not auto-call `/logout` internally**.

  * Instead, just reject the request.
  * Client decides how to handle (clear tokens + redirect).

---

### 6. **Logout Flow**

* Proper logout has **two steps**:

  1. **Server-side** → revoke refresh token from DB (session deleted).
  2. **Client-side** → clear access token + refresh token from in-memory or local storage.

     ```ts
     localStorage.removeItem("accessToken");
     localStorage.removeItem("refreshToken");
     // or reset in-memory variables
     navigate("/signin");
     ```
* This ensures the user can’t make new requests (no tokens left) and is redirected to login.

---

### 7. **Closing Browser / Tab**

* **In-memory tokens** → gone immediately (user logs in again).
* **Local storage / cookies** → tokens persist → user stays logged in until expiry or logout.

---

## 🔁 Flow Recap

1. Login → Get access + refresh tokens.
2. Use access token for APIs.
3. If access token expired → use refresh token to get new one.
4. If refresh token expired → backend rejects → client clears tokens & redirects.
5. Logout = revoke refresh token (server) + delete tokens (client).

---

⚡ **Analogy**:

* Access token = **visitor badge** (checked every time, expires soon).
* Refresh token = **passport** (used only to renew badges).
* Logout = **passport cut up + badge thrown away**.
* Closing browser = depends where you keep them (desk drawer vs pocket).

