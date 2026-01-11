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

- **Node.js**: version 20 or higher.
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
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env` file from the provided example:
   ```bash
   cp .env.example .env
   ```
   Add your `OPENROUTER_API_KEY` to the `.env` file.

4. **Run the development server**:
   ```bash
   pnpm dev
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

## Deployment on Render

To deploy this application on **Render**:

1. **Create a new Web Service**: Connect your GitHub repository.
2. **Set Node Version**: Ensure the environment uses Node 20+.
3. **Add Environment Variables**: Include `OPENROUTER_API_KEY`, `OPENROUTER_MODEL_DEFAULT`, and `OPENROUTER_MODEL_FALLBACK`.
4. **Build Command**: `pnpm install && pnpm build`
5. **Start Command**: `node build` (or the command specified by your adapter).

## Project Philosophy

- **Learning by Building**: Practical experience is the best teacher.
- **Shipping Small, Complete Apps**: Focus on delivering value through focused, high-quality features.
- **AI as a Collaborator**: Leveraging AI to augment human creativity and productivity, not replace it.
