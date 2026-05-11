# Nursing Charting MERN Application - Setup & Run Guide

## Overview
This is a MERN (MongoDB, Express, React, Node.js) based nursing charting application inspired by EPIC. It features:
- User authentication (login/registration)
- Course/Department selection
- Patient selection
- Multi-tab patient dashboard with:
  - Summary information
  - Chart Review/Encounters
  - Lab Results
  - Medication Administration Record (MAR)
  - Flowsheets (vital signs & assessments)
  - Intake & Output tracking
  - Clinical Notes
  - Patient Orders

**Key Feature:** Data is stored in local JSON files on your computer (file-based storage) instead of MongoDB, making it perfect for educational and standalone use.

---

## Project Structure
```
nursing-project-mern/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Main pages (Login, CourseSelection, PatientList, Dashboard)
│   │   ├── components/     # Reusable components (Tab components)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand state management
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── styles/         # CSS modules
│   │   └── App.tsx         # Main app routing
│   └── package.json
│
├── server/                 # Node/Express backend
│   ├── src/
│   │   ├── models/         # File-based data models
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Business logic
│   │   ├── utils/          # Utilities (fileDb, jwt, auth)
│   │   └── index.ts        # Entry point
│   ├── data/               # JSON data files (auto-created)
│   └── package.json
│
└── README.md
```

---

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

---

## Installation

### 1. Install Server Dependencies
```bash
cd nursing-project-mern/server
npm install
```

### 2. Install Client Dependencies
```bash
cd ../client
npm install
```

---

## Configuration

### Server (.env)
Create a `.env` file in the `server/` directory:
```
PORT=8080
JWT_SECRET=your-secret-key-change-in-production
```

### Client (.env)
Create a `.env` file in the `client/` directory:
```
REACT_APP_BACKEND_URL=http://localhost:8080
```

---

## Running the Application

### Option 1: Run Both Servers in Separate Terminals (Recommended)

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm run dev
```
You should see:
```
⏳ Initializing file-based storage
✅ File storage initialized
✅ Account database initialized (empty)
Initializing default courses...
Initializing default patients...
✅ Server is listening on port: 8080
```

**Terminal 2 - Start Frontend Server:**
```bash
cd client
npm run dev
```
The app will automatically open at http://localhost:3000

### Option 2: Build and Run Production Version

**Build Backend:**
```bash
cd server
npm run build
npm start
```

**Build Frontend:**
```bash
cd client
npm run build
npm start  # Requires 'serve' package
```

---

## Usage Guide

### 1. **Authentication (Login/Register)**
- Click on the User ID and Password fields
- For first-time use, you can register a new account
- Credentials are hashed and stored in `server/data/accounts.json`

### 2. **Select Course/Department**
- After login, you'll see three available courses:
  - Adult Health Nursing (NURS201)
  - Pediatric Nursing (NURS202)
  - Critical Care Nursing (NURS301)
- Select a course and click "Continue"

### 3. **Select Patient**
- View all patients for the selected course
- Click on a patient card to select them
- You can see patient info, diagnoses, and allergies at a glance

### 4. **Access Patient Dashboard**
Once a patient is selected, you'll have access to:

- **Summary Tab**: Overview of patient demographics, allergies, diagnoses, and current medications
- **Chart Review Tab**: Patient encounter and clinical notes (ready for expansion)
- **Results Tab**: Lab results and diagnostic results (ready for expansion)
- **MAR Tab**: Medication administration documentation (ready for expansion)
- **Flowsheets Tab**: Vital signs and assessments (ready for expansion)
- **I&O Tab**: Intake and output documentation (ready for expansion)
- **Notes Tab**: Clinical notes and nursing documentation (ready for expansion)
- **Orders Tab**: Patient orders by type (ready for expansion)

### 5. **Navigation**
- Use "Change Patient" button to go back to patient list
- Use "Logout" button to exit and return to login

---

## Data Storage

All data is stored in local JSON files in `server/data/`:
- `accounts.json` - User accounts (with hashed passwords)
- `courses.json` - Courses/departments
- `patients.json` - Patient information

These files are created automatically on first run. You can view and manually edit them for testing.

---

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/login` - Validate token and get account info

### Courses
- `GET /courses` - List all courses
- `GET /courses/:id` - Get course by ID

### Patients
- `GET /patients` - List all patients
- `GET /patients/course/:courseId` - Get patients for a course
- `GET /patients/:id` - Get specific patient

---

## Extending the Application

The application is built with modularity in mind. To add new features:

### Adding New Tabs
1. Create a new component in `client/src/components/tabs/`
2. Add it to the tabs array in `DashboardPage.tsx`

### Adding New Data Models
1. Create a model file in `server/src/models/FileBasedXXX.ts`
2. Create routes in `server/src/routes/xxx.ts`
3. Import and use in `index.ts`

### Adding Documentation Features
1. Create new data structures in the backend
2. Create corresponding form components in the frontend
3. Connect via API endpoints

---

## Troubleshooting

### Port Already in Use
If port 8080 is already in use:
```bash
# Kill the process using port 8080
# On Windows: taskkill /PID <PID> /F
# On macOS/Linux: kill -9 <PID>
```
Or change the PORT in `.env`

### CORS Errors
Ensure the frontend `.env` has the correct backend URL:
```
REACT_APP_BACKEND_URL=http://localhost:8080
```

### Authentication Fails
- Check that `server/data/accounts.json` exists
- Verify passwords are being hashed properly
- Check server logs for errors

### Data Not Loading
- Ensure both servers are running
- Check that data files exist in `server/data/`
- Clear browser cache and refresh

---

## Features Ready for Enhancement

The following sections are scaffolded and ready for you to implement:

1. **Chart Review** - Add integration for encounter notes and clinical summaries
2. **Results** - Connect lab results, imaging, and diagnostic data
3. **MAR** - Implement medication administration tracking and timestamps
4. **Flowsheets** - Add vital signs monitoring and nursing assessments
5. **I&O** - Build intake/output tracking interface
6. **Notes** - Implement clinical note editor with templates
7. **Orders** - Create order management system by type

---

## Technology Stack

- **Frontend:**
  - React 19
  - TypeScript
  - Material-UI (MUI) - Modern UI component library
  - Zustand - Lightweight state management
  - Axios - HTTP client

- **Backend:**
  - Node.js with TypeScript
  - Express - Web framework
  - JWT - Authentication
  - bcryptjs - Password hashing
  - File-based storage (JSON)

---

## Notes

- This is an educational project designed for teaching nursing informatics
- Data persists in local JSON files - perfect for development/testing
- For production use, integrate with a proper database (MongoDB, PostgreSQL, etc.)
- All passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens expire after 12 hours by default

---

## Support

For issues, questions, or feature requests, please refer to the codebase structure above. The application is fully modular and ready to extend!

Happy coding! 🏥
