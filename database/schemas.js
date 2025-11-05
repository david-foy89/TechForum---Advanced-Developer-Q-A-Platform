// MongoDB Schema Definitions for TechForum

// Users Collection Schema
const UserSchema = {
  _id: String, // Custom ID for easier reference
  username: String, // Required, unique, 3-50 characters
  email: String, // Required, unique, valid email format
  password: String, // Required, hashed with bcrypt
  role: String, // 'admin', 'moderator', 'user'
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean,
  profile: {
    firstName: String,
    lastName: String,
    avatar: String, // URL to avatar image
    bio: String,
    location: String,
    website: String
  },
  stats: {
    questionsAsked: Number,
    answersGiven: Number,
    reputation: Number,
    badges: Array // Array of badge objects
  }
};

// Categories Collection Schema
const CategorySchema = {
  _id: String,
  name: String, // Required, unique
  description: String,
  color: String, // Hex color for UI theming
  icon: String, // Icon identifier
  createdAt: Date,
  updatedAt: Date,
  questionCount: Number, // Denormalized for performance
  isActive: Boolean,
  parentId: String, // For hierarchical categories (optional)
  order: Number // For display ordering
};

// Questions Collection Schema
const QuestionSchema = {
  _id: String,
  title: String, // Required, 10-200 characters
  content: String, // Required, detailed question content
  userId: String, // Reference to Users collection
  categoryId: String, // Reference to Categories collection
  tags: [String], // Array of tag strings
  views: Number,
  votes: Number, // Net votes (upvotes - downvotes)
  answers: [String], // Array of Answer IDs
  createdAt: Date,
  updatedAt: Date,
  isResolved: Boolean,
  isPinned: Boolean,
  isLocked: Boolean, // Prevents new answers
  votes_detail: {
    upvotes: [String], // Array of user IDs who upvoted
    downvotes: [String] // Array of user IDs who downvoted
  }
};

// Answers Collection Schema
const AnswerSchema = {
  _id: String,
  content: String, // Required, answer content
  questionId: String, // Reference to Questions collection
  userId: String, // Reference to Users collection
  votes: Number, // Net votes
  isAccepted: Boolean, // Marked as correct answer
  createdAt: Date,
  updatedAt: Date,
  votes_detail: {
    upvotes: [String], // Array of user IDs who upvoted
    downvotes: [String] // Array of user IDs who downvoted
  }
};

// Comments Collection Schema (Optional - for future enhancement)
const CommentSchema = {
  _id: String,
  content: String,
  userId: String,
  targetId: String, // ID of question or answer being commented on
  targetType: String, // 'question' or 'answer'
  createdAt: Date,
  updatedAt: Date
};

// Votes Collection Schema (Optional - for audit trail)
const VoteSchema = {
  _id: String,
  userId: String,
  targetId: String, // ID of question or answer being voted on
  targetType: String, // 'question' or 'answer'
  voteType: String, // 'upvote' or 'downvote'
  createdAt: Date
};

// Indexes for Performance
const indexes = {
  users: [
    { username: 1 }, // Unique index
    { email: 1 }, // Unique index
    { createdAt: -1 }
  ],
  categories: [
    { name: 1 }, // Unique index
    { order: 1 },
    { isActive: 1 }
  ],
  questions: [
    { userId: 1 },
    { categoryId: 1 },
    { createdAt: -1 },
    { updatedAt: -1 },
    { tags: 1 },
    { title: "text", content: "text" }, // Text search index
    { votes: -1 },
    { views: -1 }
  ],
  answers: [
    { questionId: 1 },
    { userId: 1 },
    { createdAt: -1 },
    { votes: -1 },
    { isAccepted: -1 }
  ]
};

module.exports = {
  UserSchema,
  CategorySchema,
  QuestionSchema,
  AnswerSchema,
  CommentSchema,
  VoteSchema,
  indexes
};