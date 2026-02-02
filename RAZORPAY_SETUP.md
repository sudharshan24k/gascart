# Razorpay Integration - Environment Variables

## Backend Environment Variables

Add these to `/backend/.env`:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Existing variables
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
FRONTEND_URL=http://localhost:5173
```

## Getting Razorpay Keys

### 1. Sign Up / Login
Visit: https://dashboard.razorpay.com/

### 2. Get Test Keys
1. Navigate to **Settings** → **API Keys**
2. Click **Generate Test Key**
3. Copy:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (hidden, reveal it)

### 3. Generate Webhook Secret
1. Navigate to **Settings** → **Webhooks**
2. Click **Create Webhook**
3. Enter webhook URL: `https://your-domain.com/api/v1/webhooks/razorpay`
4. Select events:
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
   - `order.paid`
5. Click **Create Webhook**
6. Copy the **Secret** (starts with `whsec_`)

## Frontend Environment Variables

No changes needed! Razorpay keys are fetched from backend.

Existing `/frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Production Setup

### 1. Switch to Live Keys
In production `.env`:
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_production_xxxxx
```

### 2. KYC Verification
- Complete KYC on Razorpay Dashboard
- Submit business documents
- Wait for approval (usually 24-48 hours)

### 3. Configure Webhooks
Update webhook URL to production:
```
https://yourdomain.com/api/v1/webhooks/razorpay
```

## Testing with Local Webhooks

### Using ngrok
```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel
ngrok http 3000

# Use ngrok URL for webhook
https://xxxx-xx-xx-xxx-xx.ngrok.io/api/v1/webhooks/razorpay
```

## Security Best Practices

1. **Never commit `.env` files**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for templates

2. **Use different keys for environments**
   - Test keys for development
   - Live keys only in production

3. **Rotate secrets regularly**
   - Change webhook secrets monthly
   - Regenerate API keys if compromised

4. **Restrict webhook IPs** (Production)
   - Allowlist Razorpay IP ranges
   - Verify signatures on every webhook

## Verification

Test your setup:

```bash
# Backend
curl http://localhost:3000/health

# Create order (requires auth)
curl -X POST http://localhost:3000/api/v1/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": [], "shippingDetails": {}, "billingDetails": {}}'
```

You should see Razorpay order ID in response.

## Troubleshooting

### "Invalid key_id" Error
- Check `RAZORPAY_KEY_ID` is correct
- Ensure no extra spaces in `.env`
- Verify test vs live keys match your mode

### "Webhook signature verification failed"
- Ensure `RAZORPAY_WEBHOOK_SECRET` matches dashboard
- Check webhook URL is accessible
- Verify you're using correct secret for test/live mode

### "Not authenticated" Error  
- Ensure user is logged in
- Check Supabase session is valid
- Verify Authorization header is sent

## Next Steps

1. ✅ Add environment variables to `.env`
2. ⏳ Run database migration for Razorpay fields
3. ⏳ Test payment flow end-to-end
4. ⏳ Configure webhooks in Razorpay dashboard
5. ⏳ Test with real test cards
