# InventoryPro Multi-Tenant SaaS Setup Guide

This guide will help you set up the InventoryPro multi-tenant SaaS inventory management system.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Vercel account (for deployment)

## 1. Install Dependencies

```bash
npm install
```

## 2. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

### Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRO_PRICE_ID=price_xxx (create in Stripe Dashboard)
STRIPE_ENTERPRISE_PRICE_ID=price_xxx (create in Stripe Dashboard)

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=InventoryPro

# Email Configuration (optional)
RESEND_API_KEY=your_resend_api_key
```

## 3. Supabase Setup

### 3.1 Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Copy your project URL and anon key to `.env.local`

### 3.2 Run Database Migrations

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Run the migration:
```bash
supabase db push
```

5. (Optional) Seed the database with sample data:
```bash
supabase db reset --linked
```

### 3.3 Configure Authentication

1. In Supabase Dashboard, go to Authentication > Settings
2. Enable email authentication
3. Configure email templates as needed
4. Set up custom claims for organization_id and role

## 4. Stripe Setup

### 4.1 Create Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create products for Pro and Enterprise plans
3. Create recurring prices for each product
4. Copy the price IDs to your `.env.local`

### 4.2 Configure Webhooks

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.created`
   - `customer.updated`
4. Copy the webhook secret to your `.env.local`

## 5. Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 6. Key Features Implemented

### ✅ Multi-Tenant Architecture
- Organization-based data isolation
- Row-Level Security (RLS) policies
- Tenant-scoped API endpoints

### ✅ Authentication & Authorization
- Supabase Auth integration
- Role-based access control (Admin, Manager, Cashier, Seller)
- Organization membership management

### ✅ Subscription Management
- Stripe integration for payments
- Multiple pricing tiers (Free, Pro, Enterprise)
- 14-day free trial
- Usage-based feature restrictions

### ✅ Database Schema
- Comprehensive multi-tenant schema
- Audit logging
- Stock movement tracking
- Order management

### ✅ Frontend Components
- Organization signup flow
- Onboarding wizard
- Responsive design
- Role-based navigation

## 7. Next Steps

### High Priority
1. **Install Dependencies**: Run `npm install` to install all required packages
2. **Complete Supabase Setup**: Configure authentication and run migrations
3. **Set up Stripe**: Create products and configure webhooks
4. **Test Signup Flow**: Create a test organization and verify functionality

### Medium Priority
1. **AI Features**: Implement demand forecasting and price optimization
2. **Advanced Analytics**: Add ML-powered insights
3. **API Access**: Create REST API for integrations
4. **Mobile Optimization**: Enhance mobile experience

### Low Priority
1. **White-label Options**: Custom branding for enterprise
2. **Advanced Integrations**: Third-party service connections
3. **Performance Optimization**: Caching and CDN setup

## 8. Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Stripe        │
│   (Next.js)     │◄──►│   (Database)    │    │   (Payments)    │
│                 │    │   (Auth)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Row Level     │    │   Webhooks      │
│   (Hosting)     │    │   Security      │    │   (Events)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 9. Security Features

- **Row-Level Security**: Database-level tenant isolation
- **JWT-based Authentication**: Secure token-based auth
- **API Rate Limiting**: Prevent abuse
- **Input Validation**: Zod schema validation
- **Audit Logging**: Track all user actions
- **HTTPS Everywhere**: Encrypted data transmission

## 10. Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to update these for production:
- `NEXT_PUBLIC_APP_URL`: Your production domain
- `STRIPE_WEBHOOK_SECRET`: Production webhook secret
- All Supabase keys should be production keys

## 11. Monitoring & Analytics

- **Error Tracking**: Implement Sentry or similar
- **Performance Monitoring**: Use Vercel Analytics
- **User Analytics**: Track feature usage
- **Business Metrics**: Monitor subscription metrics

## 12. Support & Documentation

- **User Documentation**: Create help center
- **API Documentation**: Document REST endpoints
- **Admin Documentation**: Organization management guide
- **Developer Documentation**: Integration guides

---

For questions or issues, please refer to the project documentation or create an issue in the repository.