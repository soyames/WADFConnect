# WADF Connect Platform

> West Africa Design Forum - Central Digital Hub

A comprehensive event management platform for conferences, featuring ticketing, call for proposals (CFP), agenda management, networking, and analytics.

## 🚀 Live Demo

**GitHub Pages (Static)**: [https://soyames.github.io/WADFConnect/](https://soyames.github.io/WADFConnect/)

## ✨ Features

### Core Features
- 🎫 **Ticket Management** - Multiple ticket types, Paystack integration
- 📝 **Call for Proposals (CFP)** - Submit and review session proposals
- 📅 **Agenda Management** - Dynamic session scheduling
- 🤝 **Networking** - Connect with attendees, direct messaging
- 🏆 **Session Ratings** - Rate and review sessions
- 📊 **Analytics Dashboard** - Real-time metrics and insights
- 💼 **Sponsorship Management** - Tiered sponsor packages
- 📜 **Digital Certificates** - PDF certificate generation
- 🌍 **Multi-language Support** - English, French, Arabic, Portuguese

### Technical Features
- ⚡ **Fast Performance** - Vite build system
- 📱 **Responsive Design** - Mobile-first approach
- 🎨 **Modern UI** - Tailwind CSS + shadcn/ui components
- 🔐 **Secure Authentication** - Session-based auth with security middleware
- 🗄️ **Flexible Database** - PostgreSQL or MongoDB support
- 🔄 **Real-time Updates** - WebSocket support
- 🐳 **Docker Ready** - Multi-stage Dockerfile included

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Wouter** - Lightweight routing
- **React Query** - Data fetching
- **i18next** - Internationalization

### Backend
- **Express** - Node.js server
- **Drizzle ORM** - Database toolkit
- **PostgreSQL/MongoDB** - Databases
- **Passport.js** - Authentication
- **Helmet** - Security headers
- **Rate limiting** - DDoS protection

## 📦 Installation

### Prerequisites
- Node.js 20+
- PostgreSQL or MongoDB
- npm or yarn

### Quick Start

```bash
# Clone repository
git clone https://github.com/soyames/WADFConnect.git
cd WADFConnect

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:5000`

## 🐳 Docker Deployment

### Build Static Frontend (GitHub Pages)

```bash
docker build --target builder -t wadf-frontend .
docker create --name extract wadf-frontend
docker cp extract:/app/dist/public ./dist/public
docker rm extract
```

### Build Full-Stack (Production)

```bash
# Build image
docker build --target production -t wadf-platform .

# Run container
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e SESSION_SECRET="your-secret" \
  wadf-platform
```

## 🌐 Deployment Options

### GitHub Pages (Static Only)
✅ Free hosting  
❌ No backend/database  
📖 [Setup Guide](./GITHUB-PAGES-SETUP.md)

```bash
# Automatically deploys on push to main
git push origin main
```

### Vercel (Recommended)
✅ Full-stack support  
✅ Free tier available  
✅ PostgreSQL support  

```bash
npm i -g vercel
vercel
```

### Railway
✅ Full-stack hosting  
✅ Built-in PostgreSQL  
✅ Auto-deploy from Git  

1. Connect repo at [railway.app](https://railway.app)
2. Add PostgreSQL database
3. Configure environment variables

### Render
✅ Full-stack hosting  
✅ Free tier available  
✅ PostgreSQL support  

1. Connect repo at [render.com](https://render.com)
2. Create Web Service + PostgreSQL
3. Set environment variables

### Docker (Self-Hosted)

```bash
docker-compose up -d
```

See `docker-compose.yml` for configuration.

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/wadf
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=wadf

# Session
SESSION_SECRET=your-random-secret-min-32-chars

# Payment (Optional)
PAYSTACK_SECRET_KEY=your-paystack-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key

# Node
NODE_ENV=development
PORT=5000
```

### Database Setup

```bash
# PostgreSQL
npm run db:push

# MongoDB (if using mongodb-storage.ts)
# No migration needed
```

## 📖 Documentation

- [GitHub Pages Setup](./GITHUB-PAGES-SETUP.md) - Deploy static site
- [Installation Guide](./INSTALLATION.md) - Detailed setup
- [Design Guidelines](./design_guidelines.md) - UI/UX standards
- [Download Instructions](./DOWNLOAD-INSTRUCTIONS.md) - Download guide

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build full-stack (client + server)
npm run build:client # Build client only (GitHub Pages)
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema
```

### Project Structure

```
WADFConnect/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── lib/         # Utilities
│   │   └── i18n/        # Translations
│   ├── index.html       # HTML entry
│   └── public/          # Static assets
├── server/              # Backend Express app
│   ├── index.ts         # Server entry
│   ├── routes.ts        # API routes
│   ├── db.ts            # Database connection
│   ├── security.ts      # Security middleware
│   └── storage.ts       # Data access layer
├── shared/              # Shared types
│   └── schema.ts        # Database schema
├── .github/             # GitHub Actions
│   └── workflows/
│       └── deploy.yml   # Deployment workflow
├── Dockerfile           # Multi-stage Docker build
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## 🔐 Security Features

- Session-based authentication
- Rate limiting (10k req/min per IP)
- Bot detection & blocking
- SQL/NoSQL injection protection
- XSS prevention
- CSRF protection
- Helmet security headers
- Input sanitization
- Email validation
- Pattern analysis
- Honeypot traps

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👥 Authors

- **WADF Team** - [West Africa Design Forum](https://wadf.org)

## 🙏 Acknowledgments

- Built with [Replit](https://replit.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## 📞 Support

- 📧 Email: support@wadf.org
- 🐛 Issues: [GitHub Issues](https://github.com/soyames/WADFConnect/issues)
- 📖 Docs: [GitHub Wiki](https://github.com/soyames/WADFConnect/wiki)

---

**Made with ❤️ for the West Africa Design Community**
