# Airbnb Backend

A full-stack, server-side rendered application inspired by Airbnb, built with Node.js, Express, MongoDB, and Tailwind CSS.

## Features ✨

- **User Authentication**: Secure login and registration using `bcryptjs` and session management via `express-session` with MongoDB store.
- **Server-Side Rendering**: Dynamic view generation using `ejs`.
- **Database Integration**: Data modeling and interaction using `mongoose`.
- **File Uploads**: Handle user media and image uploads using `multer`.
- **Modern Styling**: Styled dynamically with `tailwindcss` integrated into the build process.

## Tech Stack 🛠️

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose
- **Templating Engine**: EJS
- **Styling**: Tailwind CSS
- **Utilities**: Multer, Bcryptjs, Express-Validator

## Getting Started 🚀

### Prerequisites

Make sure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (Ensure your local MongoDB server is running, or provide a remote connection string).

### Installation

1. Clone the repository and navigate to the project directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

This project uses `concurrently` to run both the Node server (via `nodemon`) and the Tailwind CSS compiler simultaneously.

To start the application in development mode, run:
```bash
npm start
```

The application will start, and the Tailwind compiler will watch for changes in your EJS templates. Open your browser and navigate to the port specified in your application (usually `http://localhost:3000`).

## Project Structure 📁

- `app.js`: The main entry point of the application.
- `controllers/`: Contains the logic for handling incoming requests and returning responses.
- `models/`: Defines the Mongoose schemas for the database collections.
- `routes/`: Defines the application's endpoints and routing logic.
- `views/`: Contains the EJS templates for server-side rendering.
- `public/`: Static assets including compiled CSS.
- `uploads/`: Directory designated for locally uploaded files.
- `utilities/`: Helper functions and utilities.
