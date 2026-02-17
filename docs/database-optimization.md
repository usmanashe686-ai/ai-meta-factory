# Database Optimization Guide

## Indexes Added
- `User`: `email`, `createdAt`
- `Account`: `userId`
- `Session`: `userId`, `expires`
- `Project`: `userId`, `createdAt`, `name`
- `ApiKey`: `userId`, `createdAt`

## Apply Migrations
Run the following to create and apply the migration:

```bash
npx prisma migrate dev --name add_indexes
