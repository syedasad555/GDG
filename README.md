# GDG College Club Website

A complete, production-ready MERN stack application for managing a Google Developer Group (GDG) college chapter. Built with Node.js, Express.js, MongoDB, and React.js.

## Features

✅ **User Authentication**
- Secure JWT-based authentication
- Role-based access control (User/Admin)
- Member verification system

✅ **Event Management**
- Create, read, update, delete events
- Event registration system
- Upcoming and past events
- Event details with speaker information

✅ **Blog System**
- Create and publish blog posts
- Full-text search
- Like and comment functionality
- Author profiles

✅ **Gallery**
- Event-wise photo albums
- Image management
- Category filtering

✅ **Contests & Leaderboard**
- Contest management
- HackerRank score integration
- Weekly, monthly, and all-time leaderboards
- User rankings and badges

✅ **User Profiles**
- Profile customization
- Contest history
- Achievement badges
- HackerRank integration

✅ **Admin Dashboard**
- Comprehensive analytics
- Event management
- Blog management
- Contest management
- Member management
- User role management

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Material-UI** - Component library
- **Axios** - HTTP client
- **date-fns** - Date utilities

## Project Structure

```
gdg-college-club/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── styles/
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gdg-college-club
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES=90
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Database Setup

### MongoDB Collections

The application uses the following MongoDB collections:

- **users** - User accounts and profiles
- **events** - Event information
- **blogs** - Blog posts
- **galleries** - Photo galleries
- **contests** - Coding contests
- **leaderboards** - User rankings
- **gdgmembers** - GDG member verification list

### Sample Data

To populate the database with sample data, you can use MongoDB Compass or the MongoDB shell:

```javascript
// Add sample GDG members
db.gdgmembers.insertMany([
  {
    name: "John Doe",
    email: "john@example.com",
    rollNumber: "CS001",
    branch: "CSE",
    year: 3,
    role: "Core Team"
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    rollNumber: "IT002",
    branch: "IT",
    year: 2,
    role: "Member"
  }
]);
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)
- `POST /api/events/:id/register` - Register for event
- `POST /api/events/:id/save` - Save event
- `DELETE /api/events/:id/save` - Unsave event

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:slug` - Get blog by slug
- `POST /api/blogs` - Create blog (Admin)
- `PUT /api/blogs/:id` - Update blog (Admin)
- `DELETE /api/blogs/:id` - Delete blog (Admin)
- `POST /api/blogs/:id/like` - Like blog
- `POST /api/blogs/:id/comment` - Add comment

### Leaderboard
- `GET /api/leaderboard/weekly` - Weekly leaderboard
- `GET /api/leaderboard/monthly` - Monthly leaderboard
- `GET /api/leaderboard/all-time` - All-time leaderboard

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/members` - Get all members
- `POST /api/admin/members` - Add member
- `PUT /api/admin/members/:id` - Update member
- `DELETE /api/admin/members/:id` - Delete member

## Color Palette

The application uses the official GDG color palette:

- **Blue** - #4285F4 (Primary)
- **Green** - #0F9D58 (Secondary)
- **Red** - #DB4437 (Error)
- **Yellow** - #F4B400 (Warning)

## Performance Optimization

- **Caching** - Leaderboard results are cached for high performance
- **Lazy Loading** - Images and components are lazy-loaded
- **Code Splitting** - React Router enables code splitting
- **Database Indexing** - Text indexes on searchable fields
- **Responsive Design** - Mobile-first approach

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Role-Based Access Control** - Admin and user roles
- **CORS** - Cross-origin resource sharing configured
- **Input Validation** - Server-side validation of all inputs
- **File Upload Validation** - Only image files allowed

## Deployment

### Backend Deployment (Heroku)

1. Create a Heroku account and install Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create your-app-name
```

4. Set environment variables:
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
```

5. Deploy:
```bash
git push heroku main
```

### Frontend Deployment (Netlify)

1. Build the React app:
```bash
npm run build
```

2. Deploy to Netlify:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@gdgcollegeclub.com or open an issue on GitHub.

## Acknowledgments

- Google Developer Groups for the inspiration
- Material-UI for the component library
- MongoDB for the database
- All contributors and community members

---

**Made with ❤️ by the GDG Community**
