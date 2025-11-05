@echo off
echo 🚀 Setting up TechForum - Developer Q&A Platform
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...

REM Install root dependencies
echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

REM Install client dependencies
echo Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)
cd ..

REM Install database dependencies
echo Installing database dependencies...
cd database
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install database dependencies
    pause
    exit /b 1
)

echo 🌱 Seeding database with sample data...
call npm run seed
if %errorlevel% neq 0 (
    echo ⚠️  Database seeding failed. Make sure MongoDB is running.
)
cd ..

echo ✅ Dependencies installed successfully!
echo.
echo 🎉 Setup complete!
echo.
echo 🚀 To start the application:
echo    npm start              # Starts both server and client
echo    npm run server         # Starts only the server
echo    npm run client         # Starts only the client
echo.
echo 📝 Default login credentials:
echo    Username: admin     Password: admin123
echo    Username: developer Password: dev123
echo    Username: newbie    Password: newbie123
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo    Health:   http://localhost:5000/health
echo.
pause