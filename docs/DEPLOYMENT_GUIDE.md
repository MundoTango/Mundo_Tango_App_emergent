# ESA LIFE CEO 61x21 - Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Service Configuration](#service-configuration)
6. [Monitoring Setup](#monitoring-setup)
7. [Scaling Guidelines](#scaling-guidelines)
8. [Backup Procedures](#backup-procedures)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **OS:** Ubuntu 22.04 LTS or similar
- **Node.js:** v20.x or higher
- **npm:** v10.x or higher
- **PostgreSQL:** v14 or higher
- **Redis:** v7 or higher
- **nginx:** v1.18 or higher
- **PM2:** Latest version
- **Git:** v2.x or higher

### Hardware Requirements
- **Minimum:**
  - 4 CPU cores
  - 8GB RAM
  - 100GB SSD storage
  - 100Mbps network

- **Recommended:**
  - 8 CPU cores
  - 16GB RAM
  - 500GB SSD storage
  - 1Gbps network

### Required Services
- PostgreSQL database
- Redis cache
- Supabase account
- Stripe account
- SendGrid/Resend account
- Cloudinary account
- SSL certificate

---

## Environment Setup

### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y build-essential git curl wget nginx certbot python3-certbot-nginx

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. User Setup
```bash
# Create application user
sudo adduser --system --group mundotango

# Create application directory
sudo mkdir -p /var/www/mundotango
sudo chown -R mundotango:mundotango /var/www/mundotango

# Create log directory
sudo mkdir -p /var/log/mundotango
sudo chown -R mundotango:mundotango /var/log/mundotango
```

### 3. Clone Repository
```bash
# Switch to app user
sudo su - mundotango

# Clone repository
cd /var/www/mundotango
git clone https://github.com/your-org/mundotango.git .
git checkout main

# Copy environment file
cp .env.production.example .env.production
# Edit .env.production with your values
nano .env.production
```

---

## Database Setup

### 1. PostgreSQL Configuration
```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE USER mundotango WITH PASSWORD 'secure_password';
CREATE DATABASE mundotango_prod OWNER mundotango;
GRANT ALL PRIVILEGES ON DATABASE mundotango_prod TO mundotango;

# Enable extensions
\c mundotango_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
\q
```

### 2. Database Optimization
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf

# Recommended settings for 16GB RAM:
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 10MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_parallel_maintenance_workers = 4

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Run Migrations
```bash
cd /var/www/mundotango
npm run db:push
```

---

## Application Deployment

### 1. Install Dependencies
```bash
# Install production dependencies
NODE_ENV=production npm ci --production=false

# Build application
NODE_ENV=production npm run build

# Remove dev dependencies
npm prune --production
```

### 2. PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'mundotango',
    script: './server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/mundotango/error.log',
    out_file: '/var/log/mundotango/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 10000,
    kill_timeout: 5000
  }]
};
```

### 3. Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 startup script
pm2 startup systemd
# Follow the instructions provided
```

---

## Service Configuration

### 1. Nginx Configuration
Create `/etc/nginx/sites-available/mundotango`:
```nginx
upstream mundotango_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name mundotango.life www.mundotango.life;
    
    # Force HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mundotango.life www.mundotango.life;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mundotango.life/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mundotango.life/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /var/log/nginx/mundotango_access.log;
    error_log /var/log/nginx/mundotango_error.log;
    
    # Client body size for uploads
    client_max_body_size 100M;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://mundotango_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API routes
    location /api {
        proxy_pass http://mundotango_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        # Disable buffering for SSE
        proxy_buffering off;
        proxy_cache off;
    }
    
    # Health checks
    location /health {
        proxy_pass http://mundotango_backend;
        access_log off;
    }
    
    # Static files with caching
    location / {
        proxy_pass http://mundotango_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://mundotango_backend;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml application/atom+xml image/svg+xml text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype;
}
```

### 2. Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mundotango /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 3. SSL Certificate
```bash
# Obtain SSL certificate
sudo certbot --nginx -d mundotango.life -d www.mundotango.life

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## Monitoring Setup

### 1. PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Process list
pm2 list

# Process details
pm2 show mundotango
```

### 2. System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/mundotango
```

Add to logrotate config:
```
/var/log/mundotango/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 mundotango mundotango
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Health Monitoring Script
Create `/usr/local/bin/health-check.sh`:
```bash
#!/bin/bash

HEALTH_URL="http://localhost:5000/health"
SLACK_WEBHOOK="YOUR_SLACK_WEBHOOK_URL"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response -ne 200 ]; then
    curl -X POST $SLACK_WEBHOOK \
        -H 'Content-Type: application/json' \
        -d '{"text":"⚠️ MundoTango health check failed! Status: '$response'"}'
fi
```

Add to crontab:
```bash
# Check health every 5 minutes
*/5 * * * * /usr/local/bin/health-check.sh
```

---

## Scaling Guidelines

### Horizontal Scaling
1. **Load Balancer Setup**
   - Use HAProxy or nginx for load balancing
   - Configure sticky sessions for WebSocket
   - Health check endpoints for each instance

2. **Database Scaling**
   - Read replicas for read-heavy operations
   - Connection pooling with pgBouncer
   - Query optimization and indexing

3. **Redis Clustering**
   - Redis Sentinel for high availability
   - Redis Cluster for sharding
   - Separate cache and session stores

### Vertical Scaling
1. **Resource Monitoring**
   ```bash
   # CPU usage
   top -b -n 1 | grep "Cpu(s)"
   
   # Memory usage
   free -h
   
   # Disk usage
   df -h
   
   # Network usage
   iftop
   ```

2. **Scaling Triggers**
   - CPU usage > 80% sustained
   - Memory usage > 85%
   - Response time > 500ms p95
   - Queue depth > 100

### CDN Configuration
1. **CloudFlare Setup**
   - DNS proxying enabled
   - Page rules for caching
   - Firewall rules for security
   - DDoS protection

2. **Asset Optimization**
   - Image optimization
   - Brotli compression
   - HTTP/2 push
   - Resource hints

---

## Backup Procedures

### 1. Database Backup
```bash
#!/bin/bash
# Create backup script: /usr/local/bin/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/postgresql"
DB_NAME="mundotango_prod"

# Create backup
pg_dump -U mundotango -h localhost $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://mundotango-backups/db/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 2. File Backup
```bash
#!/bin/bash
# Create backup script: /usr/local/bin/backup-files.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/files"
APP_DIR="/var/www/mundotango"

# Create backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz $APP_DIR/uploads $APP_DIR/.env.production

# Upload to S3
aws s3 cp $BACKUP_DIR/files_$DATE.tar.gz s3://mundotango-backups/files/

# Clean old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### 3. Automated Backups
```bash
# Add to crontab
0 3 * * * /usr/local/bin/backup-db.sh
0 4 * * * /usr/local/bin/backup-files.sh
```

### 4. Restore Procedures
```bash
# Database restore
gunzip < backup.sql.gz | psql -U mundotango -d mundotango_prod

# Files restore
tar -xzf files_backup.tar.gz -C /
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs --lines 100

# Check port availability
sudo lsof -i :5000

# Check environment variables
pm2 env 0
```

#### Database Connection Issues
```bash
# Test connection
psql -U mundotango -d mundotango_prod -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# Check connections
SELECT * FROM pg_stat_activity;
```

#### High Memory Usage
```bash
# Check memory
pm2 monit

# Restart with memory limit
pm2 restart mundotango --max-memory-restart 1G

# Check for memory leaks
node --expose-gc --inspect server/index.js
```

#### Slow Performance
```bash
# Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# Check Redis
redis-cli ping

# Check nginx
nginx -t
sudo systemctl status nginx
```

### Emergency Procedures

#### Rollback Deployment
```bash
# Stop current version
pm2 stop mundotango

# Checkout previous version
git checkout [previous-tag]

# Reinstall dependencies
npm ci --production

# Restart application
pm2 start ecosystem.config.js
```

#### Emergency Maintenance Mode
```bash
# Create maintenance page
echo "Under Maintenance" > /var/www/maintenance.html

# Update nginx config to serve maintenance page
# Then reload nginx
sudo systemctl reload nginx
```

---

## Security Checklist

- [ ] All environment variables secured
- [ ] Database passwords strong and unique
- [ ] SSL certificates valid and auto-renewing
- [ ] Firewall rules configured
- [ ] SSH key-only authentication
- [ ] Regular security updates applied
- [ ] Application logs not exposing sensitive data
- [ ] Rate limiting configured
- [ ] DDoS protection enabled
- [ ] Regular security audits scheduled

---

## Support Contacts

- **Technical Issues:** tech-support@mundotango.life
- **Security Issues:** security@mundotango.life
- **Infrastructure:** devops@mundotango.life
- **Emergency Hotline:** +1-XXX-XXX-XXXX

---

**Document Version:** 1.0.0  
**Last Updated:** September 14, 2025  
**Next Review:** Quarterly