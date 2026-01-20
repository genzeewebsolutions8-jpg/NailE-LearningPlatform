# Logo Setup Instructions

## How to Add Your Logo Image

1. **Save your logo image file** to this folder (`frontend/src/assets/`)

2. **Name it exactly:** `logo.png`
   
   - If your image is a different format (jpg, jpeg, svg), you can:
     - Rename it to `logo.png`, OR
     - Update the import statements in all page files to use your file extension

3. **Supported formats:**
   - `.png` (recommended - supports transparency)
   - `.jpg` or `.jpeg`
   - `.svg`

4. **If your image has a different name or extension:**
   
   Update the import statement in these files:
   - `src/pages/Home.jsx`
   - `src/pages/Login.jsx`
   - `src/pages/Register.jsx`
   - `src/pages/Dashboard.jsx`
   - `src/pages/AdminDashboard.jsx`
   - `src/pages/TutorDashboard.jsx`
   - `src/pages/RegisterTutor.jsx`
   - `src/pages/AdminSetup.jsx`
   
   Change: `import logo from '../assets/logo.png'`
   To: `import logo from '../assets/your-logo-name.ext'`

5. **Recommended image specifications:**
   - Size: 300-400px wide (height will scale automatically)
   - Format: PNG with transparent background (best quality)
   - File size: Under 500KB for fast loading

## Current Setup

The code is currently set to import `logo.png` from this assets folder. Just place your image file here with that name!

