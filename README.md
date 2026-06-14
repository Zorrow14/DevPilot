# DevPilot

**DevPilot** is an AI-powered developer growth and project progress platform designed for students, junior developers, and internship seekers. It helps users track technical skills, manage portfolio projects, organize development tasks, generate personalized learning roadmaps, and measure internship readiness from one professional dashboard.

The platform is built as a full-stack SaaS-style application using **Next.js**, **Express.js**, **PostgreSQL**, **Prisma**, and **Firebase Authentication**. DevPilot focuses on turning learning goals into structured action plans, helping users move from “I want to become a developer” to “Here is what I am building, learning, and improving every week.”

---

## Overview

Many students and junior developers struggle to organize their learning journey. They may watch tutorials, save roadmaps, start projects, and prepare for internships, but they often lack a single system to track progress clearly. DevPilot solves this by combining skill tracking, project planning, task management, AI roadmap generation, analytics, and admin monitoring in one clean platform.

Users can create an account, define their target role, add skills, manage projects, track tasks, generate AI learning roadmaps, and view an internship readiness score based on their actual progress. Admins can monitor platform activity, users, projects, skills, roadmaps, feedback, and announcements through a dedicated admin dashboard.

---

## Key Features

### User Authentication

DevPilot uses **Firebase Authentication** for secure user login and registration.

Features include:

* Email and password registration
* Email verification after signup
* Login with verified email
* Google login
* Password reset email
* Logout functionality
* Protected dashboard routes
* Backend Firebase token verification using Firebase Admin SDK

Firebase handles authentication securely, while PostgreSQL stores the application-specific user profile, role, status, skills, projects, tasks, and roadmaps.

---

### User Dashboard

The user dashboard gives a quick overview of the user’s learning and project progress.

Dashboard cards include:

* Total skills
* Active projects
* Pending tasks
* Completed projects
* Upcoming deadlines
* Internship readiness score
* Recent roadmaps
* Announcements

The dashboard is designed to help users understand what they are currently learning, what they are building, and what needs attention next.

---

### Skill Tracker

Users can add and manage technical skills they are learning.

Each skill includes:

* Skill name
* Category
* Level
* Progress percentage
* Notes
* Last practiced date

Skill levels include:

* Beginner
* Intermediate
* Advanced

This allows users to monitor their technical development across areas such as frontend, backend, database, deployment, DevOps, and AI tools.

---

### Project Planner

DevPilot includes a project management system focused on portfolio building.

Each project includes:

* Project title
* Description
* Tech stack
* Status
* Priority
* Deadline
* Progress percentage

Project statuses include:

* Planning
* In Progress
* Completed

This helps users organize portfolio projects clearly and demonstrate consistent development progress.

---

### Task Management

Each project can contain multiple tasks.

Task features include:

* Add task
* Edit task
* Delete task
* Mark task as completed
* Set priority
* Set due date
* Filter by status or priority

This turns large project goals into smaller, manageable development steps.

---

### AI Roadmap Generator

DevPilot includes an AI-powered roadmap generator that helps users plan their learning journey.

Users can enter:

* Career goal
* Current skills
* Target role
* Preferred duration

The system generates a structured learning roadmap containing:

* Weekly learning plan
* Recommended skills
* Suggested mini projects
* Milestones
* Mistakes to avoid
* Next-step recommendations

The roadmap is saved to the user’s account so they can revisit it later.

---

### Internship Readiness Score

DevPilot calculates an internship readiness score based on real user progress.

The score considers:

* Skill progress
* Completed projects
* Task completion rate
* Roadmap activity
* Coverage of important development categories

Readiness categories include:

* Frontend readiness
* Backend readiness
* Database readiness
* Deployment readiness
* Overall readiness

This feature helps users understand how prepared they are for internship or junior developer opportunities.

---

### Progress Analytics

DevPilot includes analytics to help users visualize their growth.

Analytics include:

* Skill progress breakdown
* Project status distribution
* Completed vs pending tasks
* Readiness score breakdown
* Roadmap activity
* Weekly progress indicators

These insights make the platform more useful than a basic task manager.

---

### Admin Dashboard

DevPilot includes an admin dashboard for platform monitoring and management.

Admin features include:

* Platform overview
* Total users
* Active users
* Total projects
* Total skills
* Total roadmaps generated
* Completed tasks
* Recent platform activity

Admins can also manage and monitor different platform sections.

---

### User Management

Admins can view and manage registered users.

Features include:

* View all users
* Search users by name or email
* View user role
* View account status
* Change user role
* Activate or deactivate users

Roles include:

* User
* Admin

Statuses include:

* Active
* Inactive

---

### Project Monitoring

Admins can view projects created by users.

Features include:

* View all user projects
* Filter by project status
* Filter by priority
* View project owner
* View project progress
* Remove inappropriate or test projects

---

### Skill Analytics

Admins can analyze skill trends across the platform.

Analytics include:

* Most added skills
* Average skill progress
* Common skill categories
* Beginner, intermediate, and advanced skill distribution

This helps understand what users are learning most.

---

### AI Roadmap Monitoring

Admins can monitor roadmap usage.

Features include:

* Total roadmaps generated
* Most common career goals
* Recent roadmap generations
* AI usage trends
* Failed AI request placeholders

---

### Feedback Management

Users can submit feedback, bug reports, and feature requests.

Feedback types include:

* Bug
* Feature
* General

Feedback statuses include:

* New
* In Review
* Resolved
* Rejected

Admins can review and update feedback status.

---

### Announcement Management

Admins can create platform announcements.

Announcements can be shown on the user dashboard for:

* New feature updates
* Maintenance notices
* Internship tips
* Roadmap updates
* Platform news

---

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Firebase Client SDK
* React Hook Form
* Zod
* Recharts

### Backend

* Node.js
* Express.js
* TypeScript
* Firebase Admin SDK
* Prisma ORM

### Database

* PostgreSQL
* Supabase PostgreSQL

### Authentication

* Firebase Authentication
* Firebase Admin token verification

### AI

* Mock AI roadmap generator
* Prepared for Azure OpenAI integration

### Tools

* Postman
* VS Code
* Codex
* Git and GitHub

---

## Project Architecture

```txt
DevPilot/
├── client/                 # Next.js frontend
│   ├── app/                # App Router pages
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Firebase and API helpers
│   ├── types/              # TypeScript types
│   └── data/               # Static or mock data
│
└── server/                 # Express.js backend
    ├── prisma/             # Prisma schema and migrations
    ├── src/
    │   ├── config/         # Environment and Firebase Admin config
    │   ├── controllers/    # Request handlers
    │   ├── services/       # Business logic
    │   ├── routes/         # API routes
    │   ├── middleware/     # Auth, admin, error middleware
    │   ├── utils/          # Helper functions
    │   └── types/          # Express and app types
    └── package.json
```

---

## Database Models

The main database models are:

* User
* Skill
* Project
* Task
* Roadmap
* Feedback
* Announcement

Main relationships:

* One user can have many skills
* One user can have many projects
* One project can have many tasks
* One user can generate many roadmaps
* One user can submit many feedback items
* One admin can create many announcements

---

## API Overview

### Authentication

```txt
POST /api/auth/sync-user
GET  /api/users/me
PUT  /api/users/me
```

### Skills

```txt
GET    /api/skills
POST   /api/skills
PUT    /api/skills/:id
DELETE /api/skills/:id
```

### Projects

```txt
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Tasks

```txt
GET    /api/projects/:projectId/tasks
POST   /api/projects/:projectId/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Roadmaps

```txt
POST /api/roadmaps/generate
GET  /api/roadmaps
```

### Dashboard

```txt
GET /api/dashboard/stats
```

### Feedback

```txt
POST /api/feedback
```

### Announcements

```txt
GET /api/announcements
```

### Admin

```txt
GET    /api/admin/overview
GET    /api/admin/users
PATCH  /api/admin/users/:id/role
PATCH  /api/admin/users/:id/status
GET    /api/admin/projects
GET    /api/admin/skills
GET    /api/admin/roadmaps
GET    /api/admin/feedback
PATCH  /api/admin/feedback/:id/status
GET    /api/admin/announcements
POST   /api/admin/announcements
PUT    /api/admin/announcements/:id
DELETE /api/admin/announcements/:id
```

---

## Environment Variables

### Client `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Server `.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

DATABASE_URL=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/devpilot.git
cd devpilot
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

---

## Running the Project Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

Backend runs on:

```txt
http://localhost:5000
```

---

## Prisma Commands

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

## Authentication Flow

1. User signs up using email/password or Google.
2. Firebase Auth creates the user.
3. Email/password users receive a verification email.
4. After login, the frontend gets the Firebase ID token.
5. The token is sent to the Express backend.
6. Firebase Admin verifies the token.
7. The backend syncs the Firebase user with PostgreSQL.
8. Protected routes use the authenticated PostgreSQL user.
9. Admin routes check the user role before allowing access.

---

## UI Theme

DevPilot uses a professional dual-theme design system.

### Light Mode — The Organized Studio

A clean, bright, high-end productivity interface using:

* Slate 50 background
* White elevated cards
* Thin slate borders
* Slate charcoal typography
* Deep indigo accents

### Dark Mode — The Midnight Observatory

A calm, focused, late-night developer cockpit using:

* Slate 900 background
* Slate 800 cards
* Soft off-white typography
* Subtle slate borders
* Luminous pastel indigo accents

---

## Future Improvements

Planned improvements include:

* Azure OpenAI integration for real AI roadmap generation
* Project screenshot uploads
* Resume upload and analysis
* Certificate tracking
* Public portfolio progress report
* Weekly AI progress review
* Team/classroom mode for lecturers
* Advanced admin analytics
* Notification system
* Deployment dashboard

---

## Purpose of the Project

DevPilot was built as a full-stack portfolio project to demonstrate practical skills in:

* Next.js frontend development
* Express.js backend development
* PostgreSQL database design
* Prisma ORM
* Firebase Authentication
* Protected API routes
* Role-based access control
* Dashboard UI design
* AI-assisted product features
* Full-stack SaaS architecture

The project is designed to be useful, scalable, and realistic enough to serve as both a strong portfolio piece and a potential startup MVP.

---

## License

This project is created for educational and portfolio purposes.

---

## Author

Developed by **Htet Aung Lwin**.

GitHub: `your-github-profile`
Portfolio: `your-portfolio-link`
