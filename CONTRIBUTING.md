# Contributing to ProNet

Thank you for your interest in contributing to ProNet! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ProNet.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes locally
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

```bash
# Start the development environment
./docker-start.sh

# View logs
./docker-logs.sh

# Stop services
./docker-stop.sh
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Add comments for complex logic
- Use meaningful variable names

## Testing

Before submitting a PR:
- Test all authentication flows
- Test API endpoints
- Test frontend pages
- Ensure Docker builds successfully

## Pull Request Process

1. Update documentation if needed
2. Add screenshots for UI changes
3. Fill out the PR template
4. Wait for CI/CD checks to pass
5. Request review from maintainers

## Commit Messages

Use clear, descriptive commit messages:
- `feat: Add user profile page`
- `fix: Fix login redirect issue`
- `docs: Update README`
- `refactor: Improve auth service`

## Questions?

Open an issue or reach out to the maintainers.

Thank you for contributing! 🚀
