# Dopamine Digital Backend

Local Node backend for accounts, community posts, replies, private spaces, reports, blocking, notifications, admin controls, and membership flags.

Run it with:

```bash
npm run server
```

API base URL:

```txt
http://127.0.0.1:8787/api
```

The first registered user becomes `admin`. Data is stored in `server/data/db.json` for local development.

Main endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/spaces`
- `GET /api/posts?spaceId=public-support`
- `POST /api/posts`
- `POST /api/posts/:postId/comments`
- `POST /api/reports`
- `POST /api/blocks`
- `GET /api/notifications`
- `GET /api/admin/reports`
- `PATCH /api/admin/posts/:postId`
- `PATCH /api/admin/users/:userId`

Before public launch, move this to a production database and use HTTPS, secure cookies, email verification, rate limits, and stronger moderation tooling.
