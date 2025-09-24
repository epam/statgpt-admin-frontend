# StatGPT Admin Frontend

This project is a web application built using [Next.js](https://nextjs.org/), a React framework with server-rendering capabilities. It can be easily customized and adapted to your needs by following the steps mentioned below.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/mit)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![Nx](https://img.shields.io/badge/Nx-18+-7F52FF.svg)](https://nx.dev/)

## Table of Contents

- [🏗️ Architecture Overview](#-architecture-overview)
- [🚀 Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Start](#start)
- [💻 Development](#-development)
  - [Prerequisites](#prerequisites-1)
  - [Development Setup](#development-setup)
- [🔨 Build](#-build)
- [🧪 Test](#-test)
- [🧑‍💻 Environment Variables](#-Environment-Variables)
  - [Environment Variables for the Application](#environment-variables-for-the-application)
  - [Environment Variables for the Configuration of Auth Providers](#environment-variables-for-the-configuration-of-auth-providers)
- [🤝 Contributing](#-contributing)
- [🔒 Security](#-security)
- [📄 License](#-license)
- [🌟 Related Projects](#-related-projects)

## 🏗️ Architecture Overview

This project uses:

- **Next.js** with App Router for the frontend framework
- **Nx Monorepo** for project organization and tooling
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React** for building UI components
- **NextAuth.js** for authentication (optional)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22.19.0
- npm >= 11.0.0

### Start

```bash
npm install
mpn run start
```

## 💻 Development

### Prerequisites

- Node.js >= 22.19.0
- npm >= 11.0.0
- DIAL API access (for backend integration)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/epam/statgpt-admin-frontend.git
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set up env variables**

   Create `.env` file in the the `apps\statgpt-admin-frontend` project directory and add the required variables with appropriate values. These are the only required environment variables. Refer to [Environment Variables](#-environment-variables) to learn more.

   ```bash
   API_URL="ADD_VALUE_HERE"
   NEXTAUTH_SECRET="ADD_VALUE_HERE"
   ```

4. **Start Development Environment**
   ```bash
   npm run start
   ```

Once the server is up and running, open `http://localhost:4100` in your browser to view the StatGPT Admin application.

## 🔨 Build

```bash
npm run build
```

After running the command, you will see a `dist` folder created in your project directory with the optimized output.

## 🧪 Test

To run the unit tests suite for your application, execute the following command:

```bash
npm run test
```

## 🧑‍💻 Environment Variables

### Environment Variables for the Application

StatGPT Admin uses environment variables for configuration. All environment variables that can be used to configure settings and behavior of the application are included in the `.env` file.

| Variable             | Required | Description                                                                                                                                                                                                                                                   | Available Values | Default values |
| -------------------- | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------- |
| `API_URL`            |   Yes    | StatGPT Admin Backend API url.<br />Refer to [StatGPT Admin Backend]().                                                                                                                                                                                       | Any string       |                |
| `DIAL_API_URL`       |   Yes    | AI DIAL Core API Url. <br />Refer to [AI DIAL Core](https://github.com/epam/ai-dial-core?tab=readme-ov-file#dynamic-settings).                                                                                                                                | Any string       |                |
| `DIAL_API_KEY`       |    No    | AI DIAL Core API Key.<br />Define this variable if authorization using JWT is not configured.<br />Refer to [AI DIAL Core](https://github.com/epam/ai-dial-core?tab=readme-ov-file#dynamic-settings) to learn how to set up AI DIAL Core and define API keys. | Any string       |                |
| `DISABLE_MENU_ITEMS` |    No    | List of menu items to hide in the application                                                                                                                                                                                                                 | Any string       |

### Environment Variables for the Configuration of Auth Providers

The table below presents a list of environment variables you can use to configure a specific IDP provider.

> **NOTE**: to test the StatGPT Admin Frontend application in an **unauthenticated** mode, do not provide any of these variables. The only required variable to launch the application is `NEXTAUTH_SECRET`.

| Variable                  |                         Required                         | Description                                                                                                                                                                                                                                        | Available Values | Default values                                  |
| ------------------------- | :------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------- |
| `NEXTAUTH_URL`            | Optional.<br /> Required for **production** deployments. | NextAuth URL                                                                                                                                                                                                                                       | Any string       |                                                 |
| `NEXTAUTH_SECRET`         |                           Yes                            | NextAuth Secret (generate by `openssl rand -base64 32` for example)                                                                                                                                                                                | Any string       |                                                 |
| `AUTH_AUTH0_AUDIENCE`     |                            No                            | Auth0 Audience                                                                                                                                                                                                                                     | Any string       |                                                 |
| `AUTH_AUTH0_CLIENT_ID`    |                            No                            | Auth0 Client ID                                                                                                                                                                                                                                    | Any string       |                                                 |
| `AUTH_AUTH0_HOST`         |                            No                            | Auth0 Host                                                                                                                                                                                                                                         | Any string       |                                                 |
| `AUTH_AUTH0_NAME`         |                            No                            | Auth0 Name                                                                                                                                                                                                                                         | Any string       |                                                 |
| `AUTH_AUTH0_SECRET`       |                            No                            | Auth0 Secret                                                                                                                                                                                                                                       | Any string       |                                                 |
| `AUTH_AUTH0_SCOPE`        |                            No                            | Auth0 Scope                                                                                                                                                                                                                                        | Any string       | `openid email profile offline_access`           |
| `AUTH_AZURE_AD_CLIENT_ID` |                            No                            | A unique identifier for the client application registered in Azure Active Directory (AD). It is used to authenticate the client application when accessing Azure AD resources.                                                                     | Any string       |                                                 |
| `AUTH_AZURE_AD_NAME`      |                            No                            | A name of the Azure AD tenant. It is used to specify the specific Azure AD instance to authenticate against.                                                                                                                                       | Any string       |                                                 |
| `AUTH_AZURE_AD_SECRET`    |                            No                            | Also known as the client secret or application secret, this parameter is a confidential string that authenticates and authorizes the client application to access Azure AD resources. It serves as a password for the client application.          | Any string       |                                                 |
| `AUTH_AZURE_AD_TENANT_ID` |                            No                            | Tenant ID refers to a globally unique identifier (GUID) that represents a specific Azure AD tenant. It is used to identify and authenticate the Azure AD tenant that the client application belongs to.                                            | Any string       |                                                 |
| `AUTH_AZURE_AD_SCOPE`     |                            No                            | This parameter specifies the level of access and permissions that the client application requests when making a request to Azure AD resources. It defines the resources and actions that the application can access on behalf of a user or itself. | Any string       | `openid profile user.Read email offline_access` |
| `AUTH_GITLAB_CLIENT_ID`   |                            No                            | GitLab Client ID                                                                                                                                                                                                                                   | Any string       |                                                 |
| `AUTH_GITLAB_HOST`        |                            No                            | GitLab Host                                                                                                                                                                                                                                        | Any string       |                                                 |
| `AUTH_GITLAB_NAME`        |                            No                            | GitLab Name                                                                                                                                                                                                                                        | Any string       |                                                 |
| `AUTH_GITLAB_SECRET`      |                            No                            | GitLab Secret                                                                                                                                                                                                                                      | Any string       |                                                 |
| `AUTH_GITLAB_SCOPE`       |                            No                            | GitLab Scope                                                                                                                                                                                                                                       | Any string       | `read_user`                                     |
| `AUTH_GOOGLE_CLIENT_ID`   |                            No                            | Google Client ID                                                                                                                                                                                                                                   | Any string       |                                                 |
| `AUTH_GOOGLE_NAME`        |                            No                            | Google Name                                                                                                                                                                                                                                        | Any string       |                                                 |
| `AUTH_GOOGLE_SECRET`      |                            No                            | Google Secret                                                                                                                                                                                                                                      | Any string       |                                                 |
| `AUTH_GOOGLE_SCOPE`       |                            No                            | Google Scope                                                                                                                                                                                                                                       | Any string       | `openid email profile offline_access`           |
| `AUTH_KEYCLOAK_CLIENT_ID` |                            No                            | Keycloak Client ID                                                                                                                                                                                                                                 | Any string       |                                                 |
| `AUTH_KEYCLOAK_HOST`      |                            No                            | Keycloak Host                                                                                                                                                                                                                                      | Any string       |                                                 |
| `AUTH_KEYCLOAK_NAME`      |                            No                            | Keycloak Name                                                                                                                                                                                                                                      | Any string       |                                                 |
| `AUTH_KEYCLOAK_SECRET`    |                            No                            | Keycloak Secret                                                                                                                                                                                                                                    | Any string       |                                                 |
| `AUTH_KEYCLOAK_SCOPE`     |                            No                            | Keycloak Scope                                                                                                                                                                                                                                     | Any string       | `openid email profile offline_access`           |
| `AUTH_OKTA_CLIENT_ID`     |                            No                            | Okta Client ID                                                                                                                                                                                                                                     | Any string       |                                                 |
| `AUTH_OKTA_CLIENT_SECRET` |                            No                            | Okta Client Secret                                                                                                                                                                                                                                 | Any string       |                                                 |
| `AUTH_OKTA_ISSUER`        |                            No                            | Okta domain issuer                                                                                                                                                                                                                                 | Any string       |                                                 |
| `AUTH_OKTA_SCOPE`         |                            No                            | Okta Scope                                                                                                                                                                                                                                         | Any string       | `openid email profile`                          |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code style guidelines
- Testing requirements
- Pull request process

## 🔒 Security

If you discover a security vulnerability, please refer to our [Security Policy](./SECURITY.md).

## 📄 License

[MIT](./LICENSE) - see the [LICENSE](./LICENSE) file for details.

## 🌟 Related Projects

- [StatGPT Backend](https://github.com/epam/statgpt-backend)- StatGPT backend, which implements APIs and main logic of the StatGPT application.

---

<p align="center">
  Made by <a href="https://www.epam.com">EPAM Systems</a>
</p>
