# Environment-Based Credential Management

## The Problem
You have **two different sets of credentials**:
- Pre-production: `c2ec2290...` / `yWu2-lpig...`
- Production: `35f5564a...` / `xEh8a3VeyS...`

But the Worker needs to know **which credentials to use**.

## Solution: Environment-Specific Secrets

### Option A: Use QURAN_ENV to Switch (Current Implementation)

**For Development** (`.dev.vars`):
```bash
# Pre-production credentials for local testing
QURAN_CLIENT_ID=c2ec2290-d193-485f-a041-8f730502d39f
QURAN_CLIENT_SECRET=yWu2-lpigbribV7Qmtlqba7hg8
QURAN_ENV=pre-production
```

**For Production Deployment**:

If you want to use **pre-production API** (current):
```bash
npx wrangler secret put QURAN_CLIENT_ID
# Enter: c2ec2290-d193-485f-a041-8f730502d39f

npx wrangler secret put QURAN_CLIENT_SECRET
# Enter: yWu2-lpigbribV7Qmtlqba7hg8

npx wrangler secret put QURAN_ENV
# Enter: pre-production
```

If you want to use **production API** (when approved):
```bash
npx wrangler secret put QURAN_CLIENT_ID
# Enter: 35f5564a-3057-46c5-bd74-b7cf55ba5f80

npx wrangler secret put QURAN_CLIENT_SECRET
# Enter: xEh8a3VeySWlgPV~EVmgUMwLa0

npx wrangler secret put QURAN_ENV
# Enter: production
```

⚠️ **Problem**: You can only have ONE set of credentials at a time in production.

---

### Option B: Separate Credentials (Recommended for Multiple Environments)

Store **both sets** and let code choose based on environment.

**Update the code to use environment-specific secrets:**

```typescript
// In src/index.ts
async init() {
  // Determine which environment we're targeting
  const targetEnv = (this.env as any).QURAN_TARGET_ENV?.toLowerCase() || 'pre-production';
  
  // Use environment-specific credentials
  const clientId = targetEnv === 'production' 
    ? this.env.QURAN_PROD_CLIENT_ID 
    : this.env.QURAN_PREPROD_CLIENT_ID;
    
  const clientSecret = targetEnv === 'production'
    ? this.env.QURAN_PROD_CLIENT_SECRET
    : this.env.QURAN_PREPROD_CLIENT_SECRET;

  const quranEnv = targetEnv === 'production'
    ? QuranEnvironment.PRODUCTION
    : QuranEnvironment.PRE_PRODUCTION;

  const quranClient = getQuranClient({
    clientId,
    clientSecret,
    defaultLanguage: Language.ENGLISH,
    environment: quranEnv,
  });
}
```

**Set all secrets:**
```bash
# Pre-production credentials
npx wrangler secret put QURAN_PREPROD_CLIENT_ID
npx wrangler secret put QURAN_PREPROD_CLIENT_SECRET

# Production credentials (when approved)
npx wrangler secret put QURAN_PROD_CLIENT_ID
npx wrangler secret put QURAN_PROD_CLIENT_SECRET

# Control which to use
npx wrangler secret put QURAN_TARGET_ENV
# Enter: pre-production (or production)
```

**In `.dev.vars`:**
```bash
# Pre-production (for local testing)
QURAN_PREPROD_CLIENT_ID=c2ec2290-d193-485f-a041-8f730502d39f
QURAN_PREPROD_CLIENT_SECRET=yWu2-lpigbribV7Qmtlqba7hg8

# Production (leave empty until approved)
QURAN_PROD_CLIENT_ID=35f5564a-3057-46c5-bd74-b7cf55ba5f80
QURAN_PROD_CLIENT_SECRET=xEh8a3VeySWlgPV~EVmgUMwLa0

# Which environment to use
QURAN_TARGET_ENV=pre-production
```

✅ **Benefit**: You can switch between environments by just changing `QURAN_TARGET_ENV`.

---

## Recommendation for Your Current Situation

### **Right Now (No Production Approval Yet)**

**Stick with Option 1** - Use pre-production credentials everywhere:

1. ✅ Your `.dev.vars` already has pre-production credentials
2. ✅ Set the same pre-production credentials in Wrangler secrets:

```bash
npx wrangler secret put QURAN_CLIENT_ID
# Enter: c2ec2290-d193-485f-a041-8f730502d39f

npx wrangler secret put QURAN_CLIENT_SECRET
# Enter: yWu2-lpigbribV7Qmtlqba7hg8

npx wrangler secret put QURAN_ENV
# Enter: pre-production
```

This way:
- ✅ Local dev uses pre-production API
- ✅ Deployed Worker uses pre-production API
- ✅ Everything is consistent
- ✅ Limited data is expected (as per their email)

### **When Production is Approved**

Then **update the secrets** to production credentials:

```bash
# Update to production credentials
npx wrangler secret put QURAN_CLIENT_ID
# Enter: 35f5564a-3057-46c5-bd74-b7cf55ba5f80

npx wrangler secret put QURAN_CLIENT_SECRET
# Enter: xEh8a3VeySWlgPV~EVmgUMwLa0

npx wrangler secret put QURAN_ENV
# Enter: production
```

Or implement **Option B** if you need to frequently switch between environments.

---

## Quick Answer to Your Questions

### "Do I need to change my secret keys?"
**Not yet**. Keep using pre-production credentials until your production access is approved.

### "Should I create a new variable?"
**No**, unless you need to support **both environments simultaneously** (which would require implementing Option B above).

### "What should I do now?"
1. ✅ Keep your `.dev.vars` with pre-production credentials (you already have this)
2. ✅ Make sure `QURAN_ENV=pre-production` is set
3. ✅ Set the same pre-production credentials in Wrangler secrets
4. ⏳ Wait for production approval
5. 🔄 When approved, update secrets to production credentials

Would you like me to implement Option B (separate credential sets) for you, or stick with the simpler current approach?
