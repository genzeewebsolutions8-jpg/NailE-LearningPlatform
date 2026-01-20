# MongoDB Setup Guide

## The Error You're Seeing

The error `Operation buffering timed out after 10000ms` means MongoDB is not connected or not running.

## Solution Options

### Option 1: Use MongoDB Atlas (Cloud - Recommended)

1. **Create a free MongoDB Atlas account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create a cluster:**
   - Click "Build a Database"
   - Choose FREE (M0) tier
   - Select a cloud provider and region
   - Click "Create"

3. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

4. **Update your `.env` file:**
   ```bash
   cd backend
   # Create .env file if it doesn't exist
   ```
   
   Add this line to `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/naile-platform?retryWrites=true&w=majority
   ```
   
   **Important:** Replace `username` and `password` with your MongoDB Atlas credentials!

5. **Restart your backend server**

### Option 2: Install and Run Local MongoDB

#### On macOS:
```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or run manually
mongod --config /opt/homebrew/etc/mongod.conf
```

#### On Windows:
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service:
   ```bash
   net start MongoDB
   ```

#### On Linux (Ubuntu/Debian):
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 3: Use Docker

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Verify MongoDB is Running

After starting MongoDB, verify it's working:

```bash
# Try connecting with MongoDB shell
mongosh

# Or check if MongoDB is listening on port 27017
# macOS/Linux:
lsof -i :27017

# Windows:
netstat -an | findstr 27017
```

## Test Your Connection

Once MongoDB is running, restart your backend:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
✅ Pre-configured admin created successfully!
   Email: hetthakkar544@gmail.com
```

## Troubleshooting

### Still getting connection errors?

1. **Check if MongoDB is actually running:**
   - Local: Check if `mongod` process is running
   - Atlas: Verify your connection string is correct

2. **Check your firewall:**
   - Make sure port 27017 is open (for local MongoDB)
   - For Atlas, check your IP whitelist in Atlas dashboard

3. **Verify `.env` file:**
   - Make sure `.env` is in the `backend` folder
   - Make sure the connection string is correct
   - No quotes around the connection string

4. **Check MongoDB logs:**
   - Local MongoDB logs usually in `/var/log/mongodb/` or `~/mongodb/`

## Admin Credentials (Once MongoDB is Connected)

After MongoDB connects successfully, the admin will be automatically created with:

- **Email:** `hetthakkar544@gmail.com`
- **Password:** `Het@1234`

You can then login to the admin dashboard using these credentials!

