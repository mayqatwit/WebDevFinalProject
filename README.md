# KitchenSync - Sharable Cookbook Service

KitchenSync is a web-based sharable cookbook application that allows users to create cookbooks, share them with others, and manage recipes collaboratively.

## Prerequisites

Before setting up KitchenSync, ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **MySQL** (version 5.7 or higher)
- **Git** (for cloning the repository)

## First Time Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mayqatwit/WebDevFinalProject.git
cd kitchensync
```

### 2. Set Up MySQL Database

#### 2.1 Start MySQL Service
Make sure your MySQL service is running:

**Windows:**
```bash
net start mysql
```

**macOS:**
```bash
brew services start mysql
# or
sudo /usr/local/mysql/support-files/mysql.server start
```

**Linux:**
```bash
sudo systemctl start mysql
# or
sudo service mysql start
```

#### 2.2 Create Database User and Database
Connect to MySQL as root and run the following commands:

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create the database
CREATE DATABASE IF NOT EXISTS KitchenSync;

-- Create the application user
CREATE USER 'kitchensync_user'@'localhost' IDENTIFIED BY 'kitchensync_password';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON KitchenSync.* TO 'kitchensync_user'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

#### 2.3 Set Up Database Schema
Run the database schema script:

```bash
mysql -u kitchensync_user -p KitchenSync < backend/database.sql
```

When prompted, enter the password: `kitchensync_password`

### 3. Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 4. Create a Test User (Optional)

To create a test user for initial testing:

```bash
node setup-test-user.js
```

This creates a user with:
- Username: `testuser`
- Email: `test@example.com`
- Password: `password123`

## Running the Application

### Every Time Setup (After First Time)

#### 1. Start MySQL Service
Ensure MySQL is running (see commands in First Time Setup section 2.1)

#### 2. Start the Backend Server

```bash
cd backend
node app.js
```

You should see: `Server running at http://localhost:3000`

#### 3. Start Frontend Server

Open your terminal and navigate to:
```
cd /path/to/your/project/frontend/
http-server -p 8080
```

#### 4. Open Page

In your browser, go to the link 
```
http://localhost:8080/login.html
```

## Usage

### Creating an Account
1. Open the application in your browser
2. Click "Sign Up" or use the mobile toggle
3. Fill in Name, Username, and Password
4. Click "Sign Up"
5. Switch to "Sign In" and log in with your credentials

### Using the Test User
If you created the test user, you can log in with:
- Username: `testuser`
- Password: `password123`



This project is for educational purposes. Please add appropriate licensing for production use.
