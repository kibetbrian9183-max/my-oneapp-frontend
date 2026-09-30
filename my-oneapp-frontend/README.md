# My OneApp (front end)

React + Vite installable web app (PWA). Independent UI recreation; not an official Safaricom application.
The API lives in a separate repository and must be running for login, transfers and statements.

## Run locally

    cp .env.example .env      # VITE_API_URL=http://localhost:4000
    npm install
    npm run dev

## Deploy on Vercel

1. Push this folder to GitHub and import it in Vercel (framework preset: Vite).
2. Add the environment variable `VITE_API_URL` = your API's public **https** URL, then deploy.
3. On the API, set `CLIENT_ORIGIN` to your Vercel URL so the browser is allowed to call it.

## Install on a phone

Open the deployed site: Android (Chrome) shows **Install app** / **Add to Home screen**;
iPhone (Safari): Share, then **Add to Home Screen**. The app installs as **My OneApp**.
