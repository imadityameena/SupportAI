# SupportAI

SupportAI is a customer-support chatbot platform built with Next.js. Businesses can sign in, configure their support information, and embed an AI-powered chat widget on their website. The chatbot uses the configured business knowledge as its source of truth when answering customer questions.

## Features

- Scalekit authentication for protected dashboard and embed pages
- Business profile, support email, and knowledge-base settings
- Gemini-powered support replies generated from saved business information
- Copy-and-paste website widget with a live preview
- Cross-origin chat API for the embedded widget
- MongoDB persistence through Mongoose

## Stack

- Next.js 16 with the App Router and TypeScript
- React 19
- Google Gemini via `@google/genai`
- Scalekit for authentication
- MongoDB and Mongoose
- Tailwind CSS and Motion for the interface

## Requirements

- Node.js 20 or newer
- A MongoDB database
- A Google Gemini API key
- A Scalekit application with its client credentials

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URL=mongodb://127.0.0.1:27017/support-ai
GEMINI_API_KEY=your-gemini-api-key
SCALEKIT_ENVIRONMENT_URL=your-scalekit-environment-url
SCALEKIT_CLIENT_ID=your-scalekit-client-id
SCALEKIT_CLIENT_SECRET=your-scalekit-client-secret
```

Configure the Scalekit callback URL to match:

```text
http://localhost:3000/api/auth/callback
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in. The dashboard is available at `/dashboard`.

## Using the widget

1. Sign in and open the dashboard.
2. Add the business name, support email, and information the assistant should use.
3. Open the embed page and copy the generated script.
4. Paste the script before the closing `</body>` tag on the customer-facing website.

The generated snippet has this shape:

```html
<script
  src="https://your-support-ai-host.example/chatBot.js"
  data-owner-id="YOUR_OWNER_ID"
></script>
```

The widget sends customer messages to `/api/chat` with the business owner ID. The API only uses the corresponding saved settings when generating a reply.

## Application routes

| Route                | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `/`                  | Landing page and sign-in entry point          |
| `/dashboard`         | Configure business support information        |
| `/embed`             | Generate the widget script and view a preview |
| `/api/auth/login`    | Start Scalekit authentication                 |
| `/api/auth/callback` | Complete authentication                       |
| `/api/auth/logout`   | End the current session                       |
| `/api/chat`          | Generate a support response                   |
| `/api/settings`      | Save business settings                        |
| `/api/settings/get`  | Read business settings                        |

## Scripts

```bash
npm run dev      # Start the development server
npm run lint     # Run ESLint
npm run build    # Create a production build
npm run start    # Serve the production build
```

## Deployment

Deploy the Next.js application to a platform that supports server-side environment variables, such as Vercel. Set the same variables from `.env.local` in the deployment environment, update `NEXT_PUBLIC_APP_URL` to the public HTTPS URL, and register the matching `/api/auth/callback` URL with Scalekit.
