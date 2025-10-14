# Project Setup Instructions

## Prerequisites
- Laragon is running
- MySQL service is started
- Apache/Nginx service is started

## Backend Setup (Laravel)

### 1. Install Dependencies
Open Laragon Terminal and run:
```bash
cd C:\laragon\www\10-11\backend
composer install
```

### 2. Create Environment File
Create a `.env` file in the backend folder with the following content:
```
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_training_system
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### 3. Generate Application Key
```bash
php artisan key:generate
```

### 4. Create Database
- Open phpMyAdmin: http://localhost/phpmyadmin
- Create a new database named: `laravel_training_system`

### 5. Run Migrations
```bash
php artisan migrate
```

### 6. Seed Database (Optional)
```bash
php artisan db:seed
```

### 7. Start Backend Server
```bash
php artisan serve
```

## Frontend Setup (React)

### 1. Install Dependencies
Open a new Laragon Terminal and run:
```bash
cd C:\laragon\www\10-11\frontend
npm install
```

### 2. Start Frontend Server
```bash
npm start
```

## Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **phpMyAdmin:** http://localhost/phpmyadmin

## Troubleshooting

### If composer is not found:
- Make sure Laragon is running
- Use Laragon Terminal (right-click on Laragon icon → Terminal)

### If npm is not found:
- Install Node.js from https://nodejs.org/
- Restart Laragon after installation

### Database Connection Issues:
- Check if MySQL service is running in Laragon
- Verify database credentials in .env file
- Make sure database exists in phpMyAdmin

## Project Structure

Your project appears to be a Training Management System with:
- User authentication
- Course management
- Dormitory management
- Certificate generation
- Payment processing
- Audit trails

The backend uses Laravel with MySQL, and the frontend uses React with Material-UI components.
