# R-CITY API Backend

A Node.js REST API for managing users, communities, sermons, and tags for the R-CITY application.

## Features

- User management with PostgreSQL integration
- Community management and memberships
- Sermon/preaching management with YouTube integration
- Tag system for categorizing content
- Database migrations and seeding

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Raw SQL queries with node-postgres (pg)
- **Environment**: dotenv for configuration

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   PORT=3000
   PGSSLMODE=require  # Optional, for SSL connections
   ```

4. Set up the database:
   ```bash
   npm run db:setup
   ```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database with initial data
- `npm run db:setup` - Run migrations and seed data

## API Routes

Base URL: `http://localhost:3000/api`

### Users (`/api/users`)

#### Create User
- **POST** `/api/users`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "passwordHash": "hashed_password",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "123-456-7890",
    "pcoPersonId": "pco_123"
  }
  ```
- **Returns**: User object with ID
- **Status Codes**: 
  - `201` - Created successfully
  - `400` - Missing required fields
  - `409` - Email or PCO person already exists
  - `500` - Server error

#### Get User by Email
- **GET** `/api/users/by-email/search?email=user@example.com`
- **Returns**: User object
- **Status Codes**: `200`, `400`, `404`, `500`

#### Get User by ID
- **GET** `/api/users/:id`
- **Returns**: User object
- **Status Codes**: `200`, `404`, `500`

#### Update User
- **PATCH** `/api/users/:id`
- **Body**:
  ```json
  {
    "firstName": "Updated Name",
    "lastName": "Updated Last",
    "phone": "new-phone"
  }
  ```
- **Returns**: Updated user object
- **Status Codes**: `200`, `404`, `500`

### Communities (`/api/communities`)

#### Create Community
- **POST** `/api/communities`
- **Body**:
  ```json
  {
    "name": "Community Name",
    "description": "Optional description",
    "pcoGroupId": "pco_group_123"
  }
  ```
- **Returns**: Community object with ID
- **Status Codes**: `201`, `400`, `409`, `500`

#### Get All Communities
- **GET** `/api/communities`
- **Returns**: Array of community objects
- **Status Codes**: `200`

#### Get Community by ID
- **GET** `/api/communities/:id`
- **Returns**: Community object
- **Status Codes**: `200`, `404`

#### Add Member to Community
- **POST** `/api/communities/:id/members`
- **Body**:
  ```json
  {
    "userId": 123
  }
  ```
- **Returns**: `{ "ok": true }`
- **Status Codes**: `200`, `400`, `500`

#### Get Community Members
- **GET** `/api/communities/:id/members`
- **Returns**: Array of user objects (members)
- **Status Codes**: `200`

### Tags (`/api/tags`)

#### Create Tag
- **POST** `/api/tags`
- **Body**:
  ```json
  {
    "name": "faith"
  }
  ```
- **Returns**: Tag object with ID
- **Status Codes**: `201`, `400`, `500`

#### Get All Tags
- **GET** `/api/tags`
- **Returns**: Array of tag objects sorted by name
- **Status Codes**: `200`

### Sermons (`/api/sermons`)

#### Create Sermon
- **POST** `/api/sermons`
- **Body**:
  ```json
  {
    "title": "Sermon Title",
    "youtubeUrl": "https://youtube.com/watch?v=abc123",
    "youtubeVideoId": "abc123",
    "description": "Optional description",
    "preacherName": "Pastor Name",
    "recordedAt": "2023-12-01T10:00:00Z"
  }
  ```
- **Returns**: Sermon object with ID
- **Status Codes**: `201`, `400`, `409`, `500`

#### Get All Sermons / Search Sermons
- **GET** `/api/sermons` - Get all sermons
- **GET** `/api/sermons?q=grace` - Search sermons by title/description
- **Returns**: Array of sermon objects
- **Status Codes**: `200`

#### Get Sermon by ID
- **GET** `/api/sermons/:id`
- **Returns**: Sermon object
- **Status Codes**: `200`, `404`

#### Attach Tags to Sermon
- **POST** `/api/sermons/:id/tags`
- **Body**:
  ```json
  {
    "names": ["faith", "grace", "hope"]
  }
  ```
- **Returns**: `{ "ok": true, "attached": ["faith", "grace", "hope"] }`
- **Status Codes**: `200`, `400`, `500`

#### Get Sermon Tags
- **GET** `/api/sermons/:id/tags`
- **Returns**: Array of tag objects associated with the sermon
- **Status Codes**: `200`

## Response Format

### Success Response
All successful responses return JSON data:
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2",
  "created_at": "2023-12-01T10:00:00.000Z"
}
```

### Error Response
Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `email` (TEXT, UNIQUE)
- `password_hash` (TEXT)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `phone` (TEXT, optional)
- `pco_person_id` (TEXT)
- `created_at` (TIMESTAMPTZ)

### Communities Table
- `id` (SERIAL PRIMARY KEY)
- `name` (TEXT)
- `description` (TEXT, optional)
- `pco_group_id` (TEXT, UNIQUE)
- `created_at` (TIMESTAMPTZ)

### Preachings Table
- `id` (SERIAL PRIMARY KEY)
- `title` (TEXT)
- `youtube_url` (TEXT)
- `youtube_video_id` (TEXT, UNIQUE)
- `description` (TEXT, optional)
- `preacher_name` (TEXT, optional)
- `recorded_at` (TIMESTAMPTZ, optional)
- `created_at` (TIMESTAMPTZ)

### Tags Table
- `id` (SERIAL PRIMARY KEY)
- `name` (TEXT, UNIQUE)

### Relationship Tables
- `community_memberships` - Links users to communities
- `preaching_topics` - Links sermons to tags

## Error Handling

The API includes comprehensive error handling:
- **400 Bad Request**: Missing required fields or invalid input
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate unique constraint violation
- **500 Internal Server Error**: Database or server errors

## CORS

CORS is enabled for all origins to support frontend development.

## Logging

Basic request logging is implemented, showing HTTP method and URL for each request.

## Development

The server includes automatic restart capabilities using nodemon for development:

```bash
npm run dev
```

This will start the server on `http://localhost:3000` and automatically restart when files change.