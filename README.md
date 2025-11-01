# Workspace - Slack Clone for Reinforcement Learning

A fullstack Slack clone built with React, TypeScript, Tailwind CSS, and Supabase. This project serves as a reinforcement learning environment for training AI agents to interact with team collaboration tools.

## 🎯 Project Overview

**URL**: https://lovable.dev/projects/3b1d2ce8-151a-417d-bf26-702d70a47e2e

This is a production-ready Slack clone featuring:

- 💬 **Real-time messaging** with WebSocket support
- 👥 **Channel management** (public channels and direct messages)
- 🎨 **Beautiful UI** matching Slack's professional aesthetic
- 🔐 **Authentication** with email/password and session management
- 📱 **Responsive design** for all screen sizes
- 🎭 **Reactions & threads** for rich interactions
- 🎬 **Smooth animations** using Framer Motion
- 🔔 **Activity tracking** and notifications

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Build Tool**: Vite

## 🚀 Features

### Core Functionality
- ✅ Real-time messaging with instant updates
- ✅ Channel creation and management
- ✅ Direct messaging between users
- ✅ Message reactions (emoji support)
- ✅ User profiles with avatars
- ✅ Typing indicators and online status
- ✅ File uploads and attachments
- ✅ Search functionality

### UI/UX
- ✅ Slack-inspired color palette (#611f69 purple)
- ✅ Smooth page transitions and micro-interactions
- ✅ Responsive sidebar with collapse functionality
- ✅ Beautiful authentication pages
- ✅ Loading states and skeleton screens
- ✅ Toast notifications for user feedback

### Security
- ✅ Email/password authentication
- ✅ Session persistence
- ✅ Protected routes
- ✅ Input validation
- ✅ SQL injection prevention via Supabase

## 📦 Installation

### Prerequisites
- Node.js 16+ installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or bun package manager

### Setup Steps

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install
# or
bun install

# Step 4: Set up environment variables
# Create a .env file with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Step 5: Start the development server
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── MessageArea.tsx # Chat interface
│   ├── WorkspaceSidebar.tsx # Navigation sidebar
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication hook
│   ├── useMessages.tsx # Message management
│   └── ...
├── pages/              # Route pages
│   ├── Auth.tsx        # Login/signup page
│   ├── Index.tsx       # Main chat page
│   └── ...
├── store/              # Zustand state management
├── integrations/       # Third-party integrations
│   └── supabase/       # Supabase client & types
└── index.css          # Global styles & design system
```

## 🎨 Design System

The project uses a comprehensive design system with:

- **Colors**: HSL-based color tokens for theming
- **Typography**: Lato font family with multiple weights
- **Spacing**: Consistent padding and margins
- **Shadows**: Layered shadow system
- **Animations**: Smooth transitions and micro-interactions

All design tokens are defined in `src/index.css` and `tailwind.config.ts`.

## 🔧 Development

### Available Scripts

```sh
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style

- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Use semantic HTML elements
- Implement proper error handling
- Write descriptive component names

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## 🚀 Deployment

### Deploy with Lovable

Simply open [Lovable](https://lovable.dev/projects/3b1d2ce8-151a-417d-bf26-702d70a47e2e) and click on Share → Publish.

### Manual Deployment

The project can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables on your hosting platform

## 🔒 Security Considerations

- All user inputs are validated both client-side and server-side
- Passwords are securely hashed by Supabase Auth
- SQL injection prevention via Supabase's query builder
- CORS configured for secure API access
- Environment variables for sensitive data

## 🤝 Contributing

This project follows the Lovable development workflow:

1. Make changes via the Lovable interface or locally
2. Changes are automatically committed to the repo
3. Test your changes thoroughly
4. Submit a pull request if working on a fork

## 📚 Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 🐛 Known Issues

None at the moment! The project has been thoroughly tested and polished.

## 📄 License

This project is part of the Lovable platform and follows its licensing terms.

## 🙏 Acknowledgments

- Slack for design inspiration
- Lovable team for the amazing platform
- shadcn for the beautiful UI components
- Supabase for the backend infrastructure

---

Built with ❤️ using [Lovable](https://lovable.dev)
