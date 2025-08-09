# Deployment Guide

This guide covers deploying the PLEX ERP Automation System to various environments and platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Platform-Specific Guides](#platform-specific-guides)
- [Monitoring and Logging](#monitoring-and-logging)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn 1.22+)
- **Git**: Latest stable version
- **Memory**: Minimum 512MB RAM
- **Storage**: 1GB free space

### Production Requirements

- **HTTPS**: SSL certificate required
- **Domain**: Custom domain recommended
- **Database**: PostgreSQL (for production backend)
- **CDN**: For static asset delivery
- **Monitoring**: Application performance monitoring

## ⚙️ Environment Configuration

### Environment Variables

Create environment-specific configuration files:

#### Development (`.env.local`)

```env
# PLEX ERP Configuration (Optional for development)
PLEX_API_URL=
PLEX_API_KEY=
PLEX_CLIENT_ID=

# Application Configuration
NEXT_PUBLIC_APP_NAME=PLEX ERP Automation
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES=false
```

#### Production (`.env.production`)

```env
# PLEX ERP Configuration (Required)
PLEX_API_URL=https://your-plex-instance.com/api
PLEX_API_KEY=your_production_api_key
PLEX_CLIENT_ID=your_production_client_id

# Application Configuration
NEXT_PUBLIC_APP_NAME=PLEX ERP Automation
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES=true

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
```

### Configuration Validation

Create a configuration validation script:

```typescript
// scripts/validate-env.ts
import { config } from 'dotenv';

config();

const requiredEnvVars = [
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_VERSION',
  'NODE_ENV',
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
  
  console.log('✅ Environment configuration validated');
};

validateEnv();
```

## 🏠 Local Development

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-username/erp-automation-system.git
cd erp-automation-system

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Start development server
npm run dev
```

### Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm test
npm run test:coverage
npm run test:e2e
```

### Docker Development

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

## 🚀 Production Deployment

### Build Process

```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Start production server
npm run start
```

### Production Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Production Docker Compose

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
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🌐 Platform-Specific Guides

### Vercel Deployment

1. **Connect Repository**:
   - Connect your GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**:
   ```bash
   # Set in Vercel dashboard
   PLEX_API_URL=https://your-plex-instance.com/api
   PLEX_API_KEY=your_api_key
   PLEX_CLIENT_ID=your_client_id
   ```

3. **Build Configuration**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install"
   }
   ```

### Netlify Deployment

1. **Build Settings**:
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Environment Variables**:
   - Set in Netlify dashboard
   - Use the same variables as production

### AWS Deployment

#### EC2 with Docker

```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Deploy application
docker-compose up -d
```

#### ECS Fargate

```yaml
# task-definition.json
{
  "family": "erp-automation",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "erp-app",
      "image": "your-registry/erp-automation:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

### Google Cloud Platform

#### Cloud Run

```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/erp-automation

# Deploy to Cloud Run
gcloud run deploy erp-automation \
  --image gcr.io/PROJECT_ID/erp-automation \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

#### Azure Container Instances

```bash
# Build and push to Azure Container Registry
az acr build --registry yourregistry --image erp-automation .

# Deploy to Container Instances
az container create \
  --resource-group your-rg \
  --name erp-automation \
  --image yourregistry.azurecr.io/erp-automation:latest \
  --ports 3000 \
  --dns-name-label erp-automation
```

## 📊 Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint

```typescript
// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.NEXT_PUBLIC_APP_VERSION,
  };

  res.status(200).json(health);
}
```

#### Error Monitoring

```typescript
// lib/monitoring.ts
export const logError = (error: Error, context?: any) => {
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
  
  // Send to monitoring service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error);
  }
};
```

### Logging Configuration

```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'erp-automation' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

## 🔒 Security Considerations

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Environment Security

- **Secrets Management**: Use environment variables for sensitive data
- **API Keys**: Rotate API keys regularly
- **HTTPS**: Always use HTTPS in production
- **CORS**: Configure CORS appropriately
- **Rate Limiting**: Implement rate limiting for API endpoints

### Authentication (Future Enhancement)

```typescript
// Example authentication setup
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  providers: [
    Providers.Credentials({
      name: 'PLEX',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate against PLEX API
        return null;
      },
    }),
  ],
  session: {
    jwt: true,
  },
  callbacks: {
    async jwt(token, user) {
      return token;
    },
    async session(session, token) {
      return session;
    },
  },
});
```

## 🔧 Troubleshooting

### Common Deployment Issues

#### 1. Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### 2. Environment Variables

```bash
# Verify environment variables
npm run type-check
node -e "console.log(process.env.NODE_ENV)"
```

#### 3. Port Conflicts

```bash
# Check port usage
lsof -i :3000
# Kill process if needed
kill -9 <PID>
```

#### 4. Memory Issues

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Performance Optimization

#### 1. Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze bundle
ANALYZE=true npm run build
```

#### 2. Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

#### 3. Caching Strategy

```typescript
// Cache static assets
export async function getStaticProps() {
  return {
    props: {},
    revalidate: 3600, // Revalidate every hour
  };
}
```

### Monitoring Commands

```bash
# Check application health
curl http://localhost:3000/api/health

# Monitor logs
docker logs -f container-name

# Check resource usage
docker stats container-name
```

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)

---

**For additional support, please refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md) or create an issue in the repository.**
