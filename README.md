# Multi-Store Stock Movement

A full-stack web application for tracking products, stores, and stock levels. It supports adjusting stock levels, executing atomic transfers between stores, and role-based access control (Admin vs. Shopper).

---

## Prerequisites

Before running the application, make sure you have the following installed on your machine:

- **Node.js** (v16.x or higher recommended)
- **npm** (comes bundled with Node.js)
- **MongoDB** (running locally or a connection URI to MongoDB Atlas)

---

## Project Structure

```
├── backend/            # Express.js REST API
│   ├── src/
│   │   ├── config/     # Database configuration
│   │   ├── controllers/# Auth, Product, Store, and Stock controllers
│   │   ├── middleware/ # Auth & error handling middlewares
│   │   ├── models/     # Mongoose Schemas (User, Product, Store, StockEntry)
│   │   ├── routes/     # Express Route declarations
│   │   └── services/   # Business logic (Stock adjustment & transfers)
│   ├── .env.example
│   └── package.json
│
├── frontend/           # React + Vite client-side single page application
│   ├── src/
│   │   ├── components/ # Shared components (Navbar, Protected Routes)
│   │   ├── pages/      # Application views (Login, Register, Dashboard)
│   │   └── App.css     # UI styles
│   ├── .env.example
│   └── package.json
│
└── DESIGN.md           # Architecture design document
```

---

## Setup & Running the Application

### 1. Database Setup
Ensure MongoDB is running on your local machine (typically on `mongodb://localhost:27017`) or have a remote connection string ready.

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Verify/update the environment variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/stock-manager
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```
5. Start the backend server in development mode (using nodemon):
   ```bash
   npm run dev
   ```
   The backend server should now be running at `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` folder based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Verify the frontend environment variables in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
5. Start the frontend React server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173` (or the URL outputted by Vite).

---

## Seeding & Setting Up the Admin Account

By default, any new user registered through the frontend signup screen is assigned the `shopper` role. Read-only permissions are granted to shoppers, while write actions (creating products/stores, adjusting stock, and transferring stock) require the `admin` role.

To elevate a registered user to an **Admin**:
1. Register a new account via the **Register** page on the frontend (e.g. `admin@example.com`).
2. Connect to your MongoDB database using **MongoDB Compass** or the **Mongo Shell**.
3. Run the following command or update the document fields manually to update the user's role:
   ```javascript
   use stock-manager;
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   );
   ```
4. Log out and sign back in with that account. The admin tabs (Adjust Stock, Transfer Stock, Create Product, Create Store) will now be visible and authorized.

---

## Running Tests

No automated test suite is configured for this project yet. If added in the future, tests can be configured under the test script:
```bash
# In either backend or frontend directory
npm run test
```

---

## Assumptions & Trade-offs

1. **Standalone MongoDB Compatibility**:
   Many enterprise-level transactions require replica sets or cluster setup in MongoDB to use native multi-document transactions. To support run-anywhere standalone local MongoDB servers easily, the app uses an **application-level compensation (rollback) pattern** for transfers. On transfer failure, the app rolls back the source store's state manually instead of aborting a database transaction.
2. **Client-Side Validations**:
   The input type for email was changed to `text` to ensure that custom client-side validation logic and error messages (checking regex patterns and fields) display correctly inside custom UI alerts rather than defaulting to native browser HTML validation tooltips.
3. **Decoupled Hashing and Database Layer**:
   Bcrypt hashing and matching logic is decoupled from Mongoose middleware hooks and kept entirely within the controller layer (`authController.js`). This ensures that database writes or schema modifications aren't implicitly performing costly hashing operations without explicit controller execution.
