#!/bin/bash

SHA=$1

if [[ ! $SHA =~ ^[0-9a-fA-F]{40}$ ]]; then
    echo "Error: Invalid SHA"
    exit 1
fi

mkdir _output
mkdir _artifacts
cp -r ui/.next/standalone/ui _output/ui
cp -r ui/.next/static _output/ui/.next/static
cp -r ui/public _output/ui/public
cp ui/.env.distribution _output/ui/.env
cp ui/.env _output/ui/.env.production
cp -r server/dist _output/server
cp server/package.json _output/server/package.json
cp server/.env.distribution _output/server/.env
cp server/.env _output/server/.env.production
cp -r server/node_modules _output/server/node_modules
cp -rT distribution/linux _output
sed -i "s/%GIT_SHA%/$SHA/g" _output/server/.env.production