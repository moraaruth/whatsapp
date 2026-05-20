# WhatsApp Lead Tracker - Frontend

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Pages

- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard with stats
- `/leads` - Lead list with filters
- `/leads/:id` - Lead detail with chat
- `/profile` - User profile settings
- `/subscription` - Subscription management

## Services

- `api.js` - Axios instance with auth token
- `authService.js` - Authentication API calls
- `leadService.js` - Lead management API calls
- `mpesaService.js` - M-Pesa payment API calls

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Features

- Real-time lead status updates
- WhatsApp conversation history
- M-Pesa payment integration
- Dashboard analytics
- Lead filtering and search
- Follow-up management
