# Demo Tools Reference

This document explains the demo/example tools included in Quran MCP and how to use them for learning or testing.

## Overview

The Quran MCP server includes several **demo tools** that showcase different MCP capabilities. These are marked with `[DEMO]` in their descriptions and are not part of the core Quran functionality.

**Location**: `src/index.ts` (lines marked with `===== DEMO TOOLS =====`)

## Demo Tools

### 1. `add` - Simple Math Addition

**Purpose**: Demonstrates basic MCP tool architecture and request/response handling.

**Description**: Add two numbers the MCP way

**Parameters**:
```typescript
{
  a: number,  // First number
  b: number   // Second number
}
```

**Returns**: The sum of `a` and `b`

**Example Usage**:
```
User: "What is 5 plus 3?"
Tool: add(5, 3)
Response: "8"
```

**Learning Points**:
- Simplest possible tool implementation
- Demonstrates parameter validation with Zod
- Shows how tools return text responses

**Status**: ✅ Available to all users

---

### 2. `userInfoOctokit` - Get GitHub User Info

**Purpose**: Demonstrates OAuth integration and using authenticated tokens with third-party SDKs.

**Description**: Get authenticated user info from GitHub - OAuth integration demo

**Parameters**: None

**Returns**: JSON object with the authenticated user's GitHub profile information

**Requires**: Valid GitHub OAuth token from authentication flow

**Example Response**:
```json
{
  "login": "github-username",
  "id": 12345,
  "name": "User Name",
  "email": "user@example.com",
  "bio": "User bio",
  "public_repos": 42,
  ...
}
```

**Learning Points**:
- How to use OAuth access tokens from the authentication flow
- Integration with third-party SDKs (Octokit)
- Accessing authenticated user context (`this.props!.accessToken`)

**Security Notes**:
- ⚠️ This tool exposes authenticated user information
- In production, consider the security and privacy implications
- User should explicitly opt-in to using this tool

**Status**: ✅ Available to all authenticated users

---

### 3. `generateImage` - AI Image Generation

**Purpose**: Demonstrates integration with Cloudflare Workers AI platform.

**Description**: Generate an image using Cloudflare Workers AI - image generation demo

**Parameters**:
```typescript
{
  prompt: string,    // Text description of the image to generate
  steps: number      // Diffusion steps (4-8, default: 4)
}
```

**Returns**: Binary image data (JPEG format) with `image/jpeg` MIME type

**Requirements**:
- Cloudflare Workers AI binding must be configured
- User must be added to `ALLOWED_USERNAMES` set
- API must have access to `@cf/black-forest-labs/flux-1-schnell` model

**Setup Instructions**:

1. **Enable Cloudflare AI in wrangler.jsonc**:
```jsonc
{
  "env": {
    "production": {
      "bindings": [
        {
          "name": "AI",
          "type": "ai"
        }
      ]
    }
  }
}
```

2. **Add your username** to `ALLOWED_USERNAMES` in `src/index.ts`:
```typescript
const ALLOWED_USERNAMES = new Set<string>([
  'your-github-username',
]);
```

3. **Test locally**:
```bash
pnpm dev
# Use the MCP server and try the generateImage tool
```

**Example Usage**:
```
User: "Generate an image of a beautiful mosque at sunset"
Parameters:
  prompt: "A beautiful mosque at sunset with golden light, architectural detail"
  steps: 6
Result: Binary JPEG image displayed in the MCP client
```

**Learning Points**:
- Access to Cloudflare Workers platform services
- Handling binary/image responses in MCP
- Role-based tool access control using `ALLOWED_USERNAMES`
- AI model integration in serverless environment

**Important Considerations**:
- 🔴 This tool is restricted to specific users for security/cost reasons
- Image generation takes a few seconds per request
- Cloudflare AI services may incur costs
- Current restrictions prevent unauthorized access to this resource

**Status**: 🔐 Available only to users in `ALLOWED_USERNAMES`

---

## How to Use Demo Tools

### Local Development

1. **Start the development server**:
```bash
pnpm dev
```

2. **Connect with an MCP client** (e.g., Claude Desktop):
   - Configure the client to connect to your local MCP server
   - Authenticate with GitHub OAuth

3. **Test demo tools**:
   - Try the `add` tool with simple math questions
   - Use `userInfoOctokit` to see your GitHub profile
   - Use `generateImage` (if configured) to create images

### Testing Specific Tools

#### Test `add`:
```
Input: "What is 10 + 20?"
Expected: "30"
```

#### Test `userInfoOctokit`:
```
Input: "Who am I on GitHub?"
Expected: Returns your GitHub profile information
```

#### Test `generateImage`:
```
Input: "Generate an image of a cat wearing sunglasses, steps=5"
Expected: Returns a JPEG image if you're in ALLOWED_USERNAMES
Expected: Error if you're not authorized
```

## Disabling Demo Tools

If you want to remove demo tools from your deployment:

1. **Comment out or delete** the demo tool registration code in `src/index.ts`
2. **For `generateImage`**: Remove or comment the entire `if (ALLOWED_USERNAMES.has(...))` block
3. **Redeploy**: Run `pnpm deploy` for Cloudflare Workers

## Production Considerations

### Should You Keep Demo Tools?

**Keep them if**:
- You're actively testing/developing MCP features
- You want to showcase MCP capabilities to stakeholders
- You're using them for documentation/learning purposes

**Remove them if**:
- You're deploying to production for end users
- You want to minimize surface area and security risk
- Your use case is purely functional (Quran queries only)

### Restricting Demo Tools

To make demo tools safer in production:

1. **Add access control**:
```typescript
if (ALLOWED_USERNAMES.has(this.props!.login)) {
  this.server.tool("add", ...);
}
```

2. **Add feature flags**:
```typescript
if ((this.env as any).ENABLE_DEMO_TOOLS === 'true') {
  this.server.tool("add", ...);
}
```

3. **Add role-based access**:
```typescript
if (isAdmin(this.props!.login)) {
  this.server.tool("add", ...);
}
```

## Learning Resources

- **MCP Documentation**: https://modelcontextprotocol.io/
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Cloudflare AI**: https://developers.cloudflare.com/workers/ai/
- **Octokit Documentation**: https://github.com/octokit/octokit.js

## Contributing Improvements

If you've created enhanced versions of these demo tools or new examples:
1. Consider contributing them back to the project
2. Follow the [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines
3. Include clear documentation and examples
4. Mark as `[DEMO]` to help others identify them

---

**Last Updated**: November 2025
