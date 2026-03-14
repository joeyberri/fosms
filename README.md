### Frontend

- [React](https://reactjs.org/) - main frontend library
- [Vite](https://vitejs.dev/) - modern and fast build tool
- [React Query](https://react-query-v3.tanstack.com/) - react hooks to facilitate fetching/updating/caching data on the server
- [Zustand](https://github.com/pmndrs/zustand) - easy state-management
- [React router](https://reactrouter.com/en/main) - for routing
- [Cypress](https://www.cypress.io/) - end-to-end testing for your frontend
- [Storybook](https://storybook.js.org/) - build your UI web components in isolation

#### Frontend UI

- [ChakraUI](https://chakra-ui.com/) - UI library that lets you create beautiful interfaces quickly
- [Framer Motion](https://www.framer.com/motion/) - create beautiful motion animations ([compatible with ChakraUI](https://chakra-ui.com/getting-started/with-framer))
- [React Icons](https://react-icons.github.io/react-icons/) - icons for your app
- [React-toastify](https://fkhadra.github.io/react-toastify/introduction) - show notifications when something happens

### Backend

- [Fastify](https://www.fastify.io/) - fast web framework for NodeJS
- [Prisma](https://www.prisma.io/) - new generation ORM for working with relational databases
- [Zod](https://github.com/colinhacks/zod) - TypeScript-first schema validation with static type inference
- [dotenv](https://www.npmjs.com/package/dotenv) - to load your configs from an .env file
- [env-var](https://www.npmjs.com/package/env-var) - validate and sanitize your environmental variables

### Shared libraries

- [tRPC](https://trpc.io/) - Remote Procedure Calls for your TypeScript applications. Move faster by removing the need of a traditional API-layer.
- [NX](https://nx.dev/) - build system with first class monorepo support and powerful integrations
- [Jest](https://jestjs.io/) - testing framework
- [Eslint](https://eslint.org/) - static code analysis for identifying problematic patterns found in your code

## Starting the app

### For Windows Users
If you're on Windows:

1. Clone the repository
2. Run `setup.bat` - This will automatically download and install Node.js if needed, install dependencies, and setup the SQLite database
3. Run `start.bat` - This will start the backend and frontend servers in separate windows
4. (Optional) Run `db.bat` - This will open Prisma Studio to view and edit database tables

**Note:** The app uses SQLite (file-based database), so no additional database setup is required!

### Manual Setup (All Platforms)
- Clone the repository
- Install Node.js from https://nodejs.org/ if not already installed
- Copy `.env.example` and rename to `.env`
- `npm install` - install dependencies
- `npm run migrate:dev` - run migrations to create tables (uses SQLite)
- `npm run backend:dev` - run backend
- `npm run frontend:dev` - run frontend

