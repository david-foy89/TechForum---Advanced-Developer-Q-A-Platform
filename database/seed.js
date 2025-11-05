const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techforum';
const DB_NAME = process.env.DB_NAME || 'techforum';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Clear existing collections
    const collections = ['users', 'categories', 'questions', 'answers'];
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).drop();
        console.log(`Cleared ${collectionName} collection`);
      } catch (error) {
        console.log(`Collection ${collectionName} does not exist, creating new`);
      }
    }

    // Create users
    const users = [
      {
        _id: 'user1',
        username: 'admin',
        email: 'admin@techforum.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        isActive: true
      },
      {
        _id: 'user2',
        username: 'developer',
        email: 'dev@techforum.com',
        password: await bcrypt.hash('dev123', 10),
        role: 'user',
        createdAt: new Date('2024-01-15'),
        isActive: true
      },
      {
        _id: 'user3',
        username: 'newbie',
        email: 'newbie@techforum.com',
        password: await bcrypt.hash('newbie123', 10),
        role: 'user',
        createdAt: new Date('2024-02-01'),
        isActive: true
      },
      {
        _id: 'user4',
        username: 'expert',
        email: 'expert@techforum.com',
        password: await bcrypt.hash('expert123', 10),
        role: 'moderator',
        createdAt: new Date('2024-01-10'),
        isActive: true
      }
    ];

    await db.collection('users').insertMany(users);
    console.log('Users created successfully');

    // Create categories
    const categories = [
      {
        _id: 'cat1',
        name: 'JavaScript',
        description: 'Frontend and backend JavaScript questions',
        color: '#f7df1e',
        icon: 'js',
        createdAt: new Date(),
        questionCount: 0
      },
      {
        _id: 'cat2',
        name: 'React',
        description: 'React.js framework discussions and best practices',
        color: '#61dafb',
        icon: 'react',
        createdAt: new Date(),
        questionCount: 0
      },
      {
        _id: 'cat3',
        name: 'Node.js',
        description: 'Server-side JavaScript and backend development',
        color: '#339933',
        icon: 'nodejs',
        createdAt: new Date(),
        questionCount: 0
      },
      {
        _id: 'cat4',
        name: 'Database',
        description: 'Database design, queries, and optimization',
        color: '#336791',
        icon: 'database',
        createdAt: new Date(),
        questionCount: 0
      },
      {
        _id: 'cat5',
        name: 'DevOps',
        description: 'Deployment, CI/CD, and infrastructure topics',
        color: '#ff6b35',
        icon: 'devops',
        createdAt: new Date(),
        questionCount: 0
      }
    ];

    await db.collection('categories').insertMany(categories);
    console.log('Categories created successfully');

    // Create questions
    const questions = [
      {
        _id: 'q1',
        title: 'How to handle async/await in JavaScript?',
        content: 'I am having trouble understanding when to use async/await vs promises. Can someone explain the best practices?',
        userId: 'user3',
        categoryId: 'cat1',
        tags: ['async', 'promises', 'javascript'],
        views: 125,
        votes: 5,
        answers: [],
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-01'),
        isResolved: false
      },
      {
        _id: 'q2',
        title: 'React Hook Rules and Best Practices',
        content: 'What are the rules for React Hooks and how can I avoid common pitfalls when using useState and useEffect?',
        userId: 'user2',
        categoryId: 'cat2',
        tags: ['react', 'hooks', 'best-practices'],
        views: 89,
        votes: 8,
        answers: [],
        createdAt: new Date('2024-11-02'),
        updatedAt: new Date('2024-11-02'),
        isResolved: true
      },
      {
        _id: 'q3',
        title: 'Express.js Middleware Best Practices',
        content: 'How should I structure middleware in Express.js applications? What is the proper order for error handling middleware?',
        userId: 'user3',
        categoryId: 'cat3',
        tags: ['express', 'middleware', 'nodejs'],
        views: 67,
        votes: 3,
        answers: [],
        createdAt: new Date('2024-11-03'),
        updatedAt: new Date('2024-11-03'),
        isResolved: false
      },
      {
        _id: 'q4',
        title: 'MongoDB vs PostgreSQL for web applications',
        content: 'I am starting a new project and need to choose between MongoDB and PostgreSQL. What are the pros and cons of each for a typical web application?',
        userId: 'user2',
        categoryId: 'cat4',
        tags: ['mongodb', 'postgresql', 'database-design'],
        views: 156,
        votes: 12,
        answers: [],
        createdAt: new Date('2024-11-04'),
        updatedAt: new Date('2024-11-04'),
        isResolved: false
      },
      {
        _id: 'q5',
        title: 'Docker deployment strategies',
        content: 'What are the best practices for deploying Node.js applications using Docker? How do I handle environment variables securely?',
        userId: 'user3',
        categoryId: 'cat5',
        tags: ['docker', 'deployment', 'nodejs'],
        views: 92,
        votes: 6,
        answers: [],
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-01'),
        isResolved: false
      }
    ];

    await db.collection('questions').insertMany(questions);
    console.log('Questions created successfully');

    // Create answers
    const answers = [
      {
        _id: 'a1',
        content: 'Async/await is syntactic sugar over promises. Use async/await when you want to write asynchronous code that looks synchronous. Here is a comprehensive example...',
        questionId: 'q1',
        userId: 'user4',
        votes: 8,
        isAccepted: true,
        createdAt: new Date('2024-11-01T10:30:00'),
        updatedAt: new Date('2024-11-01T10:30:00')
      },
      {
        _id: 'a2',
        content: 'The main rules for React Hooks are: 1) Only call hooks at the top level, 2) Only call hooks from React functions. Here are detailed explanations and examples...',
        questionId: 'q2',
        userId: 'user1',
        votes: 12,
        isAccepted: true,
        createdAt: new Date('2024-11-02T14:20:00'),
        updatedAt: new Date('2024-11-02T14:20:00')
      },
      {
        _id: 'a3',
        content: 'For Express middleware, the order matters! Authentication should come before authorization, and error handling middleware should be last...',
        questionId: 'q3',
        userId: 'user4',
        votes: 5,
        isAccepted: false,
        createdAt: new Date('2024-11-03T16:45:00'),
        updatedAt: new Date('2024-11-03T16:45:00')
      },
      {
        _id: 'a4',
        content: 'MongoDB is great for rapid prototyping and flexible schemas, while PostgreSQL excels in data integrity and complex queries. Consider these factors...',
        questionId: 'q4',
        userId: 'user1',
        votes: 7,
        isAccepted: false,
        createdAt: new Date('2024-11-04T09:15:00'),
        updatedAt: new Date('2024-11-04T09:15:00')
      }
    ];

    await db.collection('answers').insertMany(answers);
    console.log('Answers created successfully');

    // Update questions with answer counts
    for (const answer of answers) {
      await db.collection('questions').updateOne(
        { _id: answer.questionId },
        { 
          $push: { answers: answer._id },
          $set: { 
            updatedAt: new Date(),
            isResolved: answer.isAccepted || false
          }
        }
      );
    }

    // Update category question counts
    for (const category of categories) {
      const questionCount = await db.collection('questions').countDocuments({ categoryId: category._id });
      await db.collection('categories').updateOne(
        { _id: category._id },
        { $set: { questionCount } }
      );
    }

    console.log('Database seeded successfully!');
    console.log('\\nDefault users:');
    console.log('- Username: admin, Password: admin123');
    console.log('- Username: developer, Password: dev123');
    console.log('- Username: newbie, Password: newbie123');
    console.log('- Username: expert, Password: expert123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };