# 🚀 TechForum - Advanced Developer Q&A Platform

A modern, full-stack forum application built for developers to ask questions, share knowledge, and build their professional reputation. Features a responsive design, comprehensive user management, and real-time interactions.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## ✨ Features

### 🔐 Authentication & User Management

- **Secure Registration/Login** - JWT-based authentication with bcrypt password hashing
- **User Profiles** - Comprehensive profile pages with stats, bio, and activity tracking
- **Settings Management** - Multi-tab settings with profile, password, notifications, and privacy controls
- **Responsive Navigation** - Mobile-first navbar with hamburger menu and user dropdowns

### 💬 Question & Answer System

- **Ask Questions** - Rich question creation with category selection and tagging
- **Answer & Vote** - Community-driven answers with voting and best answer selection
- **Search Functionality** - Advanced search with both navbar and page-level search bars
- **Category Organization** - Structured categories for better content organization

### 🎨 Modern UI/UX

- **Responsive Design** - Mobile-first approach with breakpoint-based layouts
- **Interactive Components** - Custom toggle switches, loading spinners, and animations
- **Accessibility** - ARIA labels, keyboard navigation, and screen reader support
- **Theme System** - Consistent color palette with CSS custom properties

### 📊 User Analytics & Gamification

- **Reputation System** - Point-based reputation tracking for community engagement
- **Activity Tracking** - Recent questions, answers, and user statistics
- **Achievement Badges** - Best answer tracking and community recognition
- **Profile Statistics** - Questions asked, answers given, and reputation scores

## 🏗️ Architecture

### 📁 Project Structure

```
Project4/
├── 📂 client/          # React frontend application
│   ├── 📂 src/
│   │   ├── 📂 components/  # Reusable UI components
│   │   ├── 📂 contexts/    # React Context providers
│   │   ├── 📂 pages/       # Route-based page components
│   │   └── 📂 styles/      # CSS and styling files
│   └── 📄 package.json
├── 📂 server/          # Node.js/Express backend
│   ├── 📂 config/         # Database and app configuration
│   ├── 📂 middleware/     # Authentication and validation
│   ├── 📂 models/         # MongoDB data models
│   └── 📂 routes/         # API endpoint definitions
├── 📂 database/        # Database utilities and seeders
└── 📄 README.md
```

### 🗄️ Data Layer (MongoDB)

- **Users Collection** - Authentication, profiles, and reputation data
- **Categories Collection** - Question categorization and organization
- **Questions Collection** - Question content, metadata, and relationships
- **Answers Collection** - Answer content, voting, and acceptance status
- **Indexing Strategy** - Optimized queries for search and filtering

### ⚙️ Application Layer (Node.js + Express)

- **RESTful API Design** - Consistent endpoint structure and HTTP methods
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Input Validation** - Comprehensive request validation using Joi/Yup schemas
- **Error Handling** - Centralized error handling with appropriate HTTP status codes
- **Rate Limiting** - API protection against abuse and spam
- **Security Middleware** - Helmet, CORS, and request sanitization

### 🎭 Presentation Layer (React)

- **Component Architecture** - Modular, reusable components with clear separation
- **State Management** - React Context API for global state and user authentication
- **Routing** - Protected routes with authentication checks and navigation guards
- **Form Management** - React Hook Form with validation and error handling
- **HTTP Client** - Axios with interceptors for authentication and error handling

## 📱 User Interface

### 🖥️ Desktop Features

- **Fixed Navbar** - Sticky navigation with search bar and user dropdown
- **Sidebar Navigation** - Category browsing and quick access links
- **Grid Layouts** - Responsive grid systems for questions and user profiles
- **Modal Dialogs** - Interactive modals for actions and confirmations

### 📱 Mobile Features

- **Hamburger Menu** - Collapsible navigation with smooth animations
- **Touch-Friendly UI** - Appropriately sized touch targets and gestures
- **Mobile Search** - Dedicated mobile search interface
- **Responsive Cards** - Adaptive card layouts for different screen sizes

## 🔧 Technical Stack

### Frontend Technologies

- **React 18.2.0** - Modern React with hooks and functional components
- **React Router 6** - Client-side routing with protected routes
- **React Hook Form** - Efficient form handling and validation
- **Axios** - HTTP client with interceptors and error handling
- **Lucide React** - Modern icon library with consistent design
- **CSS3** - Custom CSS with Flexbox/Grid and CSS custom properties

### Backend Technologies

- **Node.js 18+** - JavaScript runtime with ES6+ features
- **Express.js 4** - Web framework with middleware support
- **MongoDB 7** - NoSQL database with aggregation pipelines
- **Mongoose** - ODM with schema validation and middleware
- **JWT** - JSON Web Tokens for stateless authentication
- **bcryptjs** - Password hashing with salt rounds
- **Joi** - Data validation and schema definition

### Development Tools

- **Concurrently** - Run multiple npm scripts simultaneously
- **Nodemon** - Auto-restart server during development
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting and consistency

## 🚀 Quick Start

### Prerequisites

- Node.js 14.0.0 or higher
- MongoDB 4.0 or higher
- npm or yarn package manager

### Installation Steps

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd Project4
   ```

2. **Install Dependencies**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Database Setup**

   ```bash
   # Start MongoDB (Windows)
   "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath C:\data\db

   # Seed the database (optional)
   cd ../database
   node seed.js
   ```

4. **Environment Configuration**

   Create `.env` file in the server directory:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/techforum
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   ```

5. **Start the Application**

   ```bash
   # From the root directory
   npm start

   # Or start separately:
   # Terminal 1 - Backend
   cd server && npm start

   # Terminal 2 - Frontend
   cd client && npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 👤 User Accounts

### Test User Credentials

- **Username:** `testuser` / **Password:** `password123`

### Create New Account

1. Navigate to http://localhost:3000/register
2. Fill out the registration form
3. Login with your new credentials

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
PUT  /api/auth/profile     # Update user profile
```

### Question Endpoints

```
GET    /api/questions              # Get all questions
GET    /api/questions/:id          # Get specific question
POST   /api/questions              # Create new question
PUT    /api/questions/:id          # Update question
DELETE /api/questions/:id          # Delete question
```

### Answer Endpoints

```
GET    /api/questions/:id/answers  # Get question answers
POST   /api/questions/:id/answers  # Create new answer
PUT    /api/answers/:id            # Update answer
DELETE /api/answers/:id            # Delete answer
```

## 🛠️ Development

### Available Scripts

```bash
# Root directory
npm start          # Start both client and server
npm run server     # Start backend only
npm run client     # Start frontend only

# Server directory
npm start          # Start Express server
npm run dev        # Start with nodemon

# Client directory
npm start          # Start React development server
npm run build      # Build for production
npm test           # Run test suite
```

### Code Style

- ESLint configuration for consistent code style
- Prettier integration for automatic formatting
- Husky pre-commit hooks for code quality

## 🚦 Testing

### Running Tests

```bash
# Frontend tests
cd client && npm test

# Backend tests (when implemented)
cd server && npm test
```

## 📈 Performance Optimizations

### Frontend

- **Code Splitting** - Lazy loading of route components
- **Memoization** - React.memo for expensive components
- **Bundle Optimization** - Tree shaking and minification
- **Image Optimization** - Lazy loading and responsive images

### Backend

- **Database Indexing** - Optimized queries for common operations
- **Caching Strategy** - Redis integration for session management
- **Rate Limiting** - Protection against API abuse
- **Compression** - Gzip compression for responses

## 🔐 Security Features

- **Authentication** - JWT tokens with secure HTTP-only cookies
- **Password Security** - bcrypt hashing with salt rounds
- **Input Validation** - Server-side validation for all inputs
- **XSS Protection** - Content Security Policy headers
- **CSRF Protection** - Cross-site request forgery prevention
- **Rate Limiting** - API endpoint protection

## 🌐 Deployment

### Production Build

```bash
# Build frontend
cd client && npm run build

# Set production environment
export NODE_ENV=production

# Start production server
cd server && npm start
```

### Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-secure-jwt-secret
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🔮 Future Improvements

### 🤖 1. AI-Powered Features

- **Smart Question Suggestions** - AI-powered duplicate question detection and similar question recommendations
- **Auto-tagging System** - Machine learning-based automatic tag suggestions for questions
- **Code Snippet Analysis** - Intelligent code highlighting and syntax error detection in posted code
- **Answer Quality Scoring** - AI-driven answer quality assessment to help users find the best solutions

### 🔄 2. Real-Time Collaboration

- **Live Chat System** - Real-time messaging between users for instant help and mentorship
- **WebSocket Integration** - Live notifications for new answers, comments, and votes without page refresh
- **Collaborative Code Editor** - Built-in code editor with syntax highlighting for sharing and reviewing code snippets
- **Video Call Integration** - Screen sharing and video calls for complex problem-solving sessions

### 📱 3. Progressive Web App (PWA) & Mobile Enhancement

- **Offline Functionality** - Service workers for offline question browsing and draft saving
- **Push Notifications** - Native push notifications for mobile devices and desktop browsers
- **Native Mobile App** - React Native mobile application for iOS and Android platforms
- **Enhanced Mobile UX** - Gesture-based navigation, pull-to-refresh, and mobile-optimized interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**TechForum Development Team**

- Modern full-stack development
- React and Node.js expertise
- MongoDB database design
- Responsive UI/UX implementation

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Include steps to reproduce the problem
4. Provide system information and error logs

---

⭐ **Star this repository if it helped you!**
