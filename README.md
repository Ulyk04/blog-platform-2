# Blog Platform

A full-stack blog platform built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete blog posts
- Like and comment on posts
- User profiles
- Tags for posts
- Responsive design

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI for styling
- React Router for navigation
- Axios for API requests

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd blog-platform
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blog-platform
JWT_SECRET=your-super-secret-key-change-this-in-production
```

4. Start the development servers:

```bash
# Start both frontend and backend (from root directory)
npm start

# Or start them separately:
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Posts
- GET `/api/posts` - Get all posts
- GET `/api/posts/:id` - Get a single post
- POST `/api/posts` - Create a new post
- PUT `/api/posts/:id` - Update a post
- DELETE `/api/posts/:id` - Delete a post
- PUT `/api/posts/:id/like` - Like/Unlike a post
- POST `/api/posts/:id/comments` - Add a comment to a post

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 