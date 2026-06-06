# AI Lesson Plan Generator

## Optimized PRD for FirstCry Intellitots Internship

### Project Objective

Develop a web-based application that allows preschool teachers to generate age-appropriate lesson plans using AI by selecting an age group and learning theme.

---

## Problem Statement

Teachers currently spend significant time manually creating lesson plans, activities, rhymes, worksheet ideas, and material lists.

The process often relies on:

- WhatsApp communication
- Spreadsheets
- Manual planning

This results in:

- Increased preparation time
- Inconsistent lesson quality
- Lack of centralized lesson records

The proposed system automates lesson creation using AI and stores generated plans for future reference.

---

## Core Features (Must Have)

### 1. Lesson Plan Generator

Teacher selects:

- Age Group
- Theme
- Date

System generates:

- Learning Objective
- Activity
- Rhyme
- Worksheet Idea
- Materials Required

---

### 2. Lesson Plan Dashboard

Teacher can:

- View generated plans
- Search by theme
- Open lesson details
- Delete unwanted plans

---

### 3. AI Integration

Primary:

- Gemini API

Fallback:

- Rule-Based Template Generator

If AI fails:

- Generate lesson using predefined templates

---

### 4. Database Storage

Store:

- Age Group
- Theme
- Generated Content
- Creation Date

---

### 5. PDF Export

Teacher can download generated lesson plans as PDF.

---

## User Flow

Teacher Login

↓

Create Lesson

↓

Select Age Group

↓

Select Theme

↓

Generate Lesson

↓

Save to Database

↓

View in Dashboard

↓

Export PDF

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL

### AI

- Google Gemini API

### Deployment

- Vercel (Frontend)
- Render (Backend)

---

## Database Tables

### Users

- id
- name
- email
- password

### Lesson Plans

- id
- user_id
- age_group
- theme
- lesson_content
- created_at

---

## API Endpoints

POST /api/auth/register

POST /api/auth/login

POST /api/lessons/generate

GET /api/lessons

GET /api/lessons/:id

DELETE /api/lessons/:id

GET /api/export/pdf/:id

---

## Review 1 Deliverables

- Problem Statement
- Abstract
- Objectives
- Wireframes
- Technology Stack
- GitHub Repository

---

## Review 2 Deliverables

- Literature Survey
- Existing System Analysis
- Database Design
- Architecture Diagram
- Working APIs
- Frontend Screens

---

## Review 3 Deliverables

- Fully Working Prototype
- AI Integration
- Database Integration
- PDF Export
- Deployment URL
- Final Report
- GitHub Repository
- Demo Video

---

## Success Criteria

- Lesson generated within 10 seconds
- Plan saved successfully
- Dashboard displays saved plans
- PDF export works
- Application deployed successfully
- End-to-end demo completed

---

## Future Scope

- Parent Portal
- WhatsApp Integration
- Admin Dashboard
- Lesson Sharing
- Analytics Dashboard
- Multi-Center Management
- Mobile Application
