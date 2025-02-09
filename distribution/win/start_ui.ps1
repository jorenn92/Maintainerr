Write-Output "Starting Maintainerr UI..."

$env:NODE_ENV = "production"

node ./ui/server.js --env-file=./ui/.env --env-file=./ui/.env.production