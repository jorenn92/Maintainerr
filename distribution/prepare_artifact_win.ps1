param (
    [string]$SHA
)

if ($SHA -notmatch '^[0-9a-fA-F]{40}$') {
    Write-Host "Error: Invalid SHA"
    exit 1
}

New-Item -ItemType Directory -Force -Path "_output"
New-Item -ItemType Directory -Force -Path "_artifacts"
Copy-Item -Recurse -Force "ui/.next/standalone/ui" "_output/ui"
Copy-Item -Recurse -Force "ui/.next/static" "_output/ui/.next/static"
Copy-Item -Recurse -Force "ui/public" "_output/ui/public"
Copy-Item -Force "ui/.env.distribution" "_output/ui/.env"
Copy-Item -Force "ui/.env" "_output/ui/.env.production"
Copy-Item -Recurse -Force "server/dist" "_output/server"
Copy-Item -Force "server/package.json" "_output/server/package.json"
Copy-Item -Force "server/.env.distribution" "_output/server/.env"
Copy-Item -Force "server/.env" "_output/server/.env.production"
Copy-Item -Recurse -Force "server/node_modules" "_output/server/node_modules"
Copy-Item -Recurse -Force "distribution/linux" "_output"

(Get-Content "_output/server/.env.production") -replace '%GIT_SHA%', $SHA | Set-Content "_output/server/.env.production"