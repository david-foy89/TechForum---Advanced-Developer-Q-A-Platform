#!/bin/bash

echo "🚀 Setting up TechForum - Developer Q&A Platform"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if MongoDB is running
if ! nc -z localhost 27017; then
    echo "⚠️  MongoDB is not running on localhost:27017"
    echo "   Please start MongoDB or update the connection string in the .env files"
fi

echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

# Install database dependencies
echo "Installing database dependencies..."
cd database
npm install
cd ..

echo "✅ Dependencies installed successfully!"

# Seed database
echo "🌱 Seeding database with sample data..."
cd database
npm run seed
cd ..

echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   npm start              # Starts both server and client"
echo "   npm run server         # Starts only the server"
echo "   npm run client         # Starts only the client"
echo ""
echo "📝 Default login credentials:"
echo "   Username: admin     Password: admin123"
echo "   Username: developer Password: dev123"
echo "   Username: newbie    Password: newbie123"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   Health:   http://localhost:5000/health"