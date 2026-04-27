# Storage Unit

A file storage web app where authenticated users can organize files into folders and share them with anyone via time-limited links — no account required to view a share.

![Storage Unit screenshot](./docs/screenshot.png)

## What it does

- Create folders and upload files into them
- Files are stored on Cloudinary; metadata lives in a PostgreSQL database
- Generate a shareable link for any folder that expires after a set number of days (1–365)
- Anyone with the link can browse the folder and see its files without logging in
- Authenticated users can rename or delete folders and files

## Tech stack

- **Node / Express** — server and routing
- **EJS** — server-rendered templates
- **PostgreSQL + Prisma** — database and ORM
- **Cloudinary** — file storage
- **Passport.js** — local authentication (email + password)
- **express-session + PrismaSessionStore** — persistent sessions backed by the database

## Security

- CSRF protection on all state-changing forms via `csrf-csrf` (double-submit cookie pattern)
- Passwords hashed with `bcryptjs`
- Rate limiting on login and account creation to slow brute-force attempts
- File type validation on upload — checks the actual file buffer, not just the extension
- Input validation on all user-supplied data before it touches the database

## Getting started

You'll need Node, a PostgreSQL database, and a Cloudinary account.

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```
DATABASE_URL=postgresql://user:password@localhost:5432/storage_unit
SESSION_SECRET=your-secret-here
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
BASE_URL=http://localhost:3000
```

3. Run the database migrations:

```bash
npx prisma migrate deploy
```

4. Start the server:

```bash
node app.js
```

App runs on `http://localhost:3000` by default.
