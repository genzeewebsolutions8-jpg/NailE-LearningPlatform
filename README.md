<<<<<<< HEAD
# NailE-LearningPlatform
=======
# NailE Learning Platform

A beautiful nail art e-learning platform with user authentication, admin dashboard, and tutor management.

## Features

- ✨ User Registration & Login
- 👥 Role-based access (User, Admin, Tutor)
- 📊 User Dashboard for students
- 👑 Admin Dashboard for platform management
- 👨‍🏫 Tutor Registration (Admin only)
- 💅 Beautiful, feminine UI design
- 🔐 JWT-based authentication
- 📱 Fully responsive design

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Axios
- CSS3 (Custom girly theme)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd NailE-LearningPlatform-main
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Setup Environment Variables**

Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017/naile-platform
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

5. **Start MongoDB**
Make sure MongoDB is running on your system or update the MONGODB_URI in `.env` with your MongoDB Atlas connection string.

6. **Start Backend Server**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:3000`

7. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

## Creating an Admin User

**Quick Setup (Once MongoDB is running):**
```bash
cd backend
npm run create-admin
```

This creates an admin user with:
- Email: `admin@naile.com`
- Password: `admin123`

**For detailed instructions and alternative methods, see [ADMIN_SETUP.md](./ADMIN_SETUP.md)**

## User Roles

- **User**: Regular students who can register themselves and access courses
- **Admin**: Platform administrators who can register tutors and manage the platform
- **Tutor**: Instructors who are registered by admins (cannot self-register)

## Routes

### Public Routes
- `/register` - User registration page
- `/login` - Login page

### Protected Routes
- `/dashboard` - User dashboard (requires authentication)
- `/admin/dashboard` - Admin dashboard (requires admin role)
- `/admin/register-tutor` - Tutor registration page (requires admin role)

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/register-tutor` - Register a tutor (admin only)
- `GET /api/tutors` - Get all tutors (admin only)

## Project Structure

```
NailE-LearningPlatform-main/
├── backend/
│   ├── models/
│   │   └── User.js          # User model
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── index.js             # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Register.jsx        # User registration
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Dashboard.jsx       # User dashboard
│   │   │   ├── AdminDashboard.jsx  # Admin dashboard
│   │   │   └── RegisterTutor.jsx   # Tutor registration
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication context
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx  # Route protection
│   │   └── App.jsx                 # Main app component
│   └── package.json
└── README.md
```

## Design Philosophy

The platform features a feminine, elegant design with:
- Soft pink gradients (#ff69b4, #ffe4e6, #fff0f5)
- Smooth animations and transitions
- Glassmorphism effects
- Responsive grid layouts
- Beautiful card-based UI components

## Future Enhancements

- Course management system
- Video streaming for lessons
- Live session integration
- Payment gateway
- Certificate generation
- Student progress tracking
- Tutor dashboard

## License

ISC
>>>>>>> d050c08 (Update for frontend of login and signup for Admin, Tutor and End User without database)
