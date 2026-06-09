# StatGPT Admin Frontend

StatGPT Admin Frontend is a Next.js application for administering StatGPT data sources, datasets, channels, documents, and audit logs. The application is built as an Nx workspace and uses the Next.js App Router.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/license/mit)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb.svg)](https://react.dev/)
[![Nx](https://img.shields.io/badge/Nx-22.5.3-7F52FF.svg)](https://nx.dev/)

## Table of Contents

- [🏗️ Architecture Overview](#-architecture-overview)
- [🚀 Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Start](#start)
- [💻 Development](#-development)
  - [Development Setup](#development-setup)
- [🔨 Build](#-build)
- [🐳 Docker](#-docker)
- [🧪 Test](#-test)
- [🧑‍💻 Environment Variables](#-environment-variables)
  - [Application Variables](#application-variables)
  - [Authentication Variables](#authentication-variables)
  - [Auth Provider Variables](#auth-provider-variables)
  - [Security and Diagnostics Variables](#security-and-diagnostics-variables)
- [🤝 Contributing](#-contributing)
- [🔒 Security](#-security)
- [📄 License](#-license)
- [🌟 Related Projects](#-related-projects)

## 🏗️ Architecture Overview

This project uses:

- **Next.js 16** with App Router for the frontend framework
- **React 19** for UI components
- **Nx 22** for workspace organization and tooling
- **TypeScript 5.9** for type safety
- **Tailwind CSS 3.4** and SCSS for styling
- **NextAuth.js 4** for optional authentication
- **Jest 30** for tests

## 🚀 Quick Start

### Prerequisites

- Node.js >= 24.14.0
- npm >= 11.11.0

### Start

```bash
npm install
cp .env.template apps/statgpt-admin-frontend/.env
npm run start
```

Edit `apps/statgpt-admin-frontend/.env` before using the application. For a functional local setup, provide at least:

```bash
API_URL="ADD_VALUE_HERE"
DIAL_API_URL="ADD_VALUE_HERE"
NEXTAUTH_SECRET="ADD_VALUE_HERE"
```

After the server starts, open `http://localhost:4100`.

## 💻 Development

### Development Setup

1. Clone the repository.

   ```bash
   git clone https://github.com/epam/statgpt-admin-frontend.git
   cd statgpt-admin-frontend
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create the app env file from the template.

   ```bash
   cp .env.template apps/statgpt-admin-frontend/.env
   ```

4. Configure environment variables in `apps/statgpt-admin-frontend/.env`.

5. Start the development server.

   ```bash
   npm run start
   ```

The `start` script runs `nx serve statgpt-admin-frontend --port=4100`.

## 🔨 Build

```bash
npm run build
```

The production build is written to `dist/apps/statgpt-admin-frontend`.

## 🐳 Docker

The Docker image builds the application and runs the generated production Next.js app. The container exposes port `3000`.

```bash
docker build -t statgpt-admin-frontend .
docker run --env-file apps/statgpt-admin-frontend/.env -p 3000:3000 statgpt-admin-frontend
```

## 🧪 Test

Run the unit test suite:

```bash
npm run test
```

Additional quality checks:

```bash
npm run lint
npm run format
```

## 🧑‍💻 Environment Variables

Environment variables are loaded from `apps/statgpt-admin-frontend/.env` for local development. Use `.env.template` as the starting point.

### Application Variables

| Variable             |                Required                | Description                                                                                                                                             | Example / Values                      | Default |
| -------------------- | :------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------- |
| `API_URL`            |      Yes for main admin features       | StatGPT Backend API URL. See [StatGPT Backend](https://github.com/epam/statgpt-backend).                                                                | `https://statgpt-backend.example.com` |         |
| `DIAL_API_URL`       | Yes for document and indexing features | AI DIAL Core API URL. See [AI DIAL Core dynamic settings](https://github.com/epam/ai-dial-core?tab=readme-ov-file#dynamic-settings).                    | `https://dial-core.example.com`       |         |
| `DIAL_API_KEY`       |                   No                   | AI DIAL Core API key. Use it when DIAL Core requests should use an API key instead of the authenticated user's JWT.                                     | Any string                            |         |
| `DISABLE_MENU_ITEMS` |                   No                   | Comma-separated menu item IDs to hide. The current UI consumes `datasources`, `documents`, `channels`, and `audit-logs`; `datasources` hides two items. | `datasources,documents,audit-logs`    |         |

### Authentication Variables

Authentication is optional. If `NEXTAUTH_URL` is not set, application pages skip session checks. If `NEXTAUTH_URL` is set, configure `NEXTAUTH_SECRET` and at least one supported auth provider.

| Variable          |                       Required                       | Description                                                                                                   | Example / Values         | Default |
| ----------------- | :--------------------------------------------------: | ------------------------------------------------------------------------------------------------------------- | ------------------------ | ------- |
| `NEXTAUTH_URL`    |       Required when authentication is enabled        | Public application URL used by NextAuth.js. Required for production auth deployments.                         | `http://localhost:4100`  |         |
| `NEXTAUTH_SECRET` | Recommended locally; required for authenticated runs | Secret used by NextAuth.js to sign and encrypt JWT/session data. Generate one with `openssl rand -base64 32`. | Any strong random string |         |

### Auth Provider Variables

Current code wires Auth0, Azure AD, Google, Keycloak, Cognito, and Okta providers in `apps/statgpt-admin-frontend/src/utils/auth/auth-providers.ts`. GitLab and PingID placeholders may exist in `.env.template`, but they are not active providers unless code support is added.

| Variable                  | Required to enable provider | Description            | Default value                                   |
| ------------------------- | :-------------------------: | ---------------------- | ----------------------------------------------- |
| `AUTH_AUTH0_CLIENT_ID`    |        Yes for Auth0        | Auth0 client ID        |                                                 |
| `AUTH_AUTH0_SECRET`       |        Yes for Auth0        | Auth0 client secret    |                                                 |
| `AUTH_AUTH0_HOST`         |        Yes for Auth0        | Auth0 issuer URL       |                                                 |
| `AUTH_AUTH0_AUDIENCE`     |             No              | Auth0 audience         |                                                 |
| `AUTH_AUTH0_NAME`         |             No              | Provider display name  | `SSO`                                           |
| `AUTH_AUTH0_SCOPE`        |             No              | Auth0 OAuth scopes     | `openid email profile offline_access`           |
| `AUTH_AZURE_AD_CLIENT_ID` |      Yes for Azure AD       | Azure AD client ID     |                                                 |
| `AUTH_AZURE_AD_SECRET`    |      Yes for Azure AD       | Azure AD client secret |                                                 |
| `AUTH_AZURE_AD_TENANT_ID` |      Yes for Azure AD       | Azure AD tenant ID     |                                                 |
| `AUTH_AZURE_AD_NAME`      |             No              | Provider display name  | `SSO`                                           |
| `AUTH_AZURE_AD_SCOPE`     |             No              | Azure AD OAuth scopes  | `openid profile user.Read email offline_access` |
| `AUTH_GOOGLE_CLIENT_ID`   |       Yes for Google        | Google client ID       |                                                 |
| `AUTH_GOOGLE_SECRET`      |       Yes for Google        | Google client secret   |                                                 |
| `AUTH_GOOGLE_NAME`        |             No              | Provider display name  | `SSO`                                           |
| `AUTH_GOOGLE_SCOPE`       |             No              | Google OAuth scopes    | `openid email profile offline_access`           |
| `AUTH_KEYCLOAK_CLIENT_ID` |      Yes for Keycloak       | Keycloak client ID     |                                                 |
| `AUTH_KEYCLOAK_SECRET`    |      Yes for Keycloak       | Keycloak client secret |                                                 |
| `AUTH_KEYCLOAK_HOST`      |      Yes for Keycloak       | Keycloak issuer URL    |                                                 |
| `AUTH_KEYCLOAK_NAME`      |             No              | Provider display name  | `SSO`                                           |
| `AUTH_KEYCLOAK_SCOPE`     |             No              | Keycloak OAuth scopes  | `openid email profile offline_access`           |
| `AUTH_COGNITO_CLIENT_ID`  |       Yes for Cognito       | Cognito client ID      |                                                 |
| `AUTH_COGNITO_SECRET`     |       Yes for Cognito       | Cognito client secret  |                                                 |
| `AUTH_COGNITO_HOST`       |       Yes for Cognito       | Cognito issuer URL     |                                                 |
| `AUTH_COGNITO_NAME`       |             No              | Provider display name  | `SSO`                                           |
| `AUTH_COGNITO_SCOPE`      |             No              | Cognito OAuth scopes   | `openid email profile`                          |
| `AUTH_OKTA_CLIENT_ID`     |        Yes for Okta         | Okta client ID         |                                                 |
| `AUTH_OKTA_CLIENT_SECRET` |        Yes for Okta         | Okta client secret     |                                                 |
| `AUTH_OKTA_ISSUER`        |        Yes for Okta         | Okta issuer URL        |                                                 |
| `AUTH_OKTA_SCOPE`         |             No              | Okta OAuth scopes      | `openid email profile`                          |

### Security and Diagnostics Variables

| Variable                  | Required | Description                                                                  | Example / Values             | Default  |
| ------------------------- | :------: | ---------------------------------------------------------------------------- | ---------------------------- | -------- |
| `ALLOWED_FRAME_ANCESTORS` |    No    | Value used for the CSP `frame-ancestors` directive.                          | `'self' https://example.com` | `'none'` |
| `SHOW_TOKEN_SUB`          |    No    | Set to `true` to include token subject values in token refresh log messages. | `true`, `false`              | `false`  |

## 🤝 Contributing

See the [Contributing Guide](./CONTRIBUTING.md) for details on code style, testing requirements, and the pull request process.

## 🔒 Security

If you discover a security vulnerability, see the [Security Policy](./SECURITY.md).

## 📄 License

[MIT](./LICENSE) - see the [LICENSE](./LICENSE) file for details.

## 🌟 Related Projects

- [StatGPT Backend](https://github.com/epam/statgpt-backend) - backend APIs and main StatGPT application logic.
- [AI DIAL Core](https://github.com/epam/ai-dial-core) - AI DIAL Core service used for DIAL integrations.

---

<p align="center">
  Made by <a href="https://www.epam.com">EPAM Systems</a>
</p>
