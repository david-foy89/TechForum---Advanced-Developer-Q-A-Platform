# TechForum - Developer Q&A Platform

A comprehensive 3-tier forum application for developers to ask and answer technical questions.

## Features

- User registration and authentication
- Category-based question organization
- Chronological question display
- Real-time question and answer management
- Responsive design

## Architecture

### Data Layer (MongoDB)

- User management
- Category hierarchy
- Question and answer storage
- Authentication data

### Application Layer (Node.js + Express)

- RESTful API
- JWT authentication
- Data validation
- Business logic

### Presentation Layer (React)

- Single Page Application
- Responsive UI
- Real-time updates
- Form validation

## Categories

- **JavaScript** - Frontend and backend JavaScript questions
- **React** - React.js framework discussions
- **Node.js** - Server-side JavaScript topics
- **Database** - Database design and queries
- **DevOps** - Deployment and infrastructure

## Setup Instructions

1. **Database Setup**

   ```bash
   cd database
   node seed.js
   ```

2. **Server Setup**

   ```bash
   cd server
   npm install
   npm start
   ```

3. **Client Setup**
   ```bash
   cd client
   npm install
   npm start
   ```

## Technology Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express.js, JWT
- **Database**: MongoDB
- **Styling**: CSS3, Flexbox/Grid

## Default Users

- Username: `admin` / Password: `admin123`
- Username: `developer` / Password: `dev123`
- Username: `newbie` / Password: `newbie123`
