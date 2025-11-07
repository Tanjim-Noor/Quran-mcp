# Quran MCP Server with OAuth Authentication

This is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server that provides access to the Quran Foundation API with GitHub OAuth authentication. Users can query Quranic verses, translations, tafsir (commentary), and more through natural language interactions.

---

### 📖 Quick Links for Contributors

| Getting Started | Community |
|---|---|
| 📋 [Code of Conduct](CODE_OF_CONDUCT.md) | 🐛 [Report a Bug](https://github.com/Tanjim-Noor/Quran-mcp/issues/new?template=bug_report.md) |
| 🤝 [Contributing Guide](CONTRIBUTING.md) | ✨ [Request a Feature](https://github.com/Tanjim-Noor/Quran-mcp/issues/new?template=feature_request.md) |
| 🔀 [PR Template Guide](.github/PULL_REQUEST_TEMPLATE/pull_request_template.md) | 📝 [Suggest Documentation](https://github.com/Tanjim-Noor/Quran-mcp/issues/new?template=documentation.md) |
| 🔒 [Security Policy](SECURITY.md) | 💬 [Discussions](https://github.com/Tanjim-Noor/Quran-mcp/discussions) |

---

## 🕌 Features

- **Translation Discovery**: Browse 125+ translations across 56+ languages
- **Verse Retrieval**: Fetch any verse with Arabic text, translations, and metadata
- **Multiple Translations**: Support for 100+ translations in various languages
- **Word-by-Word Analysis**: Get detailed word breakdowns of verses
- **Tafsir (Commentary)**: Access scholarly interpretations and explanations
- **OAuth Authentication**: Secure access control via GitHub OAuth
- **Cloudflare Workers**: Fast, globally distributed serverless deployment

## 🚀 Available Tools

### `getAvailableTranslations`
Discover available Quran translations and their IDs for use with `getVerse`.

**Example queries:**
- "What English translations are available?"
- "Show me all Urdu translations"
- "List all available Quran translations"

**Supported languages:** English, Urdu, Arabic, Spanish, French, Turkish, Bengali, Indonesian, Russian, Persian, and 40+ more languages with 125+ total translations.

### `getVerse`
Fetch Quranic verses with optional translations, word analysis, and tafsir. Use `getAvailableTranslations` first to discover translation IDs.

**Example queries:**
- "Get verse 2:255 from the Quran" (Ayat al-Kursi)
- "Show me verse 1:1 with English translation ID 20"
- "Get verse 112:1 with word-by-word breakdown and translation"

**Workflow:**
1. Use `getAvailableTranslations` to find translation IDs
2. Use `getVerse` with the discovered IDs

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

To test the new translation discovery tool:
```bash
pnpm test:sdk:translations
```

### 5. Deploy
Deploy the MCP server to Cloudflare Workers:
```bash
npx wrangler deploy
```

### 6. Connect MCP Clients

Once deployed, you can connect various MCP clients to your server. Replace `<your-subdomain>` with your actual Cloudflare Workers subdomain.

#### 🔍 MCP Inspector (Testing & Debugging)

Test the remote server using [Inspector](https://modelcontextprotocol.io/docs/tools/inspector): 

```bash
npx @modelcontextprotocol/inspector@latest
```

Enter `https://quran-mcp.<your-subdomain>.workers.dev/mcp` and connect.

---

#### 🤖 Claude Desktop

**Location:** `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac)

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

**Restart Claude Desktop** and authenticate with GitHub. You can now ask Claude:
- "What English translations are available?"
- "Get verse 2:255 from the Quran with English translation"
- "Show me the first verse of Al-Fatiha with Urdu translation"
- "What does verse 112:1 say?"

---

#### ⚡ Cursor

**Location:** `.vscode/mcp.json` in your workspace

Create or edit `.vscode/mcp.json`:

```json
{
  "servers": {
    "https://quran-mcp.<your-subdomain>.workers.dev": {
      "url": "https://quran-mcp.<your-subdomain>.workers.dev/sse",
      "type": "http"
    }
  },
  "inputs": []
}
```

**Note:** Cursor uses the `/sse` (Server-Sent Events) endpoint.

**Restart Cursor** and authenticate with GitHub when prompted. The Quran tools will be available in Cursor's AI chat.

---

#### 🔷 GitHub Copilot (VS Code)

**Location:** `.vscode/mcp.json` in your workspace

Same configuration as Cursor:

```json
{
  "servers": {
    "https://quran-mcp.<your-subdomain>.workers.dev": {
      "url": "https://quran-mcp.<your-subdomain>.workers.dev/sse",
      "type": "http"
    }
  },
  "inputs": []
}
```

**Reload VS Code** (`Ctrl+Shift+P` → "Developer: Reload Window") and authenticate with GitHub. The tools will be available when using GitHub Copilot Chat.

---

#### 📱 Other MCP Clients

For other MCP-compatible clients, use one of these endpoints:

- **Modern clients (Streamable HTTP):** `https://quran-mcp.<your-subdomain>.workers.dev/mcp`
- **Legacy clients (SSE):** `https://quran-mcp.<your-subdomain>.workers.dev/sse`

---

#### 🔐 Authentication Flow

All clients will redirect you to GitHub OAuth for authentication:

1. Click the authorization link provided by the client
2. Approve the GitHub OAuth app
3. You'll be redirected back to the MCP server
4. Authentication complete! Start querying Quranic verses

---

### 7. Example Queries

Once connected, try these natural language queries:

**Translation Discovery:**
- "What English translations are available?"
- "Show me all Urdu translations"
- "List available Quran translations for Spanish"

**Verse Retrieval:**
- "Get verse 2:255 from the Quran" (Ayat al-Kursi)
- "Show me verse 1:1 with English translation"
- "Get Surah Al-Ikhlas (chapter 112) with Urdu translation"
- "What does verse 18:10 say with word-by-word breakdown?"
- "Get verse 2:255 with tafsir (commentary)"

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
- **[Translation Tool Guide](src/quran/TRANSLATIONS-TOOL.md)** - How to discover and use translation IDs
- **[Authentication Guide](AUTHENTICATION.md)** - Complete OAuth2 authentication setup and troubleshooting
- **[Technical Integration](QURAN-INTEGRATION.md)** - Implementation details and architecture
- **[Quran SDK Knowledge Base](knowledge-base/Quran-SDK-Knowledgebase.md)** - Complete SDK reference
- **[Available Resources](knowledge-base/AVAILABLE-RESOURCES.md)** - Complete list of translations and tafsirs
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

Implemented features:
- ✅ Verse retrieval with translations, word-by-word, and tafsir
- ✅ List available translations by language

Planned features:
- ✨ List available tafsirs (commentaries)
- ✨ Search across Quran and translations
- ✨ Get chapter information and metadata  
- ✨ Fetch verses by Juz/Hizb/Page
- ✨ Random verse (verse of the day)
- ✨ Audio recitation support

See [src/quran/README.md](src/quran/README.md) for the full scaling guide.

## 📄 License

This project builds on the Cloudflare MCP template and integrates with the Quran Foundation API.

## 🤝 Contributing & Community

We welcome contributions from the community! Here's how to get involved:

### 📋 Before Contributing
- **Read our [Code of Conduct](CODE_OF_CONDUCT.md)** - Please be respectful and inclusive
- **Review [CONTRIBUTING.md](CONTRIBUTING.md)** - Complete guide on how to contribute, code style, and commit conventions

### 🐛 Report a Bug
Found an issue? Use our [bug report template](https://github.com/Tanjim-Noor/Quran-mcp/issues/new?template=bug_report.md) to help us understand and fix it quickly.

### ✨ Request a Feature
Have an idea? Share it using our [feature request template](https://github.com/Tanjim-Noor/Quran-mcp/issues/new?template=feature_request.md).

### 📝 Improve Documentation
Spotted unclear documentation? Use our [documentation issue template](https://github.com/Tanjim-Noor/Quran-mcp/issues/new?template=documentation.md).

### 🔀 Submit Code Changes

1. **Fork the repository** and create your feature branch
2. **Follow our guidelines**:
   - Test your changes: `pnpm type-check && pnpm test:sdk`
   - Follow code style guidelines (TypeScript, camelCase, JSDoc comments)
   - Reference related issues in your commits
3. **Create a Pull Request** using our [PR template](.github/PULL_REQUEST_TEMPLATE/pull_request_template.md)
4. **Address feedback** from reviewers
5. **Celebrate** when merged! 🎉

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed step-by-step instructions.

### 🔒 Security

Found a security vulnerability? Please **do not** open a public issue. Instead, follow our [Security Policy](SECURITY.md) for responsible disclosure.

### 💬 Questions or Discussion?

- Open an issue with the `question` label
- Check the [knowledge-base/](knowledge-base/) for existing documentation
- Join [GitHub Discussions](https://github.com/Tanjim-Noor/Quran-mcp/discussions)

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

## 📖 Additional Resources

- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards and expectations
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute code, report bugs, and request features
- **[GitHub Issues](https://github.com/Tanjim-Noor/Quran-mcp/issues)** - Report bugs using our templates
- **[GitHub Discussions](https://github.com/Tanjim-Noor/Quran-mcp/discussions)** - Ask questions and discuss ideas

## 📄 License

This project is licensed under the **[MIT License](LICENSE)**.

---

Built with ❤️ using:
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Quran Foundation API](https://quran.foundation/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
