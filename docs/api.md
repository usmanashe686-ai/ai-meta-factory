# API Documentation

## Base URL
- Production: `https://api.aimetafactory.com`
- Staging: `https://staging-api.aimetafactory.com`

## Authentication
Most endpoints require a JWT token. Include it in the `Authorization` header:

## Endpoints

### Health Check
`GET /health` – returns service status.

### Projects
- `GET /api/projects` – list user projects.
- `POST /api/projects` – create a new project.
- `GET /api/projects/:id` – get project details.
- `PUT /api/projects/:id` – update project.
- `DELETE /api/projects/:id` – delete project.

### AI
- `POST /api/ai/generate` – generate code.
- `POST /api/ai/explain` – explain code.
- `POST /api/ai/fix` – fix code errors.
- `POST /api/ai/optimize` – optimize code.

### Exports
- `POST /api/exports` – request an export (ZIP, APK, etc.).
- `GET /api/exports/:id/status` – check export status.
- `GET /api/exports/:id/download` – download artifact.

### Admin
- `GET /api/admin/users` – list users.
- `DELETE /api/admin/users/:id` – delete user.
- `POST /api/admin/users/:id/toggle-admin` – change admin status.
- `GET /api/admin/stats` – platform statistics.

For detailed request/response schemas, refer to the OpenAPI spec (coming soon).
