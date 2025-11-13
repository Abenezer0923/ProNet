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

## 🚀 Quick Start

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/Abenezer0923/ProNet.git
cd ProNet

# Start everything with Docker
./docker-start.sh
```

Then visit **http://localhost:3100** 🎉

### Manual Setup

```bash
# Start infrastructure
docker-compose up -d

# Install dependencies
cd services/api-gateway && npm install && cd ../..
cd services/user-service && npm install && cd ../..
cd frontend && npm install && cd ..

# Start services (3 terminals)
cd services/api-gateway && npm run start:dev
cd services/user-service && npm run start:dev
cd frontend && npm run dev
```

## 🌐 Access Points

| Service        | URL                          | Description          |
|----------------|------------------------------|----------------------|
| Frontend       | http://localhost:3100        | Next.js application  |
| API Gateway    | http://localhost:3000        | Main API endpoint    |
| User Service   | http://localhost:3001        | User management      |
| PostgreSQL     | localhost:5432               | Primary database     |
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
│ User Service (http://localhost:3001)│
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

- [Quick Start Guide](QUICK_START.md)
- [Features Implemented](FEATURES_IMPLEMENTED.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [Docker Guide](DOCKER_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)


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

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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

*Last Updated: 2024*
