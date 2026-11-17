# Database Schema

**Database:** MongoDB Atlas, accessed with Mongoose.  
**Status:** models exist; no live migration or persistence test has been run.

## `users`

| Field                     | Type                          | Notes                              |
| ------------------------- | ----------------------------- | ---------------------------------- |
| `_id`                     | ObjectId                      | Primary key                        |
| `googleId`                | string                        | Unique; verified Google `sub` only |
| `email`                   | string                        | Provider email                     |
| `emailNormalized`         | string                        | Indexed; normalized email          |
| `name`                    | string                        | Display name                       |
| `avatarUrl`               | string \| null                | Optional provider image            |
| `preferences.theme`       | `system` \| `light` \| `dark` | Default `system`                   |
| `createdAt` / `updatedAt` | Date                          | Mongoose timestamps                |

Indexes: unique `googleId`, secondary `emailNormalized`.

## `projects`

| Field                     | Type           | Notes                                |
| ------------------------- | -------------- | ------------------------------------ |
| `_id`                     | ObjectId       | Primary key                          |
| `userId`                  | ObjectId       | Indexed owner reference to `users`   |
| `name`                    | string         | Required, max 120                    |
| `sceneBrief`              | string         | Max 4000                             |
| `blueprint`               | object \| null | Validated blueprint, stored as Mixed |
| `audioAnalysis`           | object \| null | Numeric metrics only                 |
| `mixReport`               | object \| null | Validated qualified report           |
| `schemaVersion`           | number         | Default 1                            |
| `createdAt` / `updatedAt` | Date           | Mongoose timestamps                  |

Indexes: `{ userId: 1 }`, `{ userId: 1, updatedAt: -1 }`.

### `audioAnalysis` (embedded)

| Field                     | Type           | Notes                             |
| ------------------------- | -------------- | --------------------------------- |
| `channels`                | 1 \| 2         | Mono or stereo                    |
| `durationSeconds`         | number         | Positive                          |
| `samplePeakDbfs`          | number \| null | Sample peak, not true peak        |
| `rmsDbfs`                 | number \| null | RMS, not LUFS                     |
| `crestFactorDb`           | number \| null | Peak minus RMS                    |
| `bandEnergy.low/mid/high` | number         | Approximate normalized energy 0-1 |
| `stereoCorrelation`       | number \| null | Null for mono                     |

Raw audio is never stored. All project reads and writes must be scoped to the authenticated owner.

## `sessions`

Created and managed by `connect-mongo`.

| Field     | Type   | Notes                               |
| --------- | ------ | ----------------------------------- |
| `_id`     | string | Session id                          |
| `session` | object | Session payload, including `userId` |
| `expires` | Date   | TTL index managed by the store      |

TTL: 7 days. Cookie is `HttpOnly`, `SameSite=Lax`, `Secure` in production.

## Planned indexes and operations

- Verify session TTL cleanup on the deployed Atlas cluster.
- Confirm owner-scoped query patterns with `explain`.
- Add schema migration/version handling before changing stored shapes.
