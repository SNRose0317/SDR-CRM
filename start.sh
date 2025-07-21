#!/bin/bash
# Load environment variables from .env file
export $(cat .env | xargs)

# Start the development server
npm run dev