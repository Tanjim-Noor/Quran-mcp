# Quran MCP Server with OAuth Authentication

This is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server that provides access to the Quran Foundation API with GitHub OAuth authentication. Users can query Quranic verses, translations, tafsir (commentary), and more through natural language interactions.

## 🕌 Features

- **Verse Retrieval**: Fetch any verse with Arabic text, translations, and metadata
- **Multiple Translations**: Support for 100+ translations in various languages
- **Word-by-Word Analysis**: Get detailed word breakdowns of verses
- **Tafsir (Commentary)**: Access scholarly interpretations and explanations
- **OAuth Authentication**: Secure access control via GitHub OAuth
- **Cloudflare Workers**: Fast, globally distributed serverless deployment

## 🚀 Available Tools

### `getVerse`
Fetch Quranic verses with optional translations, word analysis, and tafsir.

**Example queries:**
- "Get verse 2:255 from the Quran" (Ayat al-Kursi)
- "Show me verse 1:1 with English translation"
- "Get verse 112:1 with word-by-word breakdown"

See [src/quran/README.md](src/quran/README.md) for detailed documentation.

## 📋 Prerequisites

You'll need:
1. **GitHub OAuth App** - For user authentication
2. **Quran Foundation API Credentials** - [Request access here](https://quran.foundation/api-access)
3. **Cloudflare Account** - For deployment

## 🛠️ Setup

### 1. Install Dependencies

Clone the repo directly & install dependencies:
```bash
git clone <your-repo>
cd quran-mcp
pnpm install
```

### 2. Configure Secrets

Set up your API credentials and secrets:
#### GitHub OAuth App Setup

Create a new [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app): 
- Homepage URL: `https://quran-mcp.<your-subdomain>.workers.dev`
- Authorization callback URL: `https://quran-mcp.<your-subdomain>.workers.dev/callback`
- Note your Client ID and generate a Client secret

#### Quran Foundation API

Request API credentials from [Quran Foundation](https://quran.foundation/api-access)

#### Set Secrets via Wrangler

```bash
# GitHub OAuth
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put COOKIE_ENCRYPTION_KEY  # Generate: openssl rand -hex 32

# Quran Foundation API
npx wrangler secret put QURAN_CLIENT_ID
npx wrangler secret put QURAN_CLIENT_SECRET
```

> [!IMPORTANT]
> When you create the first secret, Wrangler will ask if you want to create a new Worker. Submit "Y" to create a new Worker and save the secret.

### 3. Set up KV Namespace

Create the KV namespace for OAuth state storage:
```bash
npx wrangler kv namespace create "OAUTH_KV"
```

Update `wrangler.jsonc` with the generated KV ID.

### 4. Test the SDK (Optional but Recommended)

Before deploying, test that your Quran API credentials work:

```powershell
# Set environment variables (PowerShell)
$env:QURAN_CLIENT_ID="your-client-id"
$env:QURAN_CLIENT_SECRET="your-client-secret"

# Install tsx for testing
pnpm add -D tsx

# Run the test script
npx tsx src/quran/test.ts
```

You should see successful API calls like:
```
✅ Environment variables found
✅ Quran client initialized
📖 Test 1: Fetching Ayat al-Kursi (2:255)...
✅ Success!
```

### 5. Deploy
Deploy the MCP server to Cloudflare Workers:
```bash
npx wrangler deploy
```

### 6. Test with MCP Inspector

Test the remote server using [Inspector](https://modelcontextprotocol.io/docs/tools/inspector): 

```bash
npx @modelcontextprotocol/inspector@latest
```

Enter `https://quran-mcp.<your-subdomain>.workers.dev/mcp` and connect.

### 7. Connect Claude Desktop

Open Claude Desktop: **Settings → Developer → Edit Config**

Add this configuration:

```json
{
  "mcpServers": {
    "quran": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://quran-mcp.<your-subdomain>.workers.dev/mcp"
      ]
    }
  }
}
```

Restart Claude Desktop and authenticate with GitHub. You can now ask Claude:
- "Get verse 2:255 from the Quran"
- "Show me the first verse of Al-Fatiha with translation"
- "What does verse 112:1 say?"

## 🧪 Local Development

For local testing, create another GitHub OAuth App with:
- Homepage URL: `http://localhost:8788`
- Authorization callback URL: `http://localhost:8788/callback`

Set local environment variables:
```powershell
$env:QURAN_CLIENT_ID="your-client-id"
$env:QURAN_CLIENT_SECRET="your-client-secret"
```

Run the dev server:
```bash
pnpm dev
```

## 📚 Documentation

- **[Quran Tools Documentation](src/quran/README.md)** - Detailed tool usage and API
- **[Authentication Guide](AUTHENTICATION.md)** - Complete OAuth2 authentication setup and troubleshooting
- **[Technical Integration](QURAN-INTEGRATION.md)** - Implementation details and architecture
- **[Quran SDK Knowledge Base](knowledge-base/Quran-SDK-Knowledgebase.md)** - Complete SDK reference
- **[Official API Docs](https://api-docs.quran.foundation/)** - Quran Foundation API

## 🔐 Authentication

The Quran API uses **OAuth2 Client Credentials** flow for authentication. The `@quranjs/api` SDK handles this **automatically**:

- ✅ **Automatic token acquisition** on first request
- ✅ **Token caching** for 1 hour (3600 seconds)
- ✅ **Automatic renewal** when tokens expire
- ✅ **Proper headers** (`x-auth-token`, `x-client-id`) sent with each request

**No manual token management required!**

See [AUTHENTICATION.md](AUTHENTICATION.md) for complete details on:
- How OAuth2 authentication works
- Environment configuration (production vs pre-production)
- Troubleshooting common issues
- Security best practices

## 🔐 Security

> [!WARNING]
> While we have implemented security controls, **you must review and implement all security measures before production deployment**. See [Securing MCP Servers](https://github.com/cloudflare/agents/blob/main/docs/securing-mcp-servers.md).

## 🛣️ Roadmap

Planned features:
- ✨ Search across Quran and translations
- ✨ Get chapter information and metadata  
- ✨ Fetch verses by Juz/Hizb/Page
- ✨ Random verse (verse of the day)
- ✨ List available translations and tafsirs
- ✨ Audio recitation support

See [src/quran/README.md](src/quran/README.md) for the full scaling guide.

## 📄 License

This project builds on the Cloudflare MCP template and integrates with the Quran Foundation API.

## 🤝 Contributing

Contributions welcome! Please:
1. Test your changes with `npx tsx src/quran/test.ts`
2. Follow the existing code structure in `src/quran/`
3. Update documentation as needed

---

Built with ❤️ using:
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Quran Foundation API](https://quran.foundation/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- Note your Client ID and generate a Client secret. 
- Create a `.dev.vars` file in your project root with: 
```
GITHUB_CLIENT_ID=your_development_github_client_id
GITHUB_CLIENT_SECRET=your_development_github_client_secret
```

#### Develop & Test
Run the server locally to make it available at `http://localhost:8788`
`wrangler dev`

To test the local server, enter `http://localhost:8788/sse` into Inspector and hit connect. Once you follow the prompts, you'll be able to "List Tools". 

#### Using Claude and other MCP Clients

When using Claude to connect to your remote MCP server, you may see some error messages. This is because Claude Desktop doesn't yet support remote MCP servers, so it sometimes gets confused. To verify whether the MCP server is connected, hover over the 🔨 icon in the bottom right corner of Claude's interface. You should see your tools available there.

#### Using Cursor and other MCP Clients

To connect Cursor with your MCP server, choose `Type`: "Command" and in the `Command` field, combine the command and args fields into one (e.g. `npx mcp-remote https://<your-worker-name>.<your-subdomain>.workers.dev/sse`).

Note that while Cursor supports HTTP+SSE servers, it doesn't support authentication, so you still need to use `mcp-remote` (and to use a STDIO server, not an HTTP one).

You can connect your MCP server to other MCP clients like Windsurf by opening the client's configuration file, adding the same JSON that was used for the Claude setup, and restarting the MCP client.

## How does it work? 

#### OAuth Provider
The OAuth Provider library serves as a complete OAuth 2.1 server implementation for Cloudflare Workers. It handles the complexities of the OAuth flow, including token issuance, validation, and management. In this project, it plays the dual role of:

- Authenticating MCP clients that connect to your server
- Managing the connection to GitHub's OAuth services
- Securely storing tokens and authentication state in KV storage

#### Durable MCP
Durable MCP extends the base MCP functionality with Cloudflare's Durable Objects, providing:
- Persistent state management for your MCP server
- Secure storage of authentication context between requests
- Access to authenticated user information via `this.props`
- Support for conditional tool availability based on user identity

#### MCP Remote
The MCP Remote library enables your server to expose tools that can be invoked by MCP clients like the Inspector. It:
- Defines the protocol for communication between clients and your server
- Provides a structured way to define tools
- Handles serialization and deserialization of requests and responses
- Maintains the Server-Sent Events (SSE) connection between clients and your server
