# Google AI Studio deployment notes

This repository is a conventional React/Vite + Node/Express application. It can be developed in Antigravity and versioned in GitHub. Google AI Studio Build mode has its own supported import and deployment workflow, and eligibility, runtime compatibility, and free-tier quotas can change.

## Prepare the repository

1. Run `npm install`.
2. Run `npm test`.
3. Run `npm run build`.
4. Verify the application locally with `npm run dev`.
5. Ensure `server/.env` is not committed. Keep the Gemini key out of source files and frontend environment variables.
6. Push the project to GitHub.

## Import into AI Studio

If your current Google AI Studio account shows the GitHub import option in Build mode:

1. Open Google AI Studio Build mode.
2. Use the GitHub import option and select the Samskartha repository.
3. Review the generated/imported project structure and compare it with this repository.
4. Confirm that server-side environment secrets are configured for the backend. Do not paste the Gemini key into a React component or a `VITE_` variable.
5. Verify the API routes, file upload handling, production build, and server startup in the preview.
6. Deploy only after the deployed app passes the same end-to-end checks as local development.

Important: do not assume that importing a repository automatically preserves every Vite/Express workspace setting. AI Studio may adapt or regenerate project files. Review its changes rather than accepting a rewrite blindly.

## If AI Studio cannot deploy this exact workspace

The project can still be deployed as a standard Node web app on a host that supports a Node server and environment variables. The root build command is `npm run build`; the start command is `npm start`. The Express server serves `client/dist` after the build and handles `/api/*` requests.

For a conventional single-service deployment:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Runtime: Node.js 20+
- Environment variables: use the contents of `server/.env.example` as a guide
- Port: the host-provided `PORT` value is supported

Do not turn on paid billing just to get around an import or free-tier limit. Check current eligibility and limits in the console first.

## Post-deployment checks

- Open `/api/health` and confirm that it responds.
- Generate once with Gemini configured.
- Generate once with the API key removed to verify demo mode.
- Upload a small TXT and PDF file and confirm extracted text is relevant.
- Check each platform handoff URL.
- Test copy with HTTPS and verify the manual-copy fallback.
- Confirm that no request, uploaded file, or API key appears in public logs or browser source.

## Official references

- Google AI Studio: https://aistudio.google.com/
- Gemini API getting started: https://ai.google.dev/gemini-api/docs/quickstart
- Gemini API pricing and free tier: https://ai.google.dev/gemini-api/docs/pricing
- Google Cloud Run: https://cloud.google.com/run/docs
