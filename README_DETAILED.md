# TechForum - Developer Q&A Platform

A comprehensive 3-tier forum application for developers to ask and answer technical questions, built with modern web technologies and following professional software engineering practices.

## 🌟 Features

### Core Functionality

- **User Authentication**: Secure registration/login with JWT tokens
- **Question Management**: Create, edit, delete, and vote on questions
- **Answer System**: Post answers, vote, and mark as accepted
- **Category Organization**: Browse questions by technology categories
- **Search & Filter**: Advanced search with multiple filter options
- **Real-time Updates**: Dynamic content updates and notifications
- **Responsive Design**: Mobile-first, responsive user interface

### Advanced Features

- **Voting System**: Upvote/downvote questions and answers
- **Tag System**: Organize content with relevant tags
- **User Profiles**: Detailed user statistics and activity tracking
- **Admin Panel**: Category management and user moderation
- **Form Validation**: Comprehensive client and server-side validation
- **Error Handling**: Graceful error handling and user feedback

## 🏗️ Architecture

This application follows the **3-Tier Architecture** pattern:

### Data Layer (MongoDB)

- **Users Collection**: Authentication, profiles, and statistics
- **Categories Collection**: Topic organization and metadata
- **Questions Collection**: Question content, votes, and relationships
- **Answers Collection**: Answer content, voting, and acceptance status
- **Indexes**: Optimized for performance and search capabilities

### Application Layer (Node.js + Express.js)

- **RESTful API**: Clean, consistent API endpoints
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation with express-validator
- **Error Handling**: Comprehensive error middleware
- **Rate Limiting**: API protection against abuse
- **Security**: Helmet.js, CORS, and security best practices

### Presentation Layer (React.js)

- **Single Page Application**: Modern SPA with React Router
- **State Management**: React Context for global state
- **Form Handling**: React Hook Form with Yup validation
- **UI Components**: Reusable, accessible component library
- **Responsive Design**: Mobile-first CSS with flexbox/grid
- **Real-time Feedback**: Toast notifications and loading states

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **Git**

### Automated Setup

#### Windows

```cmd
# Clone the repository
git clone <repository-url>
cd Project4

# Run the setup script
setup.bat
```

#### Linux/macOS

```bash
# Clone the repository
git clone <repository-url>
cd Project4

# Make setup script executable and run
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Install Dependencies**

   ```bash
   npm run install-all
   ```

2. **Configure Environment**

   - Copy `.env.example` files in each directory
   - Update MongoDB connection strings
   - Set JWT secrets and other configuration

3. **Initialize Database**

   ```bash
   npm run seed-db
   ```

4. **Start Application**
   ```bash
   npm start  # Starts both server and client
   ```

## 📁 Project Structure

```
Project4/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── pages/         # Route components
│   │   └── index.js       # App entry point
│   └── package.json
├── server/                # Express.js backend API
│   ├── config/           # Database and app configuration
│   ├── middleware/       # Custom middleware (auth, validation)
│   ├── routes/           # API route handlers
│   └── index.js          # Server entry point
├── database/             # Database setup and seeding
│   ├── schemas.js        # MongoDB schema definitions
│   └── seed.js           # Sample data seeding
└── package.json          # Root package configuration
```

## 🔧 Configuration

### Environment Variables

#### Server (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/techforum
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGINS=http://localhost:3000
```

#### Client (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### MongoDB Setup

1. **Local MongoDB**

   ```bash
   # Install MongoDB Community Edition
   # Start MongoDB service
   mongod --dbpath /path/to/data/directory
   ```

2. **MongoDB Atlas (Cloud)**
   - Create account at mongodb.com
   - Create cluster and get connection string
   - Update MONGODB_URI in server/.env

## 🧪 Testing

### Development Testing

```bash
# Run server in development mode
npm run server:dev

# Run client in development mode
npm run client

# Test API endpoints
curl http://localhost:5000/health
```

### API Endpoints

#### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

#### Questions

- `GET /api/questions` - List questions (paginated, searchable)
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get question details
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question

#### Answers

- `POST /api/answers` - Create new answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer

## 👥 Default Users

The application comes with pre-seeded demo accounts:

| Username  | Password  | Role      | Description        |
| --------- | --------- | --------- | ------------------ |
| admin     | admin123  | admin     | Full system access |
| developer | dev123    | user      | Regular developer  |
| newbie    | newbie123 | user      | New user account   |
| expert    | expert123 | moderator | Experienced user   |

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Both client and server-side
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Controlled cross-origin access
- **Security Headers**: Helmet.js security middleware

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Tablet and desktop responsive
- **Accessibility**: WCAG 2.1 guidelines followed
- **Performance**: Optimized images and lazy loading

## 🚀 Deployment

### Local Development

```bash
npm start                   # Full stack
npm run server             # Backend only
npm run client             # Frontend only
```

### Production Build

```bash
cd client
npm run build              # Build React app
cd ../server
npm start                  # Start production server
```

### Environment URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/health
- **API Docs**: http://localhost:5000/api

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React.js and Node.js ecosystem
- MongoDB for flexible, scalable data storage
- Express.js for robust API development
- Professional UI design with Tailwind-inspired CSS

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check existing documentation
- Review API endpoint documentation

---

**TechForum** - Empowering developers through knowledge sharing 🚀
