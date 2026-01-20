# How to Access Admin Dashboard

## Method 1: Using the Admin Creation Script (Recommended)

### Step 1: Start MongoDB
Make sure MongoDB is running on your system:

**On macOS (using Homebrew):**
```bash
brew services start mongodb-community
# or
mongod --config /usr/local/etc/mongod.conf
```

**On Windows:**
```bash
net start MongoDB
```

**Or use MongoDB Atlas (Cloud):**
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `.env` file in backend folder:
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   ```

### Step 2: Create Admin User
Once MongoDB is running, execute:
```bash
cd backend
npm run create-admin
```

This will create an admin user with:
- **Email:** `admin@naile.com`
- **Password:** `admin123`

### Step 3: Login to Admin Dashboard
1. Go to `http://localhost:5173/login`
2. Login with:
   - Email: `admin@naile.com`
   - Password: `admin123`
3. You'll be automatically redirected to `/admin/dashboard`

---

## Method 2: Manually Create Admin (Using Registration + MongoDB)

### Step 1: Register a Regular User
1. Go to `http://localhost:5173/register`
2. Register with any email and password
3. Note the email you used

### Step 2: Update User Role in MongoDB

**Option A: Using MongoDB Compass (GUI)**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `naile-platform` database → `users` collection
4. Find the user you just registered
5. Edit the document and change `role` from `"user"` to `"admin"`
6. Save the changes

**Option B: Using MongoDB Shell**
```bash
mongo
use naile-platform
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

**Option C: Using a simple Node.js script**
Create a file `updateToAdmin.js` in backend folder:
```javascript
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateToAdmin() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/naile-platform');
  
  const email = process.argv[2]; // Pass email as argument
  if (!email) {
    console.log('Usage: node updateToAdmin.js <email>');
    process.exit(1);
  }
  
  const user = await User.findOneAndUpdate(
    { email: email },
    { role: 'admin' },
    { new: true }
  );
  
  if (user) {
    console.log(`✅ User ${email} is now an admin!`);
  } else {
    console.log(`❌ User with email ${email} not found.`);
  }
  
  process.exit(0);
}

updateToAdmin();
```

Then run:
```bash
node updateToAdmin.js your-email@example.com
```

### Step 3: Login
1. Go to `http://localhost:5173/login`
2. Login with the email you registered
3. You'll be redirected to `/admin/dashboard`

---

## Method 3: Create Admin via Backend API (Temporary Endpoint)

You can temporarily add this endpoint to `backend/index.js` for initial setup:

```javascript
// Temporary endpoint to create first admin (remove after use!)
app.post('/api/setup/create-admin', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const admin = new User({
      firstName: firstName || 'Admin',
      lastName: lastName || 'User',
      email: email || 'admin@naile.com',
      password: password || 'admin123',
      phone: phone || '+1234567890',
      role: 'admin'
    });
    
    await admin.save();
    res.json({ message: 'Admin created successfully', email: admin.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

Then use Postman or curl:
```bash
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@naile.com","password":"admin123","firstName":"Admin","lastName":"User"}'
```

**⚠️ Important:** Remove this endpoint after creating your admin for security!

---

## Accessing Admin Dashboard

Once you have an admin account:

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend server:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Navigate to login page:**
   - Go to `http://localhost:5173/login`

4. **Login with admin credentials:**
   - Enter admin email and password
   - Click "Sign In"

5. **You'll be automatically redirected to:**
   - `http://localhost:5173/admin/dashboard`

---

## Admin Dashboard Features

From the admin dashboard, you can:
- 👥 View all registered tutors
- ➕ Register new tutors (click "Register Tutor" or "Add New Tutor")
- 📊 View platform statistics
- 🔑 Manage user access

---

## Troubleshooting

**Problem:** Can't connect to MongoDB
- **Solution:** Make sure MongoDB is running or update `.env` with MongoDB Atlas connection string

**Problem:** "Admin already exists" error
- **Solution:** Use the existing admin credentials or update an existing user's role to "admin"

**Problem:** Redirected to user dashboard instead of admin dashboard
- **Solution:** Verify the user's role is set to "admin" in the database

