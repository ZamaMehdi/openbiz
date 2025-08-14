# Railway Backend Connection Setup

## Frontend Configuration

Your frontend is now configured to connect to the Railway backend at:
`https://openbiz-production-ac4c.up.railway.app`

### Environment Variables

Create a `.env.local` file in the `udyam-ui` directory with:

```bash
NEXT_PUBLIC_API_URL=https://openbiz-production-ac4c.up.railway.app
```

### API Configuration

The API base URL has been updated in `src/lib/api.ts` to use the Railway backend by default.

## Backend CORS Configuration

The backend has been updated to allow requests from:
- `https://openbizregistration.netlify.app`
- `http://localhost:3000` (for local development)

## Testing the Connection

1. **Local Development**: Frontend will use Railway backend
2. **Netlify Deployment**: Frontend will use Railway backend
3. **CORS**: Backend allows requests from your Netlify domain

## API Endpoints

All API calls will now go to:
- `https://openbiz-production-ac4c.up.railway.app/api/registration/step1`
- `https://openbiz-production-ac4c.up.railway.app/api/registration/verify-otp`
- `https://openbiz-production-ac4c.up.railway.app/api/registration/step2`
- `https://openbiz-production-ac4c.up.railway.app/api/verification/pan`
- `https://openbiz-production-ac4c.up.railway.app/api/pincode/{pincode}`

## Notes

- The frontend will automatically use the Railway backend
- CORS is configured to allow your Netlify domain
- Local development still works with the Railway backend
