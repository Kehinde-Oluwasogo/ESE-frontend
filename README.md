# ESE Booking System Frontend

Frontend for the ESE booking system, built with React and Vite.

## Overview

This repository contains the user interface for authentication, profile management, bookings, and admin-facing management screens.

## Frontend Stack

- React 19
- Vite 7
- React Router DOM 7
- CSS
- ESLint

## Project Structure

```text
.
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── instructions.txt
└── README.md
```

## Key UI Features

- Registration, login, and password reset flows
- Protected routes with auth context
- Profile and profile picture upload support
- Booking creation and booking history views
- Admin management and user management screens

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
cd frontend
npm install
```

### Run Dev Server

```bash
npm run dev
```

The app runs at http://localhost:3000.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

Notes:
- All client environment variables must start with `VITE_`.
- Keep secrets out of the frontend; only expose values safe for client-side usage.

## Frontend Deployment Notes

- Build output directory: `frontend/dist`
- Configure your hosting provider for SPA routing so all non-file routes resolve to `index.html`

## Documentation

### Core Documentation

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT SETUP](DEPLOYMENT.md) | Complete guide to deploying this application to Render, including setup, configuration, and troubleshooting |
| [CLOUDINARY SETUP](CLOUDINARY_SETUP.md) | Profile picture upload integration guide using Cloudinary, including setup instructions and backend integration |
| [TESTING](TESTING.md) | Comprehensive testing documentation covering unit tests, integration tests, test structure, and best practices |


### Deployment

To deploy this application to Render, see [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Prerequisites and preparation steps
- Step-by-step deployment instructions
- Environment variable configuration
- Post-deployment setup and verification
- Custom domain configuration
- Troubleshooting common deployment issues
- Performance optimization tips

### Testing

For comprehensive testing information, see [TESTING.md](TESTING.md) for:
- Test coverage overview (authentication, bookings, profile management, integration tests)
- How to run tests locally (`npm test`, `npm run test:run`)
- Test structure and patterns used in the project
- Mocking strategies for APIs and components
- CI/CD integration information
- Quality metrics and best practices
- Contributing guidelines for new tests

### Profile Picture Upload (Cloudinary)

To set up and integrate profile picture uploads, see [frontend/CLOUDINARY_SETUP.md](frontend/CLOUDINARY_SETUP.md) for:
- Install instructions and package setup
- Creating a Cloudinary account and getting credentials
- Environment variable configuration
- Creating upload presets in Cloudinary
- Frontend component implementation
- Backend integration examples (Django)
- API endpoint creation
- CSS styling ready for use

## Quick Links

- **Local Development:** Run `npm run dev` in the `frontend/` directory
- **Run Tests:** `npm test` or `npm run test:run` for CI mode
- **Build for Production:** `npm run build` in the `frontend/` directory
- **Deploy to Render:** Follow [DEPLOYMENT.md](DEPLOYMENT.md)
- **Set Up Profile Pictures:** Follow [frontend/CLOUDINARY_SETUP.md](frontend/CLOUDINARY_SETUP.md)

## Testing & Quality Assurance

This project includes comprehensive test coverage using Vitest and React Testing Library:
- **~64+ tests** across authentication, bookings, profile management, and integration workflows
- Unit tests for individual components
- Integration tests for complete user workflows
- Tests verify both happy paths and error scenarios

Run tests with: `npm test`

For detailed information on test structure, coverage, and best practices, see [TESTING.md](TESTING.md).

## Features & Components

### Authentication System
- User registration with validation
- Login with token-based authentication
- Password reset and recovery flows
- Protected routes with auth context
- Token refresh and session management

### Booking Management
- Create new bookings with form validation
- View booking history and status
- Edit existing bookings
- Delete bookings with confirmation
- Service selection and date/time picking

### Profile Management
- User profile editing
- Profile picture upload to Cloudinary
- User information display
- Admin and user management screens

### Admin Features
- User management interface
- Admin management screen
- Role-based access control

## Author

Kehinde Oluwasogo  
GitHub: https://github.com/KehindeOluwasogo-BC
