#!/bin/bash

echo "========================================"
echo "Password Checker - Quick Setup Script"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

echo "[1/5] Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "[OK] Virtual environment created"
else
    echo "[OK] Virtual environment already exists"
fi

echo ""
echo "[2/5] Activating virtual environment..."
source venv/bin/activate

echo ""
echo "[3/5] Upgrading pip..."
pip install --upgrade pip --quiet

echo ""
echo "[4/5] Installing dependencies..."
pip install -r requirements.txt --quiet

echo ""
echo "[5/5] Checking .env file..."
if [ ! -f ".env" ]; then
    echo "[WARN] .env file not found. Creating from template..."
    cp .env.example .env
    echo "[ACTION REQUIRED] Please edit .env file with your Firebase credentials!"
    echo ""
    echo "1. Go to: https://console.firebase.google.com/"
    echo "2. Create/Select your project"
    echo "3. Enable Authentication and Realtime Database"
    echo "4. Copy your Firebase config"
    echo "5. Update .env file with your credentials"
    echo ""
else
    echo "[OK] .env file exists"
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start the application:"
echo "  1. Make sure .env is configured with Firebase credentials"
echo "  2. Run: python app.py"
echo "  3. Open: http://localhost:5000"
echo ""
echo "For detailed instructions, see:"
echo "  - QUICKSTART.md (5-minute setup guide)"
echo "  - README.md (full documentation)"
echo ""
