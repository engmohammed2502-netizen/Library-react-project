# Deployment Guide - Engineering Library Application
## Step-by-Step Production Deployment Instructions

**Project:** مكتبة كلية الهندسة - جامعة البحر الأحمر  
**Version:** 1.0.0  
**Target:** Linux Server (Ubuntu 20.04+ recommended)

---

## 🚀 Quick Start Deployment

### Prerequisites Checklist
- [ ] Linux server with root/sudo access
- [ ] Node.js 18.x or higher installed
- [ ] MongoDB 7.0+ installed and running
- [ ] Nginx installed
- [ ] Domain name configured (optional, can use IP)
- [ ] SSL certificate (for HTTPS - Let's Encrypt recommended)

---

## 📦 Step 1: Server Preparation (5 minutes)

### 1.1 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Required Software
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 1.3 Create Application User
```bash
sudo adduser --disabled-password --gecos "" engineering-library
sudo usermod -aG sudo engineering-library
```

### 1.4 Create Directories
```bash
sudo mkdir -p /var/www/engineering-library
sudo mkdir -p /var/www/engineering-library/server
sudo mkdir -p /var/www/engineering-library/server/uploads
sudo mkdir -p /var/www/engineering-library/server/uploads/courses
sudo mkdir -p /var/www/engineering-library/server/uploads/forum
sudo mkdir -p /var/backups/engineering-library
sudo mkdir -p /var/www/engineering-library/logs

# Set ownership
sudo chown -R engineering-library:engineering-library /var/www/engineering-library
sudo chown -R engineering-library:engineering-library /var/backups/engineering-library

# Set permissions
sudo chmod -R 755 /var/www/engineering-library
sudo chmod -R 755 /var/www/engineering-library/server/uploads
```

---

## 📥 Step 2: Upload Application (10 minutes)

### 2.1 Upload Files
**Option A: Using Git**
```bash
cd /var/www/engineering-library
sudo -u engineering-library git clone <your-repo-url> .
```

**Option B: Using SCP (from your local machine)**
```bash
# From your local machine
scp -r engineering-library-main/* engineering-library@your-server-ip:/var/www/engineering-library/
```

**Option C: Using SFTP**
- Connect via FileZilla or similar
- Upload all files to `/var/www/engineering-library/`

### 2.2 Set Ownership
```bash
sudo chown -R engineering-library:engineering-library /var/www/engineering-library
```

---

## 🔧 Step 3: Install Dependencies (5 minutes)

### 3.1 Install Server Dependencies
```bash
cd /var/www/engineering-library/server
sudo -u engineering-library npm install --production
```

**Verify installation:**
```bash
npm list --depth=0
# Should show all packages including:
# - mongoose-paginate-v2
# - joi
# - handlebars
# - moment
# - tar
# - hpp
```

### 3.2 Build Client Application
```bash
cd /var/www/engineering-library/client
sudo -u engineering-library npm install
sudo -u engineering-library npm run build
```

**Verify build:**
```bash
ls -la /var/www/engineering-library/client/build
# Should show index.html and static/ directory
```

---

## 🔐 Step 4: Configure Environment (10 minutes)

### 4.1 Generate Strong Secrets
```bash
cd /var/www/engineering-library/server

# Generate JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET" | sudo tee -a .env

# Generate SESSION_SECRET
SESSION_SECRET=$(openssl rand -base64 32)
echo "SESSION_SECRET=$SESSION_SECRET" | sudo tee -a .env

# Display secrets (save them securely!)
echo "=== SAVE THESE SECRETS SECURELY ==="
echo "JWT_SECRET: $JWT_SECRET"
echo "SESSION_SECRET: $SESSION_SECRET"
```

### 4.2 Create Production .env File
```bash
cd /var/www/engineering-library/server
sudo -u engineering-library cp .env.example .env
sudo -u engineering-library nano .env
```

**Edit the following values:**

```bash
# Application
NODE_ENV=production
PORT=9000
HOST=127.0.0.1

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/engineering_library

# Security - USE THE GENERATED VALUES FROM STEP 4.1
JWT_SECRET=<paste-generated-jwt-secret>
SESSION_SECRET=<paste-generated-session-secret>
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12

# Root Account - CHANGE THESE!
ROOT_USERNAME=zero
ROOT_PASSWORD=<strong-password-here>

# CORS - Replace with your domain or IP
CORS_ORIGIN=http://your-server-ip,https://yourdomain.com

# Web URL - Replace with your domain or IP
WEB_URL=http://your-server-ip

# File Uploads - Use absolute paths
UPLOAD_PATH=/var/www/engineering-library/server/uploads
MAX_FILE_SIZE=157286400
MAX_IMAGE_SIZE=3145728

# Backups
BACKUP_PATH=/var/backups/engineering-library
BACKUP_RETENTION_DAYS=30

# Security
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=86400000

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Other settings
TIMEZONE=Africa/Khartoum
DEFAULT_LANGUAGE=ar
PAGINATION_LIMIT=20
```

### 4.3 Secure .env File
```bash
sudo chmod 600 /var/www/engineering-library/server/.env
sudo chown engineering-library:engineering-library /var/www/engineering-library/server/.env
```

---

## 🗄️ Step 5: Database Setup (5 minutes)

### 5.1 Verify MongoDB
```bash
sudo systemctl status mongod
# Should show "active (running)"
```

### 5.2 Test Connection
```bash
mongosh mongodb://127.0.0.1:27017/engineering_library
# Type: exit
```

**Note:** Database will be created automatically on first application start.

---

## 🌐 Step 6: Configure Nginx (10 minutes)

### 6.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/engineering-library
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name your-server-ip yourdomain.com www.yourdomain.com;

    root /var/www/engineering-library/client/build;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploaded Files
    location /uploads {
        alias /var/www/engineering-library/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        location ~* \.(php|exe|sh|bat)$ {
            deny all;
        }
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss 
               application/json image/svg+xml;
}
```

**Replace `your-server-ip` and `yourdomain.com` with your actual values.**

### 6.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/engineering-library /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Optional: remove default site
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

---

## 🔒 Step 7: SSL Certificate (Optional but Recommended - 5 minutes)

### 7.1 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Follow the prompts:**
- Enter email address
- Agree to terms
- Choose redirect HTTP to HTTPS (option 2)

### 7.2 Test Auto-Renewal
```bash
sudo certbot renew --dry-run
```

---

## ⚙️ Step 8: Start Application with PM2 (5 minutes)

### 8.1 Update PM2 Config (if needed)
```bash
cd /var/www/engineering-library
sudo -u engineering-library nano ecosystem.config.js
```

**Verify:**
- Script path: `./server/server.js`
- No hardcoded secrets in env section
- Log paths are correct

### 8.2 Start Application
```bash
cd /var/www/engineering-library
sudo -u engineering-library pm2 start ecosystem.config.js
sudo -u engineering-library pm2 save
```

### 8.3 Enable PM2 on Startup
```bash
sudo -u engineering-library pm2 startup
# Copy and run the command it outputs (starts with 'sudo')
```

---

## ✅ Step 9: Testing (10 minutes)

### 9.1 Test Health Endpoint
```bash
curl http://localhost:9000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "service": "Engineering Library API",
  "database": "connected",
  "environment": "production"
}
```

### 9.2 Test Frontend
- Open browser: `http://your-server-ip` or `https://yourdomain.com`
- [ ] Frontend loads
- [ ] No console errors
- [ ] Can access login page

### 9.3 Test Authentication
- [ ] Can login with root credentials
- [ ] Redirects work correctly
- [ ] Dashboard loads

### 9.4 Test File Operations
- [ ] Can upload files (as professor/admin)
- [ ] Can download files
- [ ] Files saved correctly

---

## 🔥 Step 10: Firewall Configuration (2 minutes)

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## 📊 Step 11: Monitoring Setup (5 minutes)

### 11.1 Check Application Status
```bash
pm2 status
pm2 logs engineering-library-backend --lines 50
```

### 11.2 Set Up Log Rotation
```bash
sudo nano /etc/logrotate.d/engineering-library
```

**Add:**
```
/var/www/engineering-library/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 engineering-library engineering-library
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 🎯 Quick Verification Checklist

Run these commands to verify everything:

```bash
# 1. Check Node.js
node --version  # Should be 18.x or higher

# 2. Check MongoDB
sudo systemctl status mongod  # Should be active

# 3. Check Nginx
sudo systemctl status nginx  # Should be active
sudo nginx -t  # Should show "syntax is ok"

# 4. Check PM2
pm2 status  # Should show app as "online"

# 5. Check Application
curl http://localhost:9000/api/health  # Should return healthy status

# 6. Check Build
ls -la /var/www/engineering-library/client/build/index.html  # Should exist

# 7. Check Environment
cd /var/www/engineering-library/server
node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing')"
```

---

## 🚨 Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs engineering-library-backend --lines 100

# Check if port is in use
sudo netstat -tulpn | grep 9000

# Restart application
pm2 restart engineering-library-backend
```

### Database Connection Issues
```bash
# Check MongoDB
sudo systemctl status mongod
sudo systemctl restart mongod

# Test connection
mongosh mongodb://127.0.0.1:27017/engineering_library
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart both
pm2 restart engineering-library-backend
sudo systemctl reload nginx
```

### File Upload Issues
```bash
# Check permissions
ls -la /var/www/engineering-library/server/uploads

# Check disk space
df -h

# Fix permissions
sudo chown -R engineering-library:engineering-library /var/www/engineering-library/server/uploads
sudo chmod -R 755 /var/www/engineering-library/server/uploads
```

---

## 📝 Post-Deployment Tasks

### Daily
- [ ] Check `pm2 status`
- [ ] Review error logs: `pm2 logs --err`

### Weekly
- [ ] Review security alerts
- [ ] Check backup status
- [ ] Review application logs

### Monthly
- [ ] Update system: `sudo apt update && sudo apt upgrade`
- [ ] Test backup restore
- [ ] Review SSL certificate: `sudo certbot certificates`

---

## 🎉 Deployment Complete!

Your application should now be:
- ✅ Running on port 9000 (internal)
- ✅ Accessible via Nginx on port 80/443
- ✅ Database connected
- ✅ File uploads working
- ✅ SSL configured (if domain provided)
- ✅ PM2 managing the process
- ✅ Auto-start on server reboot

**Access your application:**
- HTTP: `http://your-server-ip`
- HTTPS: `https://yourdomain.com` (if SSL configured)

**Default Login:**
- Username: `zero`
- Password: (the one you set in .env file)

---

## 📞 Need Help?

- Check logs: `pm2 logs engineering-library-backend`
- Check Nginx: `sudo tail -f /var/log/nginx/error.log`
- Check MongoDB: `sudo tail -f /var/log/mongodb/mongod.log`
- Review: `DEPLOYMENT_CHECKLIST.md` for detailed troubleshooting

---

**Total Deployment Time:** ~60 minutes  
**Status:** ✅ Ready for Production
