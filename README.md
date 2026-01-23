# ProNet - Professional Community Platform

[![CI/CD Pipeline](https://github.com/Abenezer0923/ProNet/actions/workflows/ci.yml/badge.svg)](https://github.com/Abenezer0923/ProNet/actions/workflows/ci.yml)
[![Code Quality](https://github.com/Abenezer0923/ProNet/actions/workflows/code-quality.yml/badge.svg)](https://github.com/Abenezer0923/ProNet/actions/workflows/code-quality.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern social platform where professionals connect, learn, and grow together through specialized communities.

![ProNet Banner](https://via.placeholder.com/1200x400/0ea5e9/ffffff?text=ProNet+-+Professional+Community+Platform)

## ✨ Features

- ✅ **User Authentication** - Secure JWT-based authentication
- ✅ **User Registration** - Easy account creation
- ✅ **User Dashboard** - Personalized user dashboard
- ✅ **Protected Routes** - Secure access control
- 🚧 **Communities** - Create and join professional communities (Coming soon)
- 🚧 **Posts & Feed** - Share knowledge and insights (Coming soon)
- 🚧 **Real-time Chat** - Connect with professionals (Coming soon)
- 🚧 **Mentorship** - Find mentors and mentees (Coming soon)

## 🚀 Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/Abenezer0923/ProNet.git
cd ProNet

# Build and start everything
docker compose up --build
```

Then visit **http://localhost:3100** (frontend) and **http://localhost:3000** (API Gateway). The user-service listens on **http://localhost:8000**. PostgreSQL is exposed on **localhost:5433**.

### Manual Development (without Docker)

In three terminals:

```bash
# 1) API Gateway
cd services/api-gateway
npm install
npm run start:dev

# 2) User Service
cd services/user-service
npm install
npm run start:dev

# 3) Frontend
cd frontend
npm install
npm run dev
```

Infrastructure defaults:
- Postgres: `localhost:5433` (container: `postgres:5432`)
- Redis: `localhost:6379`
- MongoDB: `localhost:27017`

## 🌐 Access Points

| Service        | URL/Port                     | Description          |
|----------------|------------------------------|----------------------|
| Frontend       | http://localhost:3100        | Next.js application  |
| API Gateway    | http://localhost:3000        | Main API endpoint    |
| User Service   | http://localhost:8000        | User management      |
| PostgreSQL     | localhost:5433 (host)        | Primary database     |
| Redis          | localhost:6379               | Cache & sessions     |
| MongoDB        | localhost:27017              | Document storage     |

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Browser (http://localhost:3100)  │
│         Frontend (Next.js)          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  API Gateway (http://localhost:3000)│
│         Routes & Auth               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ User Service (http://localhost:8000)│
│    Business Logic & Database        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  PostgreSQL + Redis + MongoDB       │
└─────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Databases**: PostgreSQL 15, Redis 7, MongoDB 7
- **CI/CD**: GitHub Actions

## 📊 Project Status

```
Authentication:     ████████████████████ 100%
User Management:    ████░░░░░░░░░░░░░░░░  20%
Communities:        ░░░░░░░░░░░░░░░░░░░░   0%
Posts & Feed:       ░░░░░░░░░░░░░░░░░░░░   0%
Real-time Chat:     ░░░░░░░░░░░░░░░░░░░░   0%
```

## 📚 Documentation

- The repository currently ships without additional Markdown guides (deprecated Render docs were removed).
- Key defaults: user-service `PORT=8000`, API Gateway `PORT=3000`, Postgres mapped to host `5433`.
- Deployment (current target): backend on Koyeb, database on Neon, frontend on Vercel.

## 🧪 Testing

### Test Authentication Flow

1. Visit http://localhost:3100
2. Click "Get Started"
3. Register a new account
4. You'll be redirected to the dashboard
5. Logout and login again

### Test API Endpoints

```bash
# Register
curl -X POST http://localhost:3000/api/users/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","profession":"Developer"}'

# Login
curl -X POST http://localhost:3000/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile (use token from login)
curl -X GET http://localhost:3000/api/users/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🤝 Contributing

We welcome contributions! Fork the repo, open a branch, and submit a PR. With the auxiliary guides removed, please include any setup notes relevant to your changes in your PR description.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Abenezer** - [GitHub](https://github.com/Abenezer0923)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [NestJS](https://nestjs.com/)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
- Containerized with [Docker](https://www.docker.com/)

## 📞 Support

- 📧 Email: [Create an issue](https://github.com/Abenezer0923/ProNet/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Abenezer0923/ProNet/discussions)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/Abenezer0923/ProNet/issues)

## 🗺️ Roadmap

- [x] User Authentication
- [x] User Dashboard
- [ ] User Profile Management
- [ ] Communities System
- [ ] Posts & Comments
- [ ] Real-time Chat
- [ ] Mentorship Matching
- [ ] Events & Webinars
- [ ] Mobile App

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/Abenezer0923/ProNet?style=social)
![GitHub forks](https://img.shields.io/github/forks/Abenezer0923/ProNet?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/Abenezer0923/ProNet?style=social)

---

**Built with ❤️ for professional communities**

*Last Updated: 2026*
