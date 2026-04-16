# FDM Expenses — Personal Contribution

## Student Information
- **Name:** Abu Sayeed Albadry
- **Student ID:** 230332195
- **University:** Queen Mary University of London
- **GitHub:** [Abu-afk](https://github.com/Abu-afk)
- **Personal Repo:** https://github.com/Abu-afk/fdm-approve-reject
- **Group Repo:** https://github.com/ZIZO-M/FDM-Expenses

---

## My Individual Contributions

### Where to Find My Work
My commits are visible on both this repo and the shared group repo. To find my specific work:
1. Go to the **Commits** tab
2. Look for commits by **Abu-afk**
3. Key commits:
   - `Add filtering, sorting, pagination, bulk approve and summary`
   - `Remove .env from tracking and add to gitignore`
   - `Fix vite config port to 5001`
   - `Merge main into ui-updates and resolve conflicts`

---

### I Built Approve and Reject use case: I've added these features below

#### 1. Pending Claims — Filtering System
**File:** `frontend/src/pages/manager/PendingClaims.tsx`

Added a full filtering system for the manager's pending claims view:
- Search by employee name or description
- Filter by minimum and maximum amount (£)
- Filter by date range (from/to date)
- Clear all filters button

#### 2. Pending Claims — Sorting
**File:** `frontend/src/pages/manager/PendingClaims.tsx`

Added sortable columns to the pending claims table:
- Sort by employee name (A-Z / Z-A)
- Sort by submitted date (newest/oldest)
- Sort by total amount (high/low)
- Sort by status
- Visual arrows showing current sort direction (↑ ↓ ↕)

#### 3. Pending Claims — Pagination
**File:** `frontend/src/pages/manager/PendingClaims.tsx`

Added pagination to the pending claims list:
- Shows 10 claims per page
- Previous/Next buttons
- Page number buttons
- Shows "Showing X–Y of Z" count

#### 4. Bulk Approve
**File:** `frontend/src/pages/manager/PendingClaims.tsx`

Added ability to approve multiple claims at once:
- Checkbox on each claim row
- Select all checkbox in header
- Green bulk approve bar appears when claims are selected
- Shows count of selected claims
- Approves all selected claims in one click

#### 5. Claims Summary Dashboard
**File:** `frontend/src/pages/Dashboard.tsx`

Added a weekly summary card to the manager dashboard showing:
- Number of claims pending review (yellow)
- Number of claims approved this week (green)
- Number of claims rejected this week (red)
- Total monetary value of pending claims (green)
- Only visible to LINE_MANAGER and FINANCE_OFFICER roles

#### 6. Security Fix — .env Protection
**File:** `.gitignore`

Added `.env` and `backend/.env` to `.gitignore` to prevent database credentials from being exposed on GitHub.

#### 7. Test Data — Seed File
**File:** `backend/prisma/seed.ts`

Updated the seed file to include 5 realistic test claims:
- 3 pending claims (different amounts and dates)
- 1 approved claim with approval decision
- 1 rejected claim with rejection reason

---

## How to Run the Project

### Prerequisites
- Node.js
- PostgreSQL database

### Setup
```bash
# Clone the repo
git clone https://github.com/Abu-afk/fdm-approve-reject.git

# Backend setup
cd backend
npm install
# Create .env file with your database credentials:
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/fdm_expenses"
# JWT_SECRET="fdm-expenses-secret-key-2024"
# PORT=5001
npx prisma db push
npm run db:seed
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Employee | employee@fdm.com | password123 |
| Line Manager | manager@fdm.com | password123 |
| Finance Officer | finance@fdm.com | password123 |

---

## Technologies Used
- React 18 + TypeScript + Vite (Frontend)
- Node.js + Express + TypeScript (Backend)
- PostgreSQL + Prisma ORM (Database)
- JWT Authentication

---

*Queen Mary University of London — ECS506U Software Engineering Practice*
*Student ID: 230332195*
