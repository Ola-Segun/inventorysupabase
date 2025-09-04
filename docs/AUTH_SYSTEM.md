# Authentication & Authorization System Documentation

## Overview

This document provides comprehensive documentation for the authentication and authorization system implemented in the Inventory Management System. The system provides enterprise-grade security features including role-based access control (RBAC), permission management, session handling, and audit logging.

## Architecture

### Core Components

1. **Supabase Auth** - Primary authentication provider
2. **Custom Permission System** - Granular permission management
3. **Next.js Middleware** - Route protection and security headers
4. **Row Level Security (RLS)** - Database-level access control
5. **Audit Logging** - Comprehensive activity tracking

### Database Schema

#### Core Tables

- `organizations` - Top-level entities
- `stores` - Business locations within organizations
- `users` - System users with roles and permissions
- `store_invitations` - User invitation system
- `audit_logs` - Activity tracking
- `user_permissions_view` - Permission aggregation view

#### Key Relationships

```
organizations (1) ──── (N) stores
organizations (1) ──── (N) users
stores (1) ──── (N) users
users (1) ──── (N) audit_logs
```

## User Roles & Permissions

### Built-in Roles

| Role | Description | Default Permissions |
|------|-------------|-------------------|
| `super_admin` | Full system access | All permissions |
| `admin` | Organization management | Users, products, orders, reports |
| `manager` | Store management | Products, orders, reports |
| `cashier` | Point of sale | Orders, customers, inventory view |
| `seller` | Sales operations | Orders, customers |

### Permission Structure

Permissions follow the format: `resource.action`

#### Available Permissions

- **Users**: `users.create`, `users.read`, `users.update`, `users.delete`, `users.invite`
- **Products**: `products.create`, `products.read`, `products.update`, `products.delete`
- **Orders**: `orders.create`, `orders.read`, `orders.update`, `orders.delete`, `orders.void`
- **Categories**: `categories.create`, `categories.read`, `categories.update`, `categories.delete`
- **Customers**: `customers.create`, `customers.read`, `customers.update`, `customers.delete`
- **Suppliers**: `suppliers.create`, `suppliers.read`, `suppliers.update`, `suppliers.delete`
- **Reports**: `reports.read`, `reports.export`
- **Inventory**: `inventory.read`, `inventory.update`
- **Settings**: `settings.read`, `settings.update`
- **Audit**: `audit.read`

## Security Features

### Password Policy

- Minimum 8 characters
- Requires uppercase, lowercase, numbers, and special characters
- Prevents common passwords
- Prevents personal information usage
- Maximum 3 consecutive identical characters

### Account Lockout

- 5 failed attempts trigger lockout
- Progressive lockout duration (15min, 30min, 1hr, etc.)
- Automatic reset after 30 minutes of no attempts

### Session Management

- HTTP-only cookies for session storage
- Automatic session refresh
- Session termination capabilities
- Device tracking and management

### Security Headers

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "store_id": "uuid"
  },
  "store": { /* store data */ },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1234567890
  }
}
```

#### POST `/api/auth/signup`
Register new user and create store/organization.

#### POST `/api/auth/logout`
Logout user and clear session.

### Invitations

#### POST `/api/auth/invitations`
Create user invitation.

**Request:**
```json
{
  "email": "newuser@example.com",
  "role": "cashier",
  "storeId": "store-uuid"
}
```

#### GET `/api/auth/invitations/[token]`
Validate invitation token.

#### POST `/api/auth/invitations/[token]`
Accept invitation.

**Request:**
```json
{
  "name": "New User",
  "password": "securepassword"
}
```

## Frontend Components

### PermissionGuard

Conditionally render components based on permissions.

```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard'

// Single permission
<PermissionGuard permission="users.create">
  <CreateUserButton />
</PermissionGuard>

// Multiple permissions (any)
<PermissionGuard permissions={['users.create', 'users.update']}>
  <UserManagementPanel />
</PermissionGuard>

// Resource + action
<PermissionGuard resource="products" action="update">
  <EditProductForm />
</PermissionGuard>
```

### Convenience Components

```tsx
import {
  AdminOnly,
  ManagerOnly,
  UserManagementGuard,
  ProductManagementGuard
} from '@/components/auth/PermissionGuard'

// Role-based components
<AdminOnly>
  <AdminDashboard />
</AdminOnly>

// Resource-specific guards
<UserManagementGuard action="create">
  <InviteUserButton />
</UserManagementGuard>
```

### Enhanced Session Manager

```tsx
import { EnhancedSessionManager } from '@/components/auth/EnhancedSessionManager'

function SettingsPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <EnhancedSessionManager />
    </div>
  )
}
```

## Hooks

### usePermissions

```tsx
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { can, canAccess, hasAnyPermission, hasAllPermissions } = usePermissions()

  const handleCreateUser = async () => {
    if (await can('users.create')) {
      // Create user logic
    }
  }

  const handleUpdateProduct = async () => {
    if (await canAccess('products', 'update')) {
      // Update product logic
    }
  }

  return (
    <div>
      {hasAnyPermission(['users.create', 'users.update']) && (
        <UserManagementButton />
      )}
    </div>
  )
}
```

### Specific Permission Hooks

```tsx
import {
  useUserPermissions,
  useProductPermissions,
  useOrderPermissions
} from '@/hooks/usePermissions'

function UserComponent() {
  const { canCreateUsers, canReadUsers } = useUserPermissions()

  return (
    <div>
      {canReadUsers() && <UserList />}
      {canCreateUsers() && <CreateUserButton />}
    </div>
  )
}
```

## Database Functions

### Permission Checking

#### `user_has_permission(user_uuid UUID, required_permission TEXT)`
Returns boolean indicating if user has permission.

#### `get_user_permissions(user_uuid UUID)`
Returns array of user's permissions.

#### `get_user_permissions_secure(user_uuid UUID)`
Secure version that only allows users to check their own permissions.

### Audit Logging

#### `log_audit_event(action, table_name, record_id, old_values, new_values)`
Logs an audit event.

```sql
SELECT log_audit_event(
  'user_updated',
  'users',
  'user-uuid',
  '{"name": "Old Name"}',
  '{"name": "New Name"}'
);
```

## Row Level Security (RLS) Policies

### Organizations
- Users can view their own organization
- Super admins can manage all organizations

### Stores
- Users can view stores in their organization
- Store owners and admins can manage their stores

### Users
- Users can view users in their organization
- Users can update their own profile
- Admins can manage users in their organization

### Audit Logs
- Users can view audit logs for their organization
- System can insert audit logs

## Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Password Policy Configuration

```typescript
import { DEFAULT_PASSWORD_POLICY } from '@/lib/auth/passwordPolicy'

// Customize policy
const customPolicy = {
  ...DEFAULT_PASSWORD_POLICY,
  minLength: 12,
  requireSpecialChars: false
}
```

### Lockout Configuration

```typescript
import { DEFAULT_LOCKOUT_CONFIG } from '@/lib/auth/passwordPolicy'

// Customize lockout
const customLockout = {
  ...DEFAULT_LOCKOUT_CONFIG,
  maxAttempts: 3,
  lockoutDuration: 30
}
```

## Usage Examples

### Protecting API Routes

```typescript
// pages/api/users/index.ts
import { NextApiRequest, NextApiResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { user_has_permission } from '@/lib/auth/checkPermissions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Get user from session
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Check permission
  const hasPermission = await user_has_permission(user.id, 'users.read')
  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  // Proceed with API logic
  const { data: users } = await supabase.from('users').select('*')
  res.status(200).json({ users })
}
```

### Client-side Permission Checks

```tsx
// components/UserManagement.tsx
import { usePermissions } from '@/hooks/usePermissions'
import { PermissionGuard } from '@/components/auth/PermissionGuard'

export function UserManagement() {
  const { can } = usePermissions()

  return (
    <div>
      <PermissionGuard permission="users.read">
        <UserList />
      </PermissionGuard>

      <PermissionGuard permission="users.create">
        <CreateUserButton />
      </PermissionGuard>

      {/* Or use hook directly */}
      {can('users.delete') && <DeleteUserButton />}
    </div>
  )
}
```

## Security Best Practices

### For Developers

1. **Always check permissions** on both client and server
2. **Use HTTPS** in production
3. **Validate input** on both client and server
4. **Log security events** for monitoring
5. **Regular security audits** of the system

### For Administrators

1. **Monitor audit logs** regularly
2. **Review user permissions** periodically
3. **Enforce strong passwords** through policy
4. **Terminate unused sessions**
5. **Keep software updated**

## Troubleshooting

### Common Issues

#### Permission Denied Errors
- Check if user has required permissions
- Verify RLS policies are enabled
- Ensure user is authenticated

#### Session Issues
- Check cookie settings
- Verify Supabase configuration
- Clear browser cookies if needed

#### Database Connection Issues
- Verify Supabase credentials
- Check network connectivity
- Ensure database is accessible

### Debug Mode

Enable debug logging by setting:

```env
DEBUG_AUTH=true
DEBUG_PERMISSIONS=true
```

## Migration Guide

### From Basic Auth to Advanced Auth

1. **Run database migration**
   ```bash
   # Apply the schema migration
   # SQL file: supabase/migrations/001_initial_auth_schema.sql
   ```

2. **Update existing components**
   ```tsx
   // Before
   <div>Admin Content</div>

   // After
   <PermissionGuard permission="admin.access">
     <div>Admin Content</div>
   </PermissionGuard>
   ```

3. **Update API routes**
   ```typescript
   // Before
   export default function handler(req, res) {
     // API logic
   }

   // After
   export default async function handler(req, res) {
     const hasPermission = await user_has_permission(userId, 'resource.action')
     if (!hasPermission) {
       return res.status(403).json({ error: 'Forbidden' })
     }
     // API logic
   }
   ```

## Support

For issues or questions regarding the authentication system:

1. Check this documentation
2. Review audit logs for security events
3. Contact the development team
4. Create an issue in the project repository

## Changelog

### Version 1.0.0
- Initial implementation
- Basic authentication with Supabase
- Role-based access control
- Permission system
- Session management
- Audit logging
- Password policy enforcement
- Account lockout mechanism
- Invitation system
- Row Level Security policies