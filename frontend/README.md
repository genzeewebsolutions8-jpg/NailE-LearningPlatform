# NailE Learning Platform - Frontend

A beautiful React-based frontend for the NailE Learning Platform with a feminine, elegant design.

## Features

- ✨ Modern React application with Vite
- 💅 Beautiful, girly design with pink and pastel color scheme
- 📱 Responsive design for all devices
- 🔐 User registration with form validation
- 🎨 Smooth animations and transitions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Development Server

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Register.jsx      # Registration page component
│   │   └── Register.css      # Registration page styles
│   ├── App.jsx               # Main app component with routing
│   ├── App.css               # App-wide styles
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies and scripts
```

## Registration Form Fields

The registration page includes the following required fields:
- First Name
- Last Name
- Email Address
- Phone Number
- Password
- Confirm Password

All fields are validated with proper error messages.

## API Integration

The frontend communicates with the backend API at `http://localhost:3000`. The registration endpoint is:
- **POST** `/api/auth/register`

The Vite dev server is configured to proxy API requests automatically.

## Design Philosophy

The design features:
- Soft pink gradient backgrounds (#ffeef8, #fff0f5, #ffe4e6)
- Elegant card-based layouts with glassmorphism effects
- Smooth animations and hover effects
- Feminine typography and iconography
- Responsive grid layouts

## Next Steps

- [ ] Create Login page
- [ ] Add authentication state management
- [ ] Create dashboard/home page
- [ ] Add course browsing pages
- [ ] Implement user profile pages

