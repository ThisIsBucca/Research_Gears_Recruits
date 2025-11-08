#!/bin/bash

echo "🚀 Setting up Research Gears Recruits Development Environment..."

# Create necessary directories if they don't exist
mkdir -p scripts
mkdir -p config

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "📝 Checking required tools..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Initialize package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "📦 Initializing package.json..."
    npm init -y
    
    # Add necessary dependencies
    npm install --save-dev http-server         # For serving static files
    npm install --save-dev nodemon             # For development server
    npm install --save-dev eslint              # For code linting
    npm install --save axios                   # For API calls
    npm install --save-dev dotenv              # For environment variables
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔑 Creating .env file..."
    cat > .env << EOF
# API Configuration
API_URL=https://api.sokoni.africa
API_VERSION=v1
API_KEY=your_api_key_here

# Development Settings
PORT=3000
NODE_ENV=development
EOF
fi

# Add useful scripts to package.json
echo "⚙️ Updating package.json scripts..."
node -e '
const fs = require("fs");
const package = JSON.parse(fs.readFileSync("package.json"));
package.scripts = {
    ...package.scripts,
    "start": "http-server . -p 3000 -c-1",
    "dev": "nodemon --watch . --ext html,css,js --exec \"npm start\"",
    "lint": "eslint js/",
    "test": "echo \"No tests specified yet\" && exit 0"
};
fs.writeFileSync("package.json", JSON.stringify(package, null, 2));
'

# Create basic ESLint config
if [ ! -f ".eslintrc.json" ]; then
    echo "🔍 Creating ESLint configuration..."
    cat > .eslintrc.json << EOF
{
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    }
}
EOF
fi

# Add .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
node_modules/
.env
.DS_Store
*.log
dist/
EOF
fi

# Check if API is accessible
echo "🔌 Checking API connection..."
if command_exists curl; then
    if curl -s "https://api.sokoni.africa/health" >/dev/null; then
        echo "✅ API is accessible"
    else
        echo "⚠️ Warning: API seems to be unavailable"
    fi
fi

# Create a simple health check script
cat > scripts/health-check.sh << EOF
#!/bin/bash
echo "🔍 Running health checks..."
curl -s https://api.sokoni.africa/health
EOF
chmod +x scripts/health-check.sh

echo "
✅ Setup completed successfully!

To start development:
1. Update .env with your API credentials
2. Run 'npm start' to start the development server
3. Open http://localhost:3000 in your browser

Available commands:
- npm start     : Start development server
- npm run dev   : Start server with auto-reload
- npm run lint  : Run code linting
- npm test     : Run tests (when added)

For API testing:
- ./scripts/health-check.sh : Test API connectivity
"