const { MongoClient } = require('mongodb');

let db = null;
let client = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/techforum';
    const dbName = process.env.DB_NAME || 'techforum';
    
    console.log('🔄 Connecting to MongoDB...');
    
    client = new MongoClient(uri, {
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    db = client.db(dbName);
    
    // Test the connection
    await db.admin().ping();
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${dbName}`);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\\n🛑 Received SIGINT. Closing MongoDB connection...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\\n🛑 Received SIGTERM. Closing MongoDB connection...');
  await closeDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  getDB,
  closeDB
};