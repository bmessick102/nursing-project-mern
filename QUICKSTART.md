# Quick Start Guide - Nursing Charting Application

## ⚡ Get Running in 5 Minutes

### Step 1: Open Two Terminals

### Terminal 1 - Backend Server
```bash
cd "c:\Users\messi\OneDrive\Desktop\Nursing Charting Project\nursing-project-mern\server"
npm install  # First time only
npm run dev
```

You should see:
```
✅ File storage initialized
✅ Account database initialized (empty)
Initializing default courses...
Initializing default patients...
✅ Server is listening on port: 8080
```

### Terminal 2 - Frontend Server
```bash
cd "c:\Users\messi\OneDrive\Desktop\Nursing Charting Project\nursing-project-mern\client"
npm install  # First time only
npm run dev
```

The app will automatically open at **http://localhost:3000**

---

## 🎯 First-Time Usage

### 1. Register Account
- Enter a username (e.g., "student1")
- Enter a password (e.g., "password123")
- Click "Log In" to register and login

### 2. Select Course
- Choose one of the three available courses:
  - Adult Health Nursing
  - Pediatric Nursing
  - Critical Care Nursing
- Click "Continue"

### 3. Select Patient
- Choose a patient from the list
- Patient cards show their info, diagnoses, and allergies

### 4. View Dashboard
- You're now in the patient dashboard!
- 8 tabs available for different views
- The **Summary** tab shows:
  - Patient demographics
  - Allergies (in red)
  - Active diagnoses
  - Current medications

### 5. Navigate
- **Change Patient**: Go back to patient list
- **Logout**: Return to login

---

## 📋 Default Test Data

### Courses (Auto-loaded)
- NURS201: Adult Health Nursing
- NURS202: Pediatric Nursing
- NURS301: Critical Care Nursing

### Patients (Auto-loaded)
- John Smith (Adult Health, Room 301)
- Sarah Johnson (Pediatric, Room 302)
- Michael Chen (Critical Care, Room 201)

---

## ❌ Troubleshooting

### Port Already in Use
If you get "Address already in use" error:
- Close any existing servers on port 8080
- Or edit `server/.env` and change PORT to 8081

### Can't Connect to Backend
- Make sure both servers are running
- Check that backend is on http://localhost:8080
- Check client `.env` has correct BACKEND_URL

### Blank Login Page
- Wait for both servers to fully start
- Refresh the browser (Ctrl+R or Cmd+R)
- Check browser console for errors (F12)

### Can't Login
- Make sure you're registering (not logging in with non-existent credentials)
- Or register a new account first

---

## 🔄 Restart Instructions

**To restart the application:**

1. Stop both servers (Ctrl+C in both terminals)
2. Restart Terminal 1: `npm run dev` (in server folder)
3. Restart Terminal 2: `npm run dev` (in client folder)
4. Refresh browser at http://localhost:3000

---

## 📚 For More Details

- **Setup Guide**: Read `SETUP_GUIDE.md`
- **Project Summary**: Read `PROJECT_SUMMARY.md`
- **File Structure**: Check `PROJECT_SUMMARY.md` for full file list

---

## 🎓 What You Can Do Now

✅ Login/Register users
✅ Select courses
✅ View patient lists
✅ View patient dashboards
✅ See patient summary information
✅ Switch between patients
✅ Logout

📝 **Ready to extend:**
- Add new documentation tabs
- Implement intake/output tracking
- Add vital signs monitoring
- Create nursing notes interface
- Build medication administration records

---

## 💡 Pro Tips

1. **Edit Data**: Manually edit JSON files in `server/data/` (advanced users)
2. **Add Patients**: Edit `patients.json` to add more test patients
3. **Change Courses**: Edit `courses.json` to add/modify courses
4. **Delete Users**: Delete accounts in `accounts.json` and refresh

---

## ✨ You're All Set!

Your nursing charting application is ready to use! 🏥

Need help? Refer to SETUP_GUIDE.md or PROJECT_SUMMARY.md
