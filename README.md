
# Money Flow Guardian - Lovable Project

This guide helps you get your personal finance app running with Docker, supporting both PostgreSQL database (via Docker) and file-only (no database) modes.

---

## 1. Prerequisites

- [Docker installed](https://docs.docker.com/get-docker/)
- (Optional) [Docker Compose plugin](https://docs.docker.com/compose/)
- (Optional for development) [Node.js & npm if running locally](https://github.com/nvm-sh/nvm#installing-and-updating)

---

## 2. Setup and Run using Docker (Recommended)

You can run the app with or without PostgreSQL. By default, the database runs in a Docker container for persistent data.

### **A. Running with PostgreSQL enabled (Recommended)**

> The PostgreSQL container is used as a backend for persistent data storage.

**Step 1: Start the app (and DB) via Docker Compose**

```sh
# PostgreSQL will be enabled and running
POSTGRES_ENABLED=true docker-compose up -d
```
- The web app will be on [http://localhost:8080](http://localhost:8080).
- A PostgreSQL DB will be available (internal network).

**Step 2: Data Persistence**

- App data and localStorage will persist in `./data` (host).
- DB data will persist in `postgres_data` Docker volume.

**Step 3: Stop the app**
```sh
docker-compose down
```

---

### **B. Running without PostgreSQL**

1. Edit `docker-compose.yml` and comment out the entire `db:` service block.
2. Or set the variable (though Compose v3 doesn't fully disable services by env):

```sh
POSTGRES_ENABLED=false docker-compose up -d
```
_Note: The app may require an active DB for all functionality._

---

## 3. Customizing Database (PostgreSQL) Credentials

Default DB connection details can be changed in `docker-compose.yml`:
```yaml
POSTGRES_DB=financeapp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_HOST=db
```

---

## 4. Database Migrations

On container start, the app runs `migrate-postgres.sh` to ensure required tables exist in the PG database.

- To customize schema, edit `migrate-postgres.sh`.
- Example table creation is included for reference only.

---

## 5. Development Usage

For code contributions, fork/clone the repo, and use local node tooling (see Lovable docs or earlier README sections).

---

## 6. Authentication (Demo)

Login (demo/local):
- Email: `user@example.com`
- Password: `password`

For production changes (auth, DB, etc.), see Lovable and Docker documentation.

---

## 7. Troubleshooting

- If the app doesn't work, check logs using:
  ```sh
  docker-compose logs
  ```
- Ensure ports 8080 (frontend) and 5432 (DB) are available.
- For DB issues, inspect `migrate-postgres.sh`, environment variables, and Docker volumes.

---

## Documentation

For detailed documentation about the application, please see the [Documentation](./docs/README.md) directory, which includes:

- [Getting Started](./docs/getting-started.md)
- [Features Overview](./docs/features/README.md)
- [Architecture](./docs/architecture.md)
- [API Documentation](./docs/api/README.md)
- [User Guide](./docs/user-guide/README.md)
- [Development Guide](./docs/development-guide.md)
- [Version Management](./docs/version-management.md)

## Lovable Project Online

App URL: https://lovable.dev/projects/d10d97f2-402f-47c1-9500-49c45556eadc

Read more at [Lovable Documentation](https://docs.lovable.dev/)
