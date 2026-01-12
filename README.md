# AI Split Bill

AI Split Bill is a mobile-first web application designed to simplify splitting restaurant bills. It leverages AI to analyze receipt images and fairly distribute costs among individuals based on their actual consumption.

## Project Overview

- **AI-Assisted Development**: Built and orchestrated using **Google Antigravity**.
- **Mobile-First Design**: A streamlined, 2-page interface (Input → Result).
- **Intelligent Splitting**: Uses AI to parse receipts, map items to people, and calculate taxes and fees proportionally.
- **Problem Solved**: Eliminates the manual hassle of reading complex receipts and doing proportional math for taxes and service charges.
- **How AI Helps**: AI acts as a digital clerk that understands itemized list, identifies pricing, and applies user-provided instructions to attribute costs fairly.

## One-Week-One-App Context

This project is part of the **One-Week-One-App (OWOA)** personal resolution for 2026.
- Consistently build and ship small but complete applications.
- Experiment with modern tooling and AI-assisted development.
- This project serves as one installment of this initiative to demonstrate rapid, high-quality delivery.

## AI & Multi-Agent Development

This project was developed using a multi-agent AI orchestration approach, managed by **Google Antigravity**. Development responsibilities were scoped across specialized agents (Frontend, Backend, QA, etc.) to ensure high adherence to requirements.

The project utilized several **Model Context Protocol (MCP)** tools:
- **Context7**: Efficient retrieval of programming documentation and code examples.
- **Sequential Thinking**: Structured planning and complex reasoning during implementation.
- **Serena**: Comprehensive task management and project context maintenance.
- **Playwright**: Robust automated UI and end-to-end testing.

## Tech Stack

- **Framework**: SvelteKit (TypeScript) for a fast and reactive full-stack experience.
- **UI System**: shadcn-svelte for accessible and aesthetic UI components.
- **Styling**: Tailwind CSS for rapid, utility-first responsive design.
- **AI Integration**: OpenRouter API for flexible LLM access.
- **LLM Concept**: Default (`gpt-4o-mini`) with a fallback (`gemini-2.0-flash`) for reliability.
- **Testing**: Playwright for end-to-end testing.
- **Runtime / Deployment**: Node.js 20+ runtime, deployed on Render.

## Prerequisites

- **Node.js**: version 22.12.0 or higher (Required by Vite).
- **Package Manager**: `pnpm` (recommended) or `npm`.
- **Git**: For version control.
- **Environment Variables**: Access to OpenRouter API key.

## Local Development

Follow these steps to run the project locally:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd owoa-aisplitbill
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file from the provided example:
   ```bash
   cp .env.example .env
   ```
   Add your `OPENROUTER_API_KEY` to the `.env` file.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Testing

- **Core Flows**: Tests cover basic UI display, form validation, and empty states.
- **Tooling**: Tests are written using **Playwright**.
- **Run Tests Locally**:
  ```bash
  npx playwright test
  ```

## Build

To create a production-ready build:

```bash
pnpm build
```
This produces a compiled version of the application in the `.svelte-kit` and `build` directories (depending on the adapter), optimized for performance and ready for deployment.


## ☁️ Deployment (Render.com)

This application is optimized for deployment on **Render** as a Node.js Web Service.

### Prerequisites
- A [Render.com](https://render.com) account.
- A connected GitHub repository containing this project.
- Access to your API keys (OpenRouter, Supabase).

### Configuration

1. **Create New Web Service**: Select the repository.
2. **Runtime**: Choose **Node.js**.
3. **Build Command**:
   ```bash
   npm install && npm run build
   ```
4. **Start Command**:
   ```bash
   node build
   ```

### Environment Variables

You must manually add the following environment variables in the Render Dashboard.
**Refer to [.env.example](.env.example) for the complete list of keys.**

| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | Set to `production`. |
| `OPENROUTER_API_KEY` | Your private API key. |
| `SUPABASE_URL` | Your Supabase Project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Your server-side Service Role Key. |

> **⚠️ Security Note:** Never commit your `.env` file. Using the Supabase Service Role Key on the client-side will expose your database to attacks.

### Verification

After deployment:
1. Wait for the "Build Successful" and "Service Live" status.
2. Visit your `onrender.com` URL.
3. Upload a receipt to test the full flow.
4. Verify that the "Share" button produces a functional public URL.


## Project Philosophy

- **Learning by Building**: Practical experience is the best teacher.
- **Shipping Small, Complete Apps**: Focus on delivering value through focused, high-quality features.
- **AI as a Collaborator**: Leveraging AI to augment human creativity and productivity, not replace it.
