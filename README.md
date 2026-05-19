# 🍽️ TableBook — Real-Time Restaurant Booking System
### BCA Final Year Project | MERN Stack + Socket.IO + Firebase

---

## 📁 PROJECT FOLDER STRUCTURE

```
restaurant-booking/
├── package.json                    ← Root: concurrently script
│
├── backend/
│   ├── server.js                   ← Entry point, Express + Socket.IO
│   ├── package.json
│   ├── .env.example                ← Copy to .env and fill in values
│   ├── config/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── restaurant.controller.js
│   │   ├── booking.controller.js
│   │   ├── user.controller.js
│   │   ├── admin.controller.js
│   │   └── menu.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js      ← JWT protect + authorize
│   │   ├── error.middleware.js     ← Global error handler
│   │   └── upload.middleware.js    ← Multer + Cloudinary
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Restaurant.model.js
│   │   ├── Booking.model.js
│   │   ├── Menu.model.js
│   │   └── Review.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── restaurant.routes.js
│   │   ├── booking.routes.js
│   │   ├── admin.routes.js
│   │   └── menu.routes.js
│   └── utils/
│       └── seeder.js               ← Seed sample data
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx                 ← Routes + Providers
        ├── index.css               ← Tailwind + custom styles
        ├── context/
        │   ├── AuthContext.jsx     ← JWT auth state
        │   └── ThemeContext.jsx    ← Dark/light mode
        ├── services/
        │   ├── api.js              ← Axios + all API functions
        │   ├── firebase.js         ← Google Auth
        │   └── socket.js           ← Socket.IO client
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx
        │   │   ├── Footer.jsx
        │   │   ├── LoadingSpinner.jsx
        │   │   └── SkeletonCard.jsx
        │   └── restaurant/
        │       ├── RestaurantCard.jsx
        │       └── BookingModal.jsx
        └── pages/
            ├── HomePage.jsx
            ├── RestaurantsPage.jsx
            ├── RestaurantDetailPage.jsx
            ├── LoginPage.jsx
            ├── SignupPage.jsx
            ├── UserDashboard.jsx
            ├── OwnerDashboard.jsx
            ├── AdminDashboard.jsx
            ├── BookingPage.jsx
            ├── FavoritesPage.jsx
            ├── ProfilePage.jsx
            └── NotFoundPage.jsx
```

---

## ⚙️ STEP-BY-STEP SETUP INSTRUCTIONS

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier)
- Firebase project with Google Auth enabled

---

### STEP 1: Clone / Download the Project

```bash
# Place the restaurant-booking folder wherever you want
cd restaurant-booking
```

---

### STEP 2: MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new **Project** and a **Cluster** (M0 Free Tier)
3. Under **Database Access** → Add a new user with password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all)
5. Click **Connect** → **Connect your application**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
7. Replace `<username>` and `<password>` with your credentials
8. Add `/restaurant_booking` at the end (your database name):
   ```
   mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/restaurant_booking?retryWrites=true&w=majority
   ```

---

### STEP 3: Cloudinary Setup (for image uploads)

1. Go to https://cloudinary.com and create a free account
2. From the **Dashboard**, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. You'll paste these into the backend `.env` file

---

### STEP 4: Firebase Google Auth Setup

1. Go to https://console.firebase.google.com
2. Create a new project (or use an existing one)
3. Click **Add app** → choose **Web** (</>) → register the app
4. Copy the `firebaseConfig` object values
5. In the left sidebar → **Authentication** → **Sign-in method**
6. Enable **Google** as a sign-in provider
7. Add your domain (e.g., `localhost`) to **Authorized domains**

---

### STEP 5: Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxx.mongodb.net/restaurant_booking?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_random_64_char_string_in_production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

---

### STEP 6: Configure Frontend Environment

```bash
cd ../frontend
cp .env.example .env
```

Open `.env` and fill in:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

---

### STEP 7: Install Dependencies

```bash
# From the root restaurant-booking folder:
cd backend && npm install
cd ../frontend && npm install
```

---

### STEP 8: Seed Sample Data

```bash
cd backend
npm run seed
```

This creates 6 sample restaurants and 3 test accounts:

| Role  | Email                    | Password    |
|-------|--------------------------|-------------|
| Admin | admin@tablebook.com      | Admin@1234  |
| Owner | owner@tablebook.com      | Owner@1234  |
| User  | user@tablebook.com       | User@1234   |

---

### STEP 9: Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

Or use the root concurrently script:
```bash
# From root folder (install concurrently first):
npm install
npm run dev
```

Open **http://localhost:5173** in your browser ✅

---

## 🔗 API ENDPOINTS REFERENCE

### Auth
| Method | Endpoint              | Description          | Access  |
|--------|-----------------------|----------------------|---------|
| POST   | /api/auth/register    | Register user        | Public  |
| POST   | /api/auth/login       | Login user           | Public  |
| POST   | /api/auth/google      | Google sign-in       | Public  |
| GET    | /api/auth/me          | Get current user     | Private |
| PUT    | /api/auth/updatepassword | Change password   | Private |

### Restaurants
| Method | Endpoint                         | Description              | Access       |
|--------|----------------------------------|--------------------------|--------------|
| GET    | /api/restaurants                 | List with filters        | Public       |
| GET    | /api/restaurants/featured        | Featured restaurants     | Public       |
| GET    | /api/restaurants/:id             | Restaurant details       | Public       |
| GET    | /api/restaurants/:id/availability| Check table availability | Public       |
| GET    | /api/restaurants/owner/my        | Owner's restaurants      | Owner/Admin  |
| POST   | /api/restaurants                 | Create restaurant        | Owner/Admin  |
| PUT    | /api/restaurants/:id             | Update restaurant        | Owner/Admin  |
| DELETE | /api/restaurants/:id             | Delete restaurant        | Owner/Admin  |
| POST   | /api/restaurants/:id/reviews     | Add review               | User         |

### Bookings
| Method | Endpoint                           | Description            | Access       |
|--------|------------------------------------|------------------------|--------------|
| POST   | /api/bookings                      | Create booking         | Private      |
| GET    | /api/bookings/my                   | User's bookings        | Private      |
| GET    | /api/bookings/stats                | Booking stats          | Owner/Admin  |
| GET    | /api/bookings/restaurant/:id       | Restaurant's bookings  | Owner/Admin  |
| GET    | /api/bookings/:id                  | Single booking         | Private      |
| PUT    | /api/bookings/:id/status           | Update status          | Owner/Admin  |
| PUT    | /api/bookings/:id/cancel           | Cancel booking         | Private      |

### Users
| Method | Endpoint                         | Description           | Access  |
|--------|----------------------------------|-----------------------|---------|
| GET    | /api/users/profile               | Get profile           | Private |
| PUT    | /api/users/profile               | Update profile        | Private |
| GET    | /api/users/favorites             | Get favorites         | Private |
| POST   | /api/users/favorites/:id         | Toggle favorite       | Private |

### Admin
| Method | Endpoint                           | Description           | Access |
|--------|------------------------------------|-----------------------|--------|
| GET    | /api/admin/stats                   | Platform stats        | Admin  |
| GET    | /api/admin/users                   | All users             | Admin  |
| PUT    | /api/admin/users/:id               | Update user           | Admin  |
| DELETE | /api/admin/users/:id               | Delete user           | Admin  |
| GET    | /api/admin/restaurants             | All restaurants       | Admin  |
| PUT    | /api/admin/restaurants/:id/approve | Approve restaurant    | Admin  |
| DELETE | /api/admin/restaurants/:id         | Delete restaurant     | Admin  |

---

## 🌐 DEPLOYMENT GUIDE

### Deploy Backend to Render.com (Free)

1. Push your code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo, select the **backend** folder as root directory
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add all environment variables from `.env` in the Render dashboard
6. Copy the deployed URL (e.g., `https://tablebook-api.onrender.com`)

### Deploy Frontend to Vercel (Free)

1. Go to https://vercel.com → New Project
2. Import GitHub repo, select the **frontend** folder as root directory
3. Framework: **Vite**
4. Add environment variables:
   ```
   VITE_API_URL=https://tablebook-api.onrender.com/api
   VITE_SOCKET_URL=https://tablebook-api.onrender.com
   VITE_FIREBASE_API_KEY=...
   (all other Firebase vars)
   ```
5. Deploy!

### Update Frontend after Backend Deployment

In `frontend/.env`, update:
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

In `backend/.env`, update:
```env
CLIENT_URL=https://your-frontend.vercel.app
```

---

## ✨ TECH STACK SUMMARY

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend     | Node.js, Express.js                       |
| Database    | MongoDB Atlas, Mongoose ODM               |
| Auth        | JWT, Bcrypt, Firebase Google Auth         |
| Real-Time   | Socket.IO (table availability + notifications) |
| File Upload | Multer + Cloudinary                       |
| State       | Context API (Auth + Theme)                |
| HTTP Client | Axios with interceptors                   |
| Routing     | React Router DOM v6                       |

---

## 🎯 FEATURES CHECKLIST

- ✅ Email/password signup & login
- ✅ Google Sign-In (Firebase)
- ✅ JWT authentication with persistent login
- ✅ Role-based access control (User / Owner / Admin)
- ✅ Browse & search restaurants with filters
- ✅ Real-time table availability check (Socket.IO)
- ✅ Complete booking flow with confirmation code
- ✅ Booking history with cancel option
- ✅ Owner dashboard with booking management
- ✅ Admin dashboard with full platform control
- ✅ Restaurant approval workflow
- ✅ Image upload via Cloudinary
- ✅ Favorites system
- ✅ Review system
- ✅ Menu management
- ✅ Dark / Light mode
- ✅ Fully responsive design (mobile / tablet / desktop)
- ✅ Skeleton loading states
- ✅ Toast notifications
- ✅ Protected routes by role
- ✅ Global error handling

---

*Built with ❤️ as a BCA Final Year Project*
