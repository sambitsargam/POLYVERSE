# Deployment Guide

Complete guide for deploying POLYVERSE to production with x402 protocol, Filecoin storage, and KiraPay integration.

## Overview

POLYVERSE can be deployed to various platforms. This guide covers:
- **Vercel** (Recommended for Next.js)
- **Railway** (Full-stack with database)
- **AWS** (Enterprise deployment)
- **Self-hosted** (Docker/VPS)

## Prerequisites

### Required Accounts & API Keys
- [ ] **Lighthouse Storage**: [lighthouse.storage](https://lighthouse.storage) - Get API key
- [ ] **KiraPay**: [kirapay.com](https://kirapay.com) - Payment processing API keys
- [ ] **Polygon Amoy**: Testnet wallet with POL and USDC tokens
- [ ] **Domain**: For production URLs and webhooks
- [ ] **Database**: PostgreSQL for subscription tracking (optional)

### Environment Variables Checklist
```bash
# x402 Protocol
NEXT_PUBLIC_X402_FACILITATOR_URL=https://x402.polygon.technology
NEXT_PUBLIC_RECIPIENT_ADDRESS=0xYourRecipientWallet
PRIVATE_KEY_AGENT=0xYourPrivateKeyForServerOperations

# Networks
NEXT_PUBLIC_AMOY_RPC=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com

# Filecoin Storage
LIGHTHOUSE_API_KEY=your_lighthouse_api_key
LIGHTHOUSE_GATEWAY_URL=https://gateway.lighthouse.storage/ipfs/

# KiraPay
KIRAPAY_API_KEY=your_kirapay_api_key
KIRAPAY_SECRET=your_kirapay_secret
KIRAPAY_WEBHOOK_URL=https://yourdomain.com/api/webhooks/kirapay

# Security
NEXTAUTH_SECRET=your-nextauth-secret-32-chars-minimum
NEXTAUTH_URL=https://yourdomain.com

# Database (optional)
DATABASE_URL=postgresql://user:pass@host:5432/polyverse
```

## Vercel Deployment (Recommended)

### 1. Prepare Repository

```bash
# Ensure your repo is clean
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add LIGHTHOUSE_API_KEY
vercel env add KIRAPAY_API_KEY
vercel env add PRIVATE_KEY_AGENT
# ... add all other environment variables

# Redeploy with new env vars
vercel --prod
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set Framework Preset: **Next.js**
4. Add environment variables in Settings > Environment Variables
5. Deploy

### 3. Configure Domain & SSL

```bash
# Add custom domain
vercel domains add yourdomain.com

# Update environment variables with production URLs
vercel env add NEXTAUTH_URL production https://yourdomain.com
vercel env add KIRAPAY_WEBHOOK_URL production https://yourdomain.com/api/webhooks/kirapay
```

### 4. Verify Deployment

```bash
# Test x402 endpoint
curl https://yourdomain.com/api/subscriptions/purchase \
  -H "Content-Type: application/json" \
  -d '{"planId":"basic-weekly"}'

# Should return HTTP 402 Payment Required
```

## Railway Deployment

Railway provides managed PostgreSQL and is ideal for full-stack deployments.

### 1. Setup Railway Project

```bash
# Install Railway CLI  
npm install -g @railway/cli

# Login and create project
railway login
railway init
```

### 2. Add Database

```bash
# Add PostgreSQL service
railway add postgresql

# Get database URL
railway variables
# Copy DATABASE_URL value
```

### 3. Configure Environment

```bash
# Set environment variables
railway variables set LIGHTHOUSE_API_KEY your_key_here
railway variables set KIRAPAY_API_KEY your_key_here
railway variables set PRIVATE_KEY_AGENT 0xYourPrivateKey
railway variables set NEXTAUTH_SECRET your-secret-here

# Set URLs with Railway domain
railway variables set NEXTAUTH_URL https://your-app.up.railway.app
railway variables set KIRAPAY_WEBHOOK_URL https://your-app.up.railway.app/api/webhooks/kirapay
```

### 4. Deploy

```bash
# Deploy to Railway
railway up

# Check deployment status
railway status
```

### 5. Database Setup

```bash
# Run database migrations (if using Prisma)
railway run npx prisma db push

# Or manually create tables
railway connect postgresql
# Run your SQL schema
```

## AWS Deployment

For enterprise deployments requiring full control and scalability.

### Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │───▶│   App Runner /   │───▶│   RDS/Aurora    │
│   (CDN)         │    │   ECS Fargate    │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Route 53      │    │   Secrets        │    │   S3 Bucket     │
│   (DNS)         │    │   Manager        │    │   (Static)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 1. Setup AWS Infrastructure

```bash
# Install AWS CLI and configure
aws configure

# Create S3 bucket for static assets
aws s3 mb s3://polyverse-static-assets

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier polyverse-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20
```

### 2. Container Setup

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 3. Deploy with App Runner

```yaml
# apprunner.yaml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - npm ci
      - npm run build
run:
  runtime-version: 18
  command: npm start
  network:
    port: 3000
    env: PORT
  env:
    - name: NODE_ENV
      value: production
```

```bash
# Deploy to App Runner
aws apprunner create-service \
  --service-name polyverse-app \
  --source-configuration file://apprunner.yaml
```

### 4. Setup Secrets Manager

```bash
# Store sensitive environment variables
aws secretsmanager create-secret \
  --name polyverse/env \
  --secret-string '{
    "LIGHTHOUSE_API_KEY": "your_key",
    "KIRAPAY_SECRET": "your_secret", 
    "PRIVATE_KEY_AGENT": "0xYourPrivateKey",
    "DATABASE_URL": "postgresql://user:pass@rds-endpoint/db"
  }'
```

### 5. Configure CloudFront CDN

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

## Docker Self-Hosted

For VPS deployment with Docker Compose.

### 1. Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/polyverse
    env_file:
      - .env.production
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: polyverse
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

### 2. Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Special handling for x402 endpoints
        location /api/subscriptions/purchase {
            proxy_pass http://app;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### 3. Deploy

```bash
# Create production environment file
cp .env.example .env.production
# Edit with production values

# Deploy with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app
```

## Database Setup

### Schema Creation

```sql
-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address VARCHAR(42) NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  network VARCHAR(20) NOT NULL DEFAULT 'polygon-amoy',
  amount DECIMAL(18,6) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USDC',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  provider VARCHAR(20) NOT NULL, -- 'x402' or 'kirapay'
  external_id VARCHAR(100) NOT NULL,
  tx_hash VARCHAR(66),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  amount DECIMAL(18,6) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  network VARCHAR(20) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscriptions_user_address ON subscriptions(user_address);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_external_id ON payments(external_id);
CREATE INDEX idx_payments_status ON payments(status);
```

## Monitoring & Analytics

### 1. Health Check Endpoints

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      lighthouse: await checkLighthouse(),
      kirapay: await checkKiraPay(),
      blockchain: await checkBlockchain()
    }
  };

  const allHealthy = Object.values(health.services)
    .every(service => service.status === 'ok');

  return Response.json(health, { 
    status: allHealthy ? 200 : 503 
  });
}
```

### 2. Logging Setup

```typescript
// src/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

export default logger;
```

### 3. Error Tracking

```bash
# Add Sentry for error tracking
npm install @sentry/nextjs

# Configure in next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Your Next.js config
}, {
  silent: true,
  org: "your-org",
  project: "polyverse",
});
```

## Security Checklist

### Production Security

- [ ] **HTTPS Only**: Force SSL/TLS for all connections
- [ ] **Environment Variables**: Never commit secrets to version control
- [ ] **API Rate Limiting**: Implement rate limiting on all endpoints
- [ ] **Input Validation**: Sanitize all user inputs
- [ ] **CORS Policy**: Configure proper CORS headers
- [ ] **CSP Headers**: Implement Content Security Policy
- [ ] **Webhook Signatures**: Verify all webhook signatures
- [ ] **Database Security**: Use connection pooling and read replicas
- [ ] **Monitoring**: Set up alerts for unusual activity
- [ ] **Backups**: Regular database and file backups

### Environment Specific Security

```typescript
// src/middleware.ts - Production security headers
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // CSP for Web3 apps
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval'; connect-src 'self' https://*.polygon.technology https://*.lighthouse.storage https://*.kirapay.com wss:;"
  );

  return response;
}
```

## Performance Optimization

### 1. Caching Strategy

```typescript
// src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function cacheSubscriptionPlans() {
  const plans = await getSubscriptionPlans();
  await redis.setex('subscription:plans', 3600, JSON.stringify(plans));
  return plans;
}

export async function getCachedPlans() {
  const cached = await redis.get('subscription:plans');
  return cached ? JSON.parse(cached) : null;
}
```

### 2. Database Optimization

```sql
-- Add database indexes for performance
CREATE INDEX CONCURRENTLY idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX CONCURRENTLY idx_subscriptions_created_at ON subscriptions(created_at);
CREATE INDEX CONCURRENTLY idx_payments_created_at ON payments(created_at);

-- Partition large tables by date
CREATE TABLE subscriptions_2025_q4 PARTITION OF subscriptions 
  FOR VALUES FROM ('2025-10-01') TO ('2025-12-31');
```

### 3. CDN Configuration

```javascript
// next.config.js - Optimize static assets
module.exports = {
  images: {
    domains: ['gateway.lighthouse.storage', 'ipfs.io'],
    formats: ['image/webp', 'image/avif'],
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' }
      ]
    },
    {
      source: '/_next/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ]
    }
  ]
};
```

## Troubleshooting

### Common Deployment Issues

**Build Failures:**
```bash
# Check Node.js version compatibility
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npm run build
```

**Environment Variable Issues:**
```bash
# Verify environment variables are set
echo $LIGHTHOUSE_API_KEY
echo $KIRAPAY_API_KEY

# Check Next.js environment variable prefixes
# Browser variables need NEXT_PUBLIC_ prefix
```

**Database Connection Issues:**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection limits
SELECT * FROM pg_stat_activity WHERE datname = 'polyverse';
```

**x402 Protocol Issues:**
```bash
# Test x402 endpoint
curl -v https://yourdomain.com/api/subscriptions/purchase \
  -H "Content-Type: application/json" \
  -d '{"planId":"basic-weekly"}'

# Should return 402 with x402 headers
```

### Monitoring Commands

```bash
# Check application health
curl https://yourdomain.com/api/health

# Monitor logs (Docker)
docker-compose logs -f app

# Monitor database performance
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# Check Redis cache hit rate
redis-cli info stats | grep hit_rate
```

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Review error logs and metrics
   - Check database performance
   - Monitor transaction success rates
   - Update dependencies

2. **Monthly:**
   - Database maintenance (VACUUM, ANALYZE)
   - Security updates
   - Backup verification
   - Performance optimization

3. **Quarterly:**
   - Security audit
   - Disaster recovery testing
   - Capacity planning
   - Architecture review

### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Database backup script

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_$DATE.sql"

# Upload to S3
aws s3 cp "$BACKUP_DIR/db_$DATE.sql" s3://polyverse-backups/

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql"
```