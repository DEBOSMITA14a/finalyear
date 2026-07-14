# final-neuro

## Spring Boot API setup

This frontend calls backend routes through `src/api.js`.

Default routes:

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `GET /api/account/me`
- `POST /api/assessments/nichq`
- `GET /api/assessments/nichq/latest`

For local development, keep `VITE_API_BASE_URL` empty and set `VITE_API_PROXY_TARGET` to your Spring Boot server, usually `http://localhost:8080`. Copy `.env.example` to `.env` and run:

```bash
npm run dev
```

If you prefer calling Spring Boot directly instead of using the Vite proxy, set:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

In that direct mode, enable CORS and credentials in Spring Boot for the Vite origin.
