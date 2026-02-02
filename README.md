# Cookie Banner SDK

A DPDP-compliant cookie consent management SDK built with React and bundled as a single-file UMD library. This SDK provides a customizable cookie banner that can be embedded in any website via a simple script tag.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Build Process](#build-process)
- [Deployment & Versioning](#deployment--versioning)
- [Usage](#usage)
- [Features](#features)
- [Configuration](#configuration)

## 🎯 Overview

This SDK enables websites to display customizable cookie consent banners with:

- DPDP compliance
- Cookie categorization (necessary, analytics, advertising, etc.)
- Google Consent Mode v2 integration
- Consent tracking and logging
- Customizable styling and content via API configuration

The SDK is distributed via jsDelivr CDN, allowing websites to include it with a simple script tag.

## 📁 Project Structure

```
cookie-banner-sdk/
├── src/
│   ├── main.jsx              # Entry point - auto-initialization & DOM management
│   ├── CookieBanner.jsx      # Main React component - UI & consent management
│   ├── bannerActivity.js     # API layer - consent tracking, config fetching
│   └── index.css             # Base styles (Tailwind CSS)
├── dist/
│   └── banner-sdk.js         # Built UMD library (generated)
├── vite.config.js            # Vite build configuration (UMD, CSS injection)
├── eslint.config.js          # ESLint configuration
├── package.json              # Dependencies and scripts
├── index.html                # Development preview page
├── CLAUDE.md                 # AI assistant instructions
└── README.md                 # This file
```

### Core Components

| File                  | Purpose                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **main.jsx**          | Auto-initializes banner when script loads, handles DOM insertion/removal detection, manages banner lifecycle     |
| **CookieBanner.jsx**  | React component for banner UI, modal dialogs, cookie preferences, and user interactions                          |
| **bannerActivity.js** | Business logic for API communication, consent tracking, Google Consent Mode integration, localStorage management |

## 🛠 Technology Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Output Format**: UMD (Universal Module Definition)
- **CDN**: jsDelivr
- **Linting**: ESLint 9

### Key Plugins

- `@vitejs/plugin-react` - React support with Fast Refresh
- `@tailwindcss/vite` - Tailwind CSS integration
- `vite-plugin-css-injected-by-js` - Inlines CSS into JS bundle (single file output)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd cookie-banner-sdk

# Install dependencies
npm install
```

## 💻 Development

### Available Scripts

| Command           | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `npm run build`   | Build production-ready library to `dist/banner-sdk.js` |
| `npm run lint`    | Run ESLint to check code quality                       |
| `npm run preview` | Preview the built library locally                      |

## 🔨 Build Process

The build process creates a **single-file UMD library** that includes:

- All React components
- Inlined CSS (Tailwind styles)
- Auto-initialization logic
- All dependencies bundled

### Building for Production

```bash
npm run build
```

**Output**: `dist/banner-sdk.js`

### Build Configuration

The Vite configuration (`vite.config.js`) is set up to:

- Build as UMD format (works in browser globals, AMD, CommonJS)
- Inject CSS directly into JavaScript (no separate CSS file)
- Create a single file output with no code splitting
- Export as `CookieBannerSDK` global variable
- Inline all dynamic imports

## 🚢 Deployment & Versioning

The SDK is distributed via **jsDelivr CDN** which pulls from your Git repository. To deploy a new version:

### Step 1: Build the Library

```bash
npm run build
```

### Step 2: Commit Changes

```bash
git add .
git commit -m "your descriptive message (e.g., 'Add analytics cookie category')"
```

### Step 3: Create a Version Tag

```bash
# Create annotated tag with semantic versioning
git tag -a v1.2.3 -m "tag message describing this version"
```

**Versioning Guidelines** (Semantic Versioning):

- `v1.0.0` - Major version (breaking changes)
- `v1.1.0` - Minor version (new features, backwards compatible)
- `v1.1.1` - Patch version (bug fixes)

### Step 4: Push to Remote

```bash
# Push commits
git push origin <branch-name>

# Push the specific tag
git push origin v1.2.3
```

### Step 5: Verify on jsDelivr

The new version will be available at:

```
https://cdn.jsdelivr.net/gh/<username>/<repo>@v1.2.3/dist/banner-sdk.js
```

**Note**: jsDelivr caches aggressively. New tags may take a few minutes to become available.

### Important Deployment Notes

⚠️ **Always build before committing**: The `dist/banner-sdk.js` file must be included in your Git commits for jsDelivr to serve it.

⚠️ **Tags are immutable**: Once a version tag is pushed, it cannot be changed. Always test thoroughly before tagging.

⚠️ **Use annotated tags**: Use `-a` flag for better Git metadata and release notes.

## 📖 Usage

### Basic Integration

Add the script tag to your website with your `domainId` parameter:

```html
<script src="https://cdn.jsdelivr.net/gh/<username>/<repo>@v1.0.0/dist/banner-sdk.js?domainId=your-domain-id"></script>
```

### Parameters

| Parameter  | Required | Description                                                             |
| ---------- | -------- | ----------------------------------------------------------------------- |
| `domainId` | Yes      | Unique identifier for your domain (fetches custom banner configuration) |

### Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome to my website</h1>

    <!-- Cookie Banner SDK -->
    <script src="https://cdn.jsdelivr.net/gh/yourorg/cookie-banner-sdk@v1.0.0/dist/banner-sdk.js?domainId=abc123"></script>
  </body>
</html>
```

The banner will automatically:

1. Fetch configuration from the API using the provided `domainId`
2. Display the cookie consent banner
3. Track user interactions and consent choices
4. Update Google Consent Mode based on user preferences
5. Store consent preferences in localStorage

## ✨ Features

### Auto-Initialization

- Automatically initializes when script is loaded
- Extracts `domainId` from script URL parameters
- No additional JavaScript required from the client

### Consent Management

- User consent tracking with unique interaction IDs
- Timing metrics (time between display and user action)
- Event firing on every user preference changes
- Accept all / Reject all / Customize options

### Cookie Categorization

- Necessary cookies (always enabled)
- Analytics cookies
- Advertising cookies
- Functional cookies
- Custom categories via API configuration

### Google Consent Mode Integration

- Automatic gtag integration
- Updates consent status to Google Analytics
- dataLayer support for Google Tag Manager

### Lifecycle Management

- **Removal Detection**: MutationObserver tracks DOM changes
- **Cleanup Tracking**: Logs when banner is removed
- **Event Handling**: Tracks banner display, user actions, and removal

### API Integration

- Fetches banner configuration from backend
- Logs consent events
- Tracks banner lifecycle (display, interaction, removal)

## ⚙️ Configuration

### API Endpoint

The base API URL is configured in `src/bannerActivity.js`:

```javascript
const BASE_URL = "https://your-api-endpoint.com/api";
```

**Environment Options**:

- Production: `https://your-api-endpoint.com/api`
- Staging/Preprod: Update in code before building
- Development: Can be changed locally for testing

### Banner Configuration API

The SDK expects the following API endpoint to be available:

```
GET /banner/fetchBanner?domainId={domainId}
```

## 🔧 LocalStorage Data

The SDK stores the following data in browser localStorage:

| Key                 | Description                              |
| ------------------- | ---------------------------------------- |
| `browserId`         | Unique identifier for the browser/device |
| `domainId`          | Domain identifier from script parameters |
| `interactionId`     | Current interaction session ID           |
| `bannerDisplayTime` | Timestamp when banner was displayed      |

## 🤝 Contributing

### Before Making Changes

1. Create a feature branch
2. Make your changes
3. Test thoroughly with `npm run dev`
4. Run linting: `npm run lint`
5. Build and test: `npm run build`

### Commit Message Guidelines

Use clear, descriptive commit messages:

- `feat: Add new cookie category support`
- `fix: Resolve banner position issue on mobile`
- `refactor: Simplify consent tracking logic`
- `docs: Update README with new deployment steps`

## 📝 License

[Add your license information here]

## 🆘 Support

For issues, questions, or contributions, please [open an issue](link-to-issues) or contact the development team.

---
