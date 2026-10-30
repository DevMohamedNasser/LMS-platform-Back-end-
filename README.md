# LMS Backend

Backend API for an educational platform that connects students, teachers, and administrators. It provides authentication, grade-based learning materials and exams, exam submissions and results, real-time chat, GraphQL administration queries, file uploads through AWS S3, and Firebase device-token registration.

> **Documentation scope:** This README describes the backend functionality and interfaces shown in the implementation shared for this project. Features not present in that implementation are listed under [Known limitations and future work](#known-limitations-and-future-work).

## Table of Contents

- [Core Features](#core-features)
- [User Roles and Access](#user-roles-and-access)
- [Technology and Integrations](#technology-and-integrations)
- [API Base URL](#api-base-url)
- [Authentication API](#authentication-api)
- [Exams API](#exams-api)
- [Materials API](#materials-api)
- [Real-Time Chat](#real-time-chat)
- [GraphQL API](#graphql-api)
- [Data Models](#data-models)
- [File Upload Flow](#file-upload-flow)
- [Notifications](#notifications)
- [Environment Variables](#environment-variables)
- [Important Implementation Notes](#important-implementation-notes)
- [Known Limitations and Future Work](#known-limitations-and-future-work)

## Core Features

- Email/password registration and login.
- Email confirmation using an OTP.
- Resend confirmation OTP.
- Forgot-password and reset-password flows.
- Change password for authenticated users.
- Social login using a Google ID token.
- Access/refresh token flow.
- Admin role and student grade management.
- Soft deletion of users by an administrator.
- Grade-scoped exams and learning materials.
- Exam submission, scoring, and answer review.
- Material file upload and download using AWS S3 pre-signed URLs.
- Real-time, grade-based chat using Socket.IO.
- Admin-only GraphQL queries for users, exams, and exam results.
- Firebase device-token registration for push-notification delivery.

## User Roles and Access

The implementation uses two principal roles:

| Role | Capabilities represented in the backend |
|---|---|
| `USER` (student) | Access learning content and exams associated with the student's grade; participate in the chat room for that grade; submit exams and review submitted results. |
| `ADMIN` | Manage role/grade assignments; create and delete learning materials; create exams; access the administrative GraphQL queries; access chat grade rooms by supplying a grade. |

The backend enforces grade restrictions for students. An administrator can specify a grade when accessing grade-specific chat functionality.

## Technology and Integrations

The shared implementation uses or integrates with:

- **Node.js / Express** — HTTP API.
- **MongoDB / Mongoose** — persistence and data models.
- **Socket.IO** — real-time chat events.
- **GraphQL** — administrative data queries through `graphql-http`.
- **AWS S3** — material file storage using pre-signed URLs.
- **Firebase Admin / FCM** — device-token registration for push notifications.
- **JWT-based authentication** — access and refresh token flow.
- **Email OTP** — email confirmation and password recovery.

## API Base URL

The routes below are mounted under:

```text
/api/v1
```

For local development, use the host and port configured by the application, for example:

```text
http://localhost:PORT/api/v1
```

Replace `PORT` with the actual port configured in your environment.

## Authentication API

Base path:

```text
/api/v1/auth
```

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/signup` | Public | Register a user and initiate email OTP confirmation. |
| `PATCH` | `/confirm-email` | Public | Confirm the user's email using the OTP. |
| `PATCH` | `/resend-otp` | Public | Request another confirmation OTP. |
| `POST` | `/login` | Public | Authenticate using email and password. |
| `PATCH` | `/forget-password` | Public | Start the password-recovery flow. |
| `PATCH` | `/reset-password` | Public | Set a new password through the recovery flow. |
| `PATCH` | `/change-password` | Authenticated | Change the current user's password. |
| `POST` | `/social-login` | Public | Authenticate using a Google `idToken`. |
| `POST` | `/refresh-token` | Refresh token | Obtain a refreshed access-token flow. |
| `PATCH` | `/role/:id` | Admin | Change a user's role. |
| `PATCH` | `/grade` | Authenticated | Update the user's grade as supported by the route. |
| `DELETE` | `/soft/:id` | Admin | Soft-delete a user. |
| `POST` | `/enable-notifications` | Authenticated | Register an FCM device token and enable notifications. |

### Signup

`POST /api/v1/auth/signup`

The shared signup service accepts:

- `email`
- `password`
- `username`
- `phone` (optional)
- `grade` (optional)

A confirmation OTP is sent to the user's email. The user must confirm the email before logging in.

### Login

`POST /api/v1/auth/login`

The login flow uses `email` and `password`. The backend rejects login when the email has not been confirmed.

### Social Login

`POST /api/v1/auth/social-login`

The shared implementation uses a Google ID token (`idToken`) to authenticate the user.

### Change Password

`PATCH /api/v1/auth/change-password`

The service uses the user's email, current password, and `newPassword`.

### Enable Push Notifications

`POST /api/v1/auth/enable-notifications`

The request body contains:

```json
{
  "deviceToken": "FCM_DEVICE_TOKEN"
}
```

The backend adds the token to the user's `deviceTokens` collection without duplicating an existing token and sets `notificationEnabled` to `true`.

> The supplied implementation shows token registration. It does not show endpoints for notification history, marking notifications as read, disabling notifications, or removing a device token.

## Exams API

Base path:

```text
/api/v1/exam
```

All exam routes require authentication. Creating an exam is an admin operation.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/` | Admin | Create an exam. |
| `GET` | `/list-exams` | Authenticated | List exams available to the current user. |
| `GET` | `/:id` | Authenticated | Get an exam by ID. |
| `POST` | `/submit/:id` | Authenticated student | Submit answers for an exam. |

### Exam structure

An exam contains:

- `title`
- `grade`
- `durationMin`
- `questions`

Each question contains answer options and a correct-answer value. The supported correct-answer values are:

```text
a | b | c | d
```

The backend generates option ObjectIds.

### Student exam access and submission

- Students are restricted to exams for their own grade.
- Correct answers are not returned when a student initially fetches an exam.
- After submission, the response can include the score, correct answers, and wrong-answer review.
- The `ExamResult` model enforces one result per student and exam through a unique student/exam index.
- Exams and exam results have a three-day TTL configuration based on `createdAt` in the shared models.

## Materials API

Base path:

```text
/api/v1/material
```

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/` | Admin | Create a material and obtain an S3 upload URL. |
| `GET` | `/list-all` | Authenticated | List materials available to the current user. |
| `GET` | `/:id` | Authenticated | Get a material and its download URL(s). |
| `DELETE` | `/:id` | Admin | Delete a material. |

### Material access

- Materials are associated with a grade.
- Students can access materials for their own grade.
- Administrators can manage materials.
- Material records contain a title, optional content, grade, and a material key/string array as represented in the shared model.

### S3 upload behavior

Creating a material returns a pre-signed S3 upload URL and stores the relevant key. The client must upload the file directly to S3 using that URL. Retrieving a material generates pre-signed download URL(s).

The exact upload HTTP method and required headers should be taken from the actual pre-signed URL response and its implementation; they are not specified in the code summary used for this README.

## Real-Time Chat

The chat uses Socket.IO and separates conversations by grade.

### Room convention

```text
grade:<grade>
```

For example:

```text
grade:3
```

Students are bound to their own grade room by the server. Administrators must provide a valid grade when joining grade-specific chat rooms and can join the supported grade rooms.

### Client-to-server events

| Event | Payload | Purpose |
|---|---|---|
| `getGroups` | No required payload shown | Request available chat groups. |
| `sendMessage` | `{ "grade": "...", "content": "..." }` | Send a message to a grade conversation. |
| `getMessages` | `{ "grade": "...", "before": "...", "limit": 20 }` | Retrieve message history, optionally paginated. |
| `typing` | Grade/context as required by the socket handler | Notify other room members that the user is typing. |
| `stopTyping` | Grade/context as required by the socket handler | Notify other room members that the user stopped typing. |

The `grade` field is optional in some handlers for students because the server derives the student's grade. Administrators need to specify a valid grade.

### Server-to-client events

| Event | Data |
|---|---|
| `groups` | Available group/conversation information. |
| `newMessage` | The newly created message. |
| `messages` | `{ grade, messages, hasMore }` history response. |
| Typing broadcast | Sent when a room member starts typing. |
| Stop-typing broadcast | Sent when a room member stops typing. |

The message model stores `conversationId`, `senderId`, `content`, and timestamps. Message content is limited to 1–10,000 characters, and messages are indexed by conversation and creation time.

> Confirm the exact typing broadcast event names and payload fields against the socket handler before wiring the frontend; only the event behavior is established in the shared implementation summary.

## GraphQL API

The GraphQL endpoint is:

```text
/graphql
```

The shared implementation uses `graphql-http`.

### Queries

| Query | Arguments | Access | Purpose |
|---|---|---|---|
| `users` | `grade`, `page`, `limit` | Admin | Retrieve users with optional grade filtering and pagination. |
| `exams` | `grade`, `page`, `limit` | Admin | Retrieve exams with optional grade filtering and pagination. |
| `examResults` | `grade`, `page`, `limit` | Admin | Retrieve exam results with optional grade filtering and pagination. |

The `examResults` query populates the related student and exam data.

The supplied GraphQL schema includes an `ExamType` field for `correctAns`. Treat this as administrative data and do not expose correct answers to students through a client-side query.

## Data Models

The following summarizes the models shared for this project.

### User

Includes:

- `firstName`, `lastName`
- `email`, `password`
- `phone`, `address`, `profilePic`
- `grade`, `role`, `provider`
- `deviceTokens`, `notificationEnabled`
- `deletedAt`, `deletedBy`

A `username` virtual is available. JSON serialization removes the password and selected OTP-related fields.

### Conversation

Includes:

- `grade` — unique grade conversation.
- `lastMessage`
- `lastMessageAt`
- `lastMessageBy`

### Message

Includes:

- `conversationId`
- `senderId`
- `content`
- timestamps

The content length is constrained to 1–10,000 characters. An index supports fetching messages by conversation and creation time.

### Exam

Includes:

- `title`
- `grade`
- `questions` and options
- `correctAns`
- `durationMin`
- `createdAt`

A unique index is defined for `title` + `grade`. A three-day TTL index is configured on `createdAt`.

### ExamResult

Includes:

- `student`
- `exam`
- `grade`
- `startedAt`
- `score`
- `wrongAns`
- `createdAt`

A unique index prevents duplicate results for the same student and exam. A three-day TTL index is configured on `createdAt`.

### Material

Includes:

- `title`
- optional `content`
- `grade`
- `material` — stored material key/string array.

### Notification

The notification type enum includes:

- `New Exam`
- `New Material`
- `New Message`

A notification contains:

- `userId`
- `type`
- `title`
- `body`
- `readAt`

The shared code establishes the model/type structure, but does not establish a complete notification REST API.

## File Upload Flow

The material upload flow is:

1. An administrator sends a request to `POST /api/v1/material`.
2. The backend validates the material data, creates the material record, and returns a pre-signed S3 upload URL.
3. The frontend uploads the selected file directly to S3 using the returned URL.
4. The frontend can later request the material through `GET /api/v1/material/:id`.
5. The backend returns pre-signed download URL(s) for the stored material.

Do not send the file to an undocumented backend upload endpoint unless the implementation is changed to support that flow.

## Notifications

The backend contains:

- Notification types for new exams, new materials, and new messages.
- A notification model with recipient, type, title, body, and read timestamp.
- User fields for FCM device tokens and notification preference.
- An authenticated endpoint to register a device token.

The shared code does not confirm the complete process that creates and sends each notification. In particular, do not assume that every chat message, exam, or material automatically triggers an FCM push notification unless that behavior exists in the relevant service code.

## Environment Variables

The exact `.env` file was not included in the code summary used to prepare this README. The following are configuration areas that the application needs based on its integrations; use the exact variable names from the project's configuration files.

| Configuration | Purpose |
|---|---|
| MongoDB connection string | Connect to MongoDB. |
| JWT/access-token secrets and expiry settings | Sign and validate authentication tokens. |
| Refresh-token configuration | Support token refresh. |
| Email/SMTP credentials | Send OTP and account emails. |
| Google OAuth configuration | Verify Google social-login tokens, if required by the implementation. |
| AWS access/configuration and S3 bucket | Generate pre-signed material upload/download URLs. |
| Firebase service-account configuration | Initialize Firebase Admin for push-notification services. |
| Application port and allowed origins | Configure the Express server and CORS. |

Example template only — replace the names with the exact keys read by your application:

```env
PORT=
MONGO_URI=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=

# Email / SMTP
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

# Google authentication (if configured separately)
GOOGLE_CLIENT_ID=

# AWS S3
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Firebase Admin
FIREBASE_SYSTEM_ACCOUNT=

# Frontend origin
CLIENT_URL=
```

Never commit real secrets, private keys, service-account JSON, or production credentials to source control.

## Important Implementation Notes

- A student must not be able to request another grade's exams, materials, or chat room by changing a client-supplied grade.
- Do not return exam correct answers before the student submits the exam.
- Keep admin-only operations protected on the server; hiding admin UI controls is not authorization.
- Store and send the access token using the exact authorization-header format expected by the authentication middleware. The shared frontend/backend integration discussion used a role-prefixed format (`ADMIN` or `USER`) followed by the access token; verify the middleware's exact parser before implementation.
- Use the Socket.IO authentication mechanism and event payloads implemented by the server. Do not assume HTTP headers are automatically available in the same form inside socket handlers.
- S3 pre-signed URLs are temporary. Request a fresh URL when the backend's returned URL expires.
- The three-day TTL indexes mean MongoDB may automatically remove the relevant exam and result documents after their configured TTL period; TTL deletion is asynchronous, not an exact scheduled deletion time.
- The material creation route's shared middleware order places validation before authentication/authorization. Review this order if unauthenticated requests should be rejected before request-body validation.

## Known Limitations and Future Work

The following capabilities were not present in the backend code shared for this README. They should not be presented in the frontend as working backend features until corresponding endpoints/services are implemented:

- Attendance management and QR-code attendance.
- Courses, lessons, assignments, and assignment submissions.
- Payment, subscription, or billing management.
- Dashboard analytics and aggregate reporting endpoints.
- Profile update endpoint.
- Logout endpoint or explicit token-revocation flow.
- Notification list/history, mark-as-read, disable notifications, and remove-device-token endpoints.
- Material update endpoint.
- Dedicated user search and user-detail endpoints.
- A complete documented push-notification dispatch workflow.

## Frontend Integration Checklist

- [ ] Implement signup, email confirmation, login, forgot password, and reset password.
- [ ] Persist and refresh authentication tokens according to the backend contract.
- [ ] Build role-aware navigation for students and administrators.
- [ ] Restrict student exam and material views to the authenticated user's grade.
- [ ] Build the exam-taking and post-submission review flows.
- [ ] Implement the S3 pre-signed upload flow for administrators.
- [ ] Implement Socket.IO group listing, message history, sending, and typing indicators.
- [ ] Implement admin GraphQL screens for users, exams, and exam results.
- [ ] Register FCM device tokens after notification permission is granted.
- [ ] Hide or label frontend features that do not yet have backend support.
