echo "Starting Maintainerr UI..."

NODE_ENV=production

node ./ui/server.js --env-file=./ui/.env --env-file=./ui/.env.production