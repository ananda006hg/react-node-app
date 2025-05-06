#!/bin/bash

# Ensure MongoDB is running
echo "Starting MongoDB if not already running..."
mongod --dbpath ~/data/db --fork --logpath ~/data/mongodb.log || echo "MongoDB might already be running or failed to start"

# Wait for MongoDB to start
sleep 2
echo "MongoDB service should now be available"