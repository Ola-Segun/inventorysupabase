# Authentication Flow Documentation

This document outlines the authentication logic for the application, which uses Laravel Sanctum for the backend and Next.js with Axios for the frontend.

## Overview

The authentication is based on Laravel Sanctum's SPA (Single Page Application) authentication, which uses cookies and CSRF tokens to provide a stateful authentication system.

The flow is as follows:
1.  The Next.js frontend requests a CSRF token from the Laravel backend.
2.  The backend responds with a CSRF cookie.
3.  The frontend sends a login request with the user's credentials and the CSRF token in the headers.
4.  The backend authenticates the user and creates a session.
5.  Subsequent requests from the frontend include the session cookie, and the backend uses this to identify the authenticated user.

## Backend (Laravel Sanctum)

### Configuration

-   **Sanctum**: The `config/sanctum.php` file is configured to allow stateful authentication from the frontend's domain (`localhost:3000`). The `web` guard is used for authentication.
-   **CORS**: The `config/cors.php` file is configured to allow requests from the frontend's domain, with support for credentials and the necessary headers. The `sanctum/csrf-cookie` route is exposed to allow the frontend to fetch the CSRF token.

### Routes

The authentication routes are defined in `routes/api.php`:
-   `POST /login`: Handles user login.
-   `POST /register`: Handles user registration.
-   `POST /logout`: Logs the user out.
-   `GET /profile`: Retrieves the authenticated user's profile.

All protected routes are grouped under the `auth:sanctum` middleware, which ensures that only authenticated users can access them.

### Controller

The `app/Http/Controllers/AuthController.php` controller contains the logic for handling authentication requests:
-   `login()`: Validates the user's credentials, attempts to authenticate the user, and regenerates the session.
-   `register()`: Validates the user's data, creates a new user, logs them in, and regenerates the session.
-   `profile()`: Retrieves the currently authenticated user.
-   `logout()`: Logs the user out, invalidates the session, and regenerates the CSRF token.

## Frontend (Next.js)

### Authentication Service

The `services/authService.ts` file is responsible for all communication with the backend's authentication API. It uses `axios` to make HTTP requests.

Key features of the `AuthService`:
-   An `axios` instance is created with `withCredentials: true` to ensure that cookies are sent with cross-origin requests.
-   A `getCsrfCookie()` method makes a request to `/sanctum/csrf-cookie` to get the CSRF token from the backend.
-   The `login()`, `register()`, and `logout()` methods handle the respective authentication actions. They first call `getCsrfCookie()` and then include the `X-XSRF-TOKEN` header in the request.
-   The `getUser()` method fetches the authenticated user's profile from the `/api/profile` endpoint.

### Authentication Context

The `contexts/AuthContext.tsx` file provides a React context to manage the user's authentication state throughout the application.

Key features of the `AuthProvider`:
-   It maintains the `user` state and a `isLoading` state.
-   On initial load, it calls `authService.getUser()` to check if the user is already authenticated.
-   It provides `login`, `register`, and `logout` functions that call the corresponding methods in `authService` and update the `user` state.
-   The `useAuth` hook provides easy access to the authentication context for any component in the application.

### Login Process Step-by-Step

1.  The user enters their email and password in the login form.
2.  The `login` function in `AuthContext` is called.
3.  The `login` function in `authService` is called.
4.  `authService` makes a GET request to `/sanctum/csrf-cookie` to get the CSRF token.
5.  The Laravel backend sets the `XSRF-TOKEN` cookie in the browser.
6.  `authService` reads the `XSRF-TOKEN` from the cookies and creates an `X-XSRF-TOKEN` header.
7.  `authService` makes a POST request to `/api/login` with the user's credentials and the `X-XSRF-TOKEN` header.
8.  The Laravel backend authenticates the user, creates a session, and returns the user's data.
9.  `authService` returns the user data to `AuthContext`.
10. `AuthContext` updates the `user` state, and the application re-renders to reflect the authenticated state.
