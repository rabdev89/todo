# T-101: Initial Scaffolding

## Requirements
- Create `/web-applications/frontend` and `/web-applications/backend` directories.
- Frontend: `npm create vite@latest frontend -- --template react-ts`
- Backend: `npx @nestjs/cli new backend --package-manager npm`
- Setup a root `package.json` with workspace support or scripts for concurrent execution.

## Verification
- Run `npm run dev` in frontend and `npm run start:dev` in backend.
- Both apps should display default welcome screens.
