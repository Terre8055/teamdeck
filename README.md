# Teamdeck - RGT DevOps Backstage Platform

A comprehensive [Backstage.io](https://backstage.io/) platform designed for DevOps teams, featuring automated GitHub repository access management, catalog-driven development workflows, and integrated authentication systems.

## 🚀 Features

### Core Platform
- **Service Catalog**: Centralized repository and service discovery
- **Scaffolder**: Template-based project scaffolding
- **Search**: Full-text search across services, documentation, and APIs

### GitHub Access Management
- **Automated Access Control**: Self-service GitHub repository access requests
- **Permission Management**: Grant/update read, write, or admin permissions
- **GitHub App Integration**: Secure authentication using GitHub Apps
- **Organization-wide Coverage**: Manage access across RGT-DevOps organization

### Authentication & Authorization
- **Multi-Provider Support**: GitHub OAuth and Google OAuth integration
- **Session Management**: Secure user session handling

### Developer Experience
- **AWS Integration**: Deploy and manage services
- **Notifications & Signals**: Real-time updates and alerts
- **Custom Plugins**: Extensible plugin architecture


## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Authentication**: GitHub OAuth, Google OAuth
- **GitHub Integration**: GitHub Apps, Octokit
- **Documentation**: TechDocs with Docker-based generation
- **Containerization**: Docker support for deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or 22
- PostgreSQL
- GitHub App (for repository access management)
- Docker (for TechDocs generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Terre8055/teamdeck.git
   cd teamdeck
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Configure GitHub App**
   - Create a GitHub App in your organization
   - Install it on the RGT-DevOps organization
   - Update credentials in `github-app-*-credentials.yaml` files

5. **Start the development server**
   ```bash
   yarn start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:7007

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# GitHub Integration
GITHUB_INTEGRATION_TOKEN=your_github_token
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_INSTALLATION_ID=your_github_app_installation_id

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database
DATABASE_PASSWORD=your_postgres_password

# Session
AUTH_SESSION_SECRET=your_session_secret
```

### GitHub App Setup

1. Create a GitHub App with the following permissions:
   - **Repository permissions**:
     - Contents: Read
     - Metadata: Read
     - Administration: Write (required for collaborator management)
   - **Subscribe to events**: Repository events

2. Install the GitHub App on your organization

3. Update the credential files with your app details

## 🔧 GitHub Access Management

The platform includes a custom GitHub Access Management feature that allows users to:

- **Request Repository Access**: Submit access requests through the UI
- **Manage Permissions**: Grant read, write, or admin access levels
- **Track Changes**: View permission history and updates
- **Organization Integration**: Works with RGT-DevOps GitHub organization

### Usage

1. Navigate to the "RGT GitHub Access Management" page
2. Select the project group and specific repository
3. Enter the GitHub username and desired access level
4. Submit the request - access is granted automatically via GitHub App

## 🧪 Development

### Running Tests

```bash
yarn test
```

### Building for Production

```bash
yarn build:all
```

### Linting

```bash
yarn lint
```

## 📚 Documentation

- [Backstage.io Documentation](https://backstage.io/docs/)
- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Plugin Development Guide](https://backstage.io/docs/plugins/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## �� License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the RGT DevOps team
- Check the [Backstage.io community](https://discord.gg/backstage)

## 🏷️ Version

Current version: 1.0.0

---

Built with ❤️ by the RGT DevOps Team  using [Backstage.io](https://backstage.io/)
