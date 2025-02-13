#!/bin/bash

echo "Starting Maintainerr UI..."

NODE_ENV=production

node --env-file=./ui/.env.production --env-file=./ui/.env ./ui/server.js