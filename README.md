
# Welcome to your Lovable project - Money Flow Guardian

## Project info

**URL**: https://lovable.dev/projects/d10d97f2-402f-47c1-9500-49c45556eadc

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d10d97f2-402f-47c1-9500-49c45556eadc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Docker Support

This project includes Docker support for easy deployment and consistent development environments.

### Running with Docker + PostgreSQL

By default, PostgreSQL runs as a separate container for persistent data. If you wish to **use PostgreSQL**, simply use:

```sh
POSTGRES_ENABLED=true docker-compose up -d
```

If you **do not want PostgreSQL enabled** at startup:
- Edit `docker-compose.yml` and comment out the `db:` service section before running `docker-compose up`.
- Alternatively, set `POSTGRES_ENABLED=false` (though a truly conditional service requires Compose v3.9 or higher with `profiles`, not yet used here).

### Running Custom Migrations

The app will automatically execute the `migrate-postgres.sh` script to create any tables needed in PostgreSQL on container startup.
You may update this script (`migrate-postgres.sh`) to fit your schema and migration needs.

### Database Credentials

- Default database: `financeapp`
- User: `postgres`
- Password: `postgres123`
- Host: `db` (internal Docker network)

To change these, update the environment variables in `docker-compose.yml`.

## Authentication

The application includes a simple authentication system. To log in, use these credentials:

- Email: user@example.com
- Password: password

For production use, it's recommended to integrate with a secure authentication provider.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Query
- React Router

## How can I deploy this project?

You have multiple options for deployment:

1. Simply open [Lovable](https://lovable.dev/projects/d10d97f2-402f-47c1-9500-49c45556eadc) and click on Share -> Publish.

2. Use Docker to deploy to any platform that supports Docker containers.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
