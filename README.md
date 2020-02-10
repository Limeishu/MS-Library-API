# Pollux

A flexible Web API Server for Project Gemini.

- based on `Prisma`

## Deploy

- Copy `.sample.env` -> `.env` and modify it as you need.
- Put your private/public key pair (Format: `jwtRS256`) into `cert/`

```sh
# install dependencies
npm install

# deploy enviroment
npm run deploy

# generate datamodel
npm run generate

# build API service and start runtime
npm run start

# start API runtime only
npm run server

# lint
npm run lint

# lint with fix
npm run lint:fix
```

## Document
[MS-Library Tech Specification](https://hackmd.io/aFnj0d7wS_O_FoY9f9nYAw)
