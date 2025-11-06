# Quran MCP Tools

This directory contains the Quran API integration for the MCP server.

## 📁 Structure

- **`client.ts`** - Quran API client initialization and configuration
- **`tools.ts`** - MCP tool definitions for Quran-related operations
- **`test.ts`** - Standalone test script to verify SDK functionality

## 🔧 Configuration

The Quran tools require the following environment variables (secrets):

- `QURAN_CLIENT_ID` - Your Quran Foundation API Client ID
- `QURAN_CLIENT_SECRET` - Your Quran Foundation API Client Secret

### Setting Secrets in Wrangler

```bash
# Set Quran API credentials
npx wrangler secret put QURAN_CLIENT_ID
npx wrangler secret put QURAN_CLIENT_SECRET
```

## 🛠️ Available Tools

### 1. `getVerse`

Fetches a Quranic verse by its key with optional translations, word-by-word breakdown, and tafsir.

**Parameters:**
- `verseKey` (string, required) - Verse key in 'chapter:verse' format (e.g., '2:255', '1:1')
- `translations` (number[], optional) - Array of translation IDs (e.g., [20] for English Sahih International)
- `includeWords` (boolean, optional) - Include word-by-word breakdown
- `includeTafsir` (boolean, optional) - Include tafsir (commentary)
- `tafsirIds` (number[], optional) - Array of tafsir IDs (e.g., [171] for Ibn Kathir)

**Example Usage:**
```typescript
// Simple verse fetch
await getVerse({ verseKey: "2:255" })

// With English translation
await getVerse({ 
  verseKey: "2:255", 
  translations: [20] 
})

// With word-by-word and tafsir
await getVerse({ 
  verseKey: "1:1",
  translations: [20],
  includeWords: true,
  includeTafsir: true,
  tafsirIds: [171]
})
```

## 🧪 Testing

### Standalone Testing (Outside MCP)

To test the Quran SDK independently:

1. Set environment variables:
   ```powershell
   $env:QURAN_CLIENT_ID="your-client-id"
   $env:QURAN_CLIENT_SECRET="your-client-secret"
   ```

2. Install tsx (if not already installed):
   ```bash
   pnpm add -D tsx
   ```

3. Run the test script:
   ```bash
   npx tsx src/quran/test.ts
   ```

The test script will verify:
- ✅ Authentication with Quran API
- ✅ Fetching verses (Arabic text)
- ✅ Fetching verses with translations
- ✅ Fetching all chapters
- ✅ Search functionality
- ✅ Word-by-word breakdown

### Testing in MCP

After deployment, you can test the tools through your MCP client (Claude Desktop, etc.):

```
User: "Get verse 2:255 from the Quran with English translation"
Assistant: [calls getVerse tool]
```

## 📚 Common Translation IDs

- **20** - English - Sahih International
- **131** - Urdu - Abul A'ala Maududi
- **171** - Tafsir Ibn Kathir (for tafsir)

To get a full list of available translations, you can add a `getTranslations` tool in the future.

## 🔄 Scaling Guide

To add more Quran tools:

1. **Add the tool function** in `tools.ts`:
   ```typescript
   export async function getChapter(client: QuranClient, params: GetChapterParams) {
     // implementation
   }
   ```

2. **Register the tool** in `src/index.ts`:
   ```typescript
   this.server.tool(
     "getChapter",
     "Description of the tool",
     getChapterSchema,
     async (params) => await getChapter(quranClient, params)
   );
   ```

3. **Test standalone** by adding tests to `test.ts`

### Suggested Tools to Add Next:

- ✨ `getChapter` - Get all verses from a chapter
- ✨ `searchQuran` - Search across Quran and translations
- ✨ `getChapterInfo` - Get chapter metadata and description
- ✨ `getJuz` - Get verses from a Juz (30 parts)
- ✨ `getRandomVerse` - Get a random verse (verse of the day)
- ✨ `getTranslations` - List all available translations
- ✨ `getTafsirs` - List all available tafsirs

## 📖 Documentation

For detailed SDK documentation, see:
- `/knowledge-base/Quran-SDK-Knowledgebase.md`
- [Official API Docs](https://api-docs.quran.foundation/docs/sdk/)

## 🐛 Troubleshooting

### "The request requires user authentication"
- Verify your `QURAN_CLIENT_ID` and `QURAN_CLIENT_SECRET` are set correctly
- Make sure secrets are deployed: `npx wrangler secret put QURAN_CLIENT_ID`

### "Invalid verse key"
- Ensure format is `chapter:verse` (e.g., "2:255" not "2-255")
- Chapter numbers: 1-114
- Verse numbers vary by chapter

### Type errors
- Run `npx wrangler types` to regenerate type definitions
- Make sure `worker-configuration.d.ts` includes Quran env variables
