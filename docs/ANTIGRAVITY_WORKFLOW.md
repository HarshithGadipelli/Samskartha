# Using this project in Google Antigravity

1. Extract `samskartha-starter.zip` to a normal writable folder.
2. Open the extracted `samskartha-starter` folder in Antigravity.
3. Let Antigravity index the repository. Keep `AGENTS.md` and `README.md` in the root; they explain the product boundary and build rules.
4. Open the integrated terminal and run `npm install`.
5. Copy `server/.env.example` to `server/.env`.
6. Start the app with `npm run dev` and open `http://localhost:5173`.
7. First verify demo mode with no Gemini API key. Then add a Gemini API key to `server/.env` and restart the server.
8. Ask Antigravity to work on one scoped feature at a time. Example: "Inspect the current code, run the existing tests and frontend build, and report any errors before changing anything. Do not change the Samskartha product boundary."
9. After a change, ask it to run `npm test` and `npm run build` and fix errors.
10. Commit the stable project to a private or public GitHub repository. Never commit `server/.env`.

## Suggested Antigravity task prompts

### Task A — inspect and verify
"Read AGENTS.md and README.md. Inspect the repository, install dependencies if required, run tests and build, and fix only clear setup or compilation issues. Do not add paid services or external GenAI execution."

### Task B — improve prompt quality
"Review the Gemini optimization prompt and the six platform profile JSON files. Improve the platform-specific prompt structures using only the linked official documentation. Keep the package schema stable, state assumptions, and add tests for any new behavior. Do not call destination platform APIs."

### Task C — enhance retrieval
"Improve the retrieval service without adding paid APIs. Keep BM25 as the default. Add tests for chunking, deduplication, ranking, and source attribution. Do not add a vector database unless I explicitly approve it."

### Task D — add optional authentication later
"Design Firebase Authentication and per-user Firestore security rules for saved packages. Keep anonymous demo mode available. Do not make user uploads persistent by default. Provide and test restrictive security rules before enabling any client-side writes."
