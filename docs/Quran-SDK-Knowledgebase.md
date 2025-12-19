# Quran SDK Documentation Knowledgebase

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Getting Started](#getting-started)
3. [Client Configuration](#client-configuration)
4. [Core APIs](#core-apis)
5. [Verses API](#verses-api)
6. [Chapters API](#chapters-api)
7. [Search API](#search-api)
8. [Resources API](#resources-api)
9. [Type Definitions](#type-definitions)
10. [Error Handling](#error-handling)
11. [Common Use Cases](#common-use-cases)
12. [Best Practices](#best-practices)

---

## Installation & Setup

### Package Installation

Install the Quran SDK via npm or other package managers:

```bash
npm install @quranjs/api
```

Alternative installation methods:

```bash
pnpm install @quranjs/api
yarn add @quranjs/api
bun add @quranjs/api
```

### Environment Variables

Create a `.env` file with your credentials:

```bash
QURAN_CLIENT_ID=your_client_id
QURAN_CLIENT_SECRET=your_client_secret
```

**Security Note:** Never commit credentials to version control. Keep your `client_id` and `client_secret` secure and confidential.

---

## Getting Started

### Quick Start Guide

```javascript
import { Language, QuranClient } from "@quranjs/api";

// Initialize the client
const client = new QuranClient({
  clientId: process.env.QURAN_CLIENT_ID!,
  clientSecret: process.env.QURAN_CLIENT_SECRET!,
  defaults: {
    language: Language.ENGLISH,
  },
});

// Fetch all chapters
const chapters = await client.chapters.findAll();

// Get a specific verse
const verse = await client.verses.findByKey("2:255", {
  translations: [20],
  words: true,
});

// Search
const results = await client.search.search("light", {
  language: Language.ENGLISH,
  size: 10,
});
```

### First Steps

1. **Request API Access**: Visit the Quran Foundation API request page to obtain your Client ID and Client Secret
2. **Set Environment Variables**: Configure your credentials in a `.env` file
3. **Initialize Client**: Create a QuranClient instance with your credentials
4. **Start Making Requests**: Use the client to fetch Quranic data

---

## Client Configuration

### Runtime Configuration

Access and modify client configuration at runtime:

```javascript
// Get current config
const config = client.getConfig();

// Update config
client.updateConfig({
  defaults: { language: Language.ARABIC },
});

// Clear cached authentication token
client.clearCachedToken();
```

### Available Languages

The SDK supports multiple languages through the `Language` enum:

- `Language.ENGLISH` - English
- `Language.ARABIC` - Arabic
- `Language.URDU` - Urdu

Language can be set as a default configuration or overridden per request.

---

## Core APIs

The Quran SDK provides several core APIs organized by functionality:

### API Organization

| API Module | Purpose |
|-----------|---------|
| **Chapters** | Access information about the 114 chapters (Surahs) of the Quran |
| **Verses** | Retrieve individual verses with translations, audio, and word-level data |
| **Search** | Full-text search across Arabic verses and translations |
| **Resources** | Fetch metadata about translations, tafsirs, recitations, and languages |

---

## Verses API

### Get Verse by Key

Retrieve a specific verse using the `chapter:verse` notation:

```javascript
const verse = await client.verses.findByKey("2:255");
const firstVerse = await client.verses.findByKey("1:1");
const lastVerse = await client.verses.findByKey("114:6");
```

### Verse Type Structure

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Database identifier for the verse |
| `verseNumber` | `number` | Verse number within the surah |
| `verseKey` | `string` | Verse key in `chapter:verse` format |
| `chapterId` | `number \| string` | Chapter that contains the verse |
| `pageNumber` | `number` | Mushaf page containing the verse |
| `juzNumber` | `number` | Juz where the verse appears |
| `hizbNumber` | `number` | Hizb number (1–60) |
| `rubElHizbNumber` | `number` | Rub' position within the Hizb |
| `words` | `Word[]` | Optional word-level metadata |
| `textUthmani*` | `string` | Various Uthmani scripts (`textUthmani`, `textUthmaniSimple`, `textUthmaniTajweed`) |
| `textImlaei*` | `string` | Imlaei script variants (`textImlaei`, `textImlaeiSimple`) |
| `textIndopak*` | `string` | IndoPak script variants (`textIndopak`, `textIndopakNastaleeq`) |
| `imageUrl` | `string` | Optional rendered verse image URL |
| `imageWidth` | `number` | Width for the rendered image |
| `translations` | `Translation[]` | Translations returned with the verse |
| `tafsirs` | `Tafsir[]` | Tafsir entries returned with the verse |
| `audio` | `AudioResponse` | Optional audio metadata |

### Retrieve Verses with Translations

```javascript
const verse = await client.verses.findByKey("2:255", {
  translations: [20, 131], // English and Urdu
  words: true,
  translationFields: {
    languageName: true,
    resourceName: true,
    verseKey: true,
  },
});
```

### Retrieve Verses with Audio

```javascript
const verse = await client.verses.findByKey("1:1", {
  reciter: 2,
  words: true,
});
```

### Retrieve Verses with Tafsir

```javascript
const verse = await client.verses.findByKey("1:1", {
  tafsirs: [171],
  translations: [20],
});
```

### Get Verses by Chapter

```javascript
const verses = await client.verses.findByChapter("1");

const paginated = await client.verses.findByChapter("2", {
  translations: [20],
  perPage: 10,
  page: 1,
  words: true,
});
```

### Get Verses by Page

```javascript
const firstPage = await client.verses.findByPage("1");

const page42 = await client.verses.findByPage("42", {
  translations: [131],
});
```

### Get Verses by Divisions

The Quran is divided into various sections for different reading schedules:

```javascript
// By Juz (30 equal parts)
const juz1 = await client.verses.findByJuz("1");

// By Hizb (60 equal parts)
const hizb1 = await client.verses.findByHizb("1");

// By Rub (240 quarter sections)
const rub1 = await client.verses.findByRub("1");
```

### Get Random Verse

```javascript
const random = await client.verses.findRandom({
  translations: [20],
  words: true,
});
```

### Field Selection

#### Word Fields

Select specific word-level metadata:

```javascript
const verse = await client.verses.findByKey("1:1", {
  words: true,
  wordFields: {
    textUthmani: true,
    verseKey: true,
    location: true,
  },
});
```

#### Translation Fields

Select specific translation metadata:

```javascript
const verse = await client.verses.findByKey("2:255", {
  translations: [20, 131],
  translationFields: {
    languageName: true,
    resourceName: true,
    verseKey: true,
  },
});
```

#### Verse Fields

Select specific verse-level fields:

```javascript
const verse = await client.verses.findByKey("1:1", {
  fields: {
    textUthmani: true,
    textUthmaniTajweed: true,
    codeV1: true,
    v1Page: true,
  },
});
```

### Pagination

Control results pagination when fetching multiple verses:

```javascript
const verses = await client.verses.findByChapter("2", {
  page: 1,
  perPage: 20,
  translations: [20],
});
```

---

## Chapters API

### Get All Chapters

Retrieve information about all 114 chapters of the Quran:

```javascript
const chapters = await client.chapters.findAll();

chapters.forEach((chapter) => {
  console.log(`${chapter.id}. ${chapter.nameSimple} (${chapter.nameArabic})`);
  console.log(` Verses: ${chapter.versesCount}`);
  console.log(` Revelation: ${chapter.revelationPlace}`);
});
```

### Chapter Type Structure

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Sequential chapter identifier |
| `versesCount` | `number` | Total verses in the chapter |
| `bismillahPre` | `boolean` | Indicates if Bismillah precedes the chapter |
| `revelationOrder` | `number` | Order of revelation |
| `revelationPlace` | `string` | `meccan` or `medinan` |
| `pages` | `number[]` | Mushaf page range for the chapter |
| `nameComplex` | `string` | Full transliterated name (e.g., `Al-Baqarah`) |
| `nameSimple` | `string` | Common English name |
| `transliteratedName` | `string` | Transliteration suitable for URLs |
| `nameArabic` | `string` | Arabic chapter name |
| `translatedName` | `TranslatedName` | Localized name with language metadata |

### Get Chapter with Language Options

```javascript
import { Language } from "@quranjs/api";

const arabicChapters = await client.chapters.findAll({
  language: Language.ARABIC,
});

const urduChapters = await client.chapters.findAll({
  language: Language.URDU,
});
```

### Get Chapter by ID

Retrieve a specific chapter:

```javascript
const alFatiha = await client.chapters.findById("1");
const alBaqarah = await client.chapters.findById("2");
const anNas = await client.chapters.findById("114");
```

### Get Chapter Info

Fetch detailed information about a chapter:

```javascript
const info = await client.chapters.findInfoById("1");

console.log(info.shortText); // Brief description
console.log(info.text); // Full description
console.log(info.source); // Source attribution
```

### ChapterInfo Type Structure

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Unique identifier for the info record |
| `chapterId` | `number` | Chapter the info is associated with |
| `text` | `string` | Full descriptive text |
| `shortText` | `string` | Condensed overview for quick display |
| `source` | `string` | Attribution for the content |
| `languageName` | `string` | Language of the info text (e.g., `english`) |

---

## Search API

### Basic Search

Perform full-text search across Quranic content:

```javascript
const results = await client.search.search("light");

console.log(`Found ${results.totalResults} results`);

(results.results ?? []).forEach((result) => {
  console.log(`${result.verseKey}: ${result.highlighted ?? result.text}`);
});
```

### SearchResult Type

| Field | Type | Notes |
|-------|------|-------|
| `verseKey` | `string` | Verse identifier such as `24:35` |
| `verseId` | `number` | Internal verse identifier |
| `text` | `string` | Matched verse text without highlighting applied |
| `highlighted` | `string` | HTML string with emphasized query matches |
| `words` | `Word[]` | Word-level metadata for the verse |
| `translations` | `Translation[]` | Translations returned with the result set |

### Search with Language

```javascript
import { Language } from "@quranjs/api";

const english = await client.search.search("mercy", {
  language: Language.ENGLISH,
});

const arabic = await client.search.search("رحمة", {
  language: Language.ARABIC,
});

const urdu = await client.search.search("رحمت", {
  language: Language.URDU,
});
```

### Pagination

Control search results pagination:

```javascript
const results = await client.search.search("mercy", {
  size: 10, // Results per page (default: 30)
  page: 1, // Page number
  language: Language.ENGLISH,
});

console.log(`Page ${results.currentPage} of ${results.totalPages}`);
```

---

## Resources API

The Resources API provides metadata about available translations, tafsirs, recitations, and other Quranic resources.

### Recitations

#### Get All Recitations

```javascript
const recitations = await client.resources.findAllRecitations();

recitations.forEach((r) => {
  console.log(`${r.id}. ${r.reciterName ?? "Unknown"} (${r.style ?? "N/A"})`);
});
```

#### RecitationResource Type

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Unique identifier for the recitation |
| `reciterName` | `string` | Reciter's full name |
| `style` | `string` | Recitation style such as `murattal` |
| `translatedName` | `TranslatedName` | Localized display names |

#### Get Recitation Details

```javascript
const info = await client.resources.findRecitationInfo("2");

console.log(info.info); // Rich text/HTML describing the recitation
```

#### RecitationInfoResource Type

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Recitation identifier |
| `info` | `string` | Biography or extended information about the reciter |

### Translations

#### Get All Translations

```javascript
const translations = await client.resources.findAllTranslations();

const english = translations.filter((t) => t.languageName === "english");
const urdu = translations.filter((t) => t.languageName === "urdu");
```

#### TranslationResource Type

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Translation identifier |
| `name` | `string` | Translation title |
| `authorName` | `string` | Translator's name |
| `slug` | `string` | URL-friendly slug |
| `languageName` | `string` | Language of the translation |
| `translatedName` | `TranslatedName` | Localized names and language metadata |

#### Get Translation Details

```javascript
const info = await client.resources.findTranslationInfo("131");

console.log(info.info); // Information about the translation (HTML/string)
```

#### TranslationInfoResource Type

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Translation identifier |
| `info` | `string` | Extended translation details or biography |

### Tafsirs

#### Get All Tafsirs

```javascript
const tafsirs = await client.resources.findAllTafsirs();

tafsirs.forEach((t) => {
  console.log(`${t.name} by ${t.authorName}`);
});
```

#### TafsirResource Type

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Tafsir identifier |
| `name` | `string` | Tafsir title |
| `authorName` | `string` | Author of the tafsir |
| `slug` | `string` | URL-friendly identifier |
| `languageName` | `string` | Language of the tafsir |
| `translatedName` | `TranslatedName` | Localized name entries |

#### Get Tafsir Details

```javascript
const info = await client.resources.findTafsirInfo("171");

console.log(info.name); // "Tafsir Ibn Kathir"
console.log(info.authorName); // "Ibn Kathir"
console.log(info.bio);
```

#### TafsirInfoResource Type

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Tafsir identifier |
| `info` | `string` | Detailed description or biography |

### Languages

#### Get All Languages

```javascript
const languages = await client.resources.findAllLanguages();

languages.forEach((lang) => {
  console.log(`${lang.name} (${lang.isoCode}) - native: ${lang.nativeName}`);
});
```

#### LanguageResource Type

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Language identifier |
| `name` | `string` | English name of the language |
| `nativeName` | `string` | Native script name |
| `isoCode` | `string` | ISO code (e.g., `en`) |
| `direction` | `string` | Text direction such as `ltr` or `rtl` |
| `translatedNames` | `TranslatedName[]` | Available localized names |

### Chapter Resources

#### Chapter Information

```javascript
const chapterInfos = await client.resources.findAllChapterInfos();

chapterInfos.forEach((info) => {
  console.log(`${info.name} - ${info.languageName}`);
});
```

#### ChapterInfoResource Type

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Resource identifier |
| `name` | `string` | Title of the chapter info resource |
| `authorName` | `string` | Author attribution |
| `slug` | `string` | URL-friendly identifier |
| `languageName` | `string` | Language of the chapter info |
| `translatedName` | `TranslatedName` | Localized names for the resource |

#### Chapter Reciters

```javascript
const reciters = await client.resources.findAllChapterReciters();

reciters.forEach((r) => {
  console.log(`${r.name} (${r.arabicName ?? "n/a"})`);
});
```

#### ChapterReciterResource Type

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Reciter identifier |
| `name` | `string` | Reciter name |
| `arabicName` | `string` | Arabic display name |
| `relativePath` | `string` | Relative file path for audio |
| `format` | `string` | Audio format, e.g., `mp3` |
| `filesSize` | `number` | Total file size in kilobytes |

### Recitation Styles

#### Get All Recitation Styles

```javascript
const styles = await client.resources.findAllRecitationStyles();

console.log(styles.murattal); // Murattal reciters
console.log(styles.mujawwad); // Mujawwad reciters
```

#### RecitationStylesResource Type

| Field | Type | Notes |
|-------|------|-------|
| `mujawwad` | `string` | Label for Mujawwad-style recitations |
| `murattal` | `string` | Label for Murattal-style recitations |
| `muallim` | `string` | Label for teaching-style recitations |

### Verse Media

#### Get Verse Media

```javascript
const media = await client.resources.findVerseMedia();

console.log(media.name); // Resource name
console.log(media.languageName); // Language associated with the resource
```

#### VerseMediaResource Type

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Media identifier |
| `name` | `string` | Media name |
| `authorName` | `string` | Author or curator name |
| `languageName` | `string` | Language associated with the resource |

---

## Type Definitions

### Core Types

#### Language Enum

The SDK provides a `Language` enum for specifying language preferences:

```javascript
enum Language {
  ENGLISH = "en",
  ARABIC = "ar",
  URDU = "ur",
  // ... other supported languages
}
```

#### TranslatedName

Used to represent localized names across resources:

```javascript
interface TranslatedName {
  languageName: string;
  name: string;
  // Optional localization metadata
}
```

#### Word

Represents word-level metadata:

```javascript
interface Word {
  textUthmani?: string;
  verseKey?: string;
  location?: string;
  // ... other word properties
}
```

#### Translation

Represents a verse translation:

```javascript
interface Translation {
  id?: number;
  languageName?: string;
  resourceName?: string;
  verseKey?: string;
  text: string;
  // ... other translation properties
}
```

#### Tafsir

Represents tafsir (exegesis) information:

```javascript
interface Tafsir {
  id?: number;
  text: string;
  languageName?: string;
  resourceName?: string;
  // ... other tafsir properties
}
```

#### AudioResponse

Represents audio metadata:

```javascript
interface AudioResponse {
  url?: string;
  duration?: number;
  format?: string;
  // ... other audio properties
}
```

---

## Error Handling

### Common Error Codes

The API may return various error codes:

| Status Code | Error Type | Description |
|------------|-----------|-------------|
| 400 | `invalid_request` | Bad request or invalid parameters |
| 401 | `unauthorized` | Missing or invalid authentication credentials |
| 403 | `forbidden` | Access denied or insufficient permissions |
| 404 | `not_found` | Resource not found |
| 422 | `unprocessable_entity` | Validation error |
| 429 | `rate_limit_exceeded` | Too many requests |
| 500 | `internal_server_error` | Server error |
| 502 | `bad_gateway` | Service gateway error |
| 503 | `service_unavailable` | Service temporarily unavailable |
| 504 | `gateway_timeout` | Request timeout |

### Error Handling Pattern

```javascript
try {
  const verse = await client.verses.findByKey("2:255");
  console.log(verse);
} catch (error) {
  if (error.status === 404) {
    console.error("Verse not found");
  } else if (error.status === 401) {
    console.error("Authentication failed");
  } else {
    console.error("API error:", error.message);
  }
}
```

### Authentication Errors

Authentication failures typically occur when:

- Missing or invalid Client ID
- Missing or invalid Client Secret
- Credentials not properly set in environment variables
- Access token has expired

Re-authenticate by creating a new QuranClient instance or calling `client.clearCachedToken()` followed by another request.

---

## Common Use Cases

### Use Case 1: Display Verse with Translation

```javascript
async function getVerseWithTranslation(verseKey, translationId) {
  const verse = await client.verses.findByKey(verseKey, {
    translations: [translationId],
  });
  
  console.log(`Arabic: ${verse.textUthmani}`);
  console.log(`Translation: ${verse.translations?.[0]?.text}`);
}

// Usage
getVerseWithTranslation("2:255", 20); // English translation
```

### Use Case 2: Search and Display Results

```javascript
async function searchAndDisplay(query) {
  const results = await client.search.search(query, {
    size: 10,
    language: Language.ENGLISH,
  });
  
  results.results?.forEach((result) => {
    console.log(`${result.verseKey}: ${result.highlighted}`);
  });
}

// Usage
searchAndDisplay("mercy");
```

### Use Case 3: Get Chapter Information

```javascript
async function displayChapterInfo(chapterId) {
  const chapter = await client.chapters.findById(chapterId);
  const info = await client.chapters.findInfoById(chapterId);
  
  console.log(`Chapter ${chapter.id}: ${chapter.nameSimple}`);
  console.log(`Verses: ${chapter.versesCount}`);
  console.log(`Revelation: ${chapter.revelationPlace}`);
  console.log(`\nDescription:\n${info.text}`);
}

// Usage
displayChapterInfo("1");
```

### Use Case 4: Get All Available Translations

```javascript
async function listAvailableTranslations() {
  const translations = await client.resources.findAllTranslations();
  
  const byLanguage = {};
  translations.forEach((t) => {
    if (!byLanguage[t.languageName]) {
      byLanguage[t.languageName] = [];
    }
    byLanguage[t.languageName].push({
      id: t.id,
      name: t.name,
      author: t.authorName,
    });
  });
  
  return byLanguage;
}
```

### Use Case 5: Get Chapter with All Verses and Translation

```javascript
async function getChapterFull(chapterId, translationId) {
  const verses = await client.verses.findByChapter(chapterId, {
    translations: [translationId],
    perPage: 300, // Fetch all at once
  });
  
  return verses;
}

// Usage
const surah = await getChapterFull("1", 20); // Al-Fatiha with English
```

### Use Case 6: Get Verse by Juz (Reading Schedule)

```javascript
async function getVersesByReadingSchedule(juzNumber) {
  const verses = await client.verses.findByJuz(juzNumber, {
    translations: [20],
    words: true,
  });
  
  return verses;
}
```

### Use Case 7: Get Random Verse

```javascript
async function getRandomVerseDaily() {
  const verse = await client.verses.findRandom({
    translations: [20],
    words: true,
  });
  
  console.log("Verse of the day:");
  console.log(`${verse.verseKey}: ${verse.translations?.[0]?.text}`);
}
```

---

## Best Practices

### 1. Environment Variable Management

Always use environment variables for sensitive credentials:

```javascript
// ✅ Good
const client = new QuranClient({
  clientId: process.env.QURAN_CLIENT_ID!,
  clientSecret: process.env.QURAN_CLIENT_SECRET!,
});

// ❌ Bad - Never hardcode credentials
const client = new QuranClient({
  clientId: "abc123",
  clientSecret: "secret456",
});
```

### 2. Error Handling

Always implement proper error handling:

```javascript
// ✅ Good
try {
  const verse = await client.verses.findByKey("2:255");
} catch (error) {
  console.error("Failed to fetch verse:", error);
  // Handle error appropriately
}

// ❌ Bad - Unhandled promise rejection
client.verses.findByKey("2:255");
```

### 3. Caching

Implement caching for frequently accessed resources to reduce API calls:

```javascript
const translationCache = new Map();

async function getTranslationsCached() {
  if (translationCache.has("translations")) {
    return translationCache.get("translations");
  }
  
  const translations = await client.resources.findAllTranslations();
  translationCache.set("translations", translations);
  return translations;
}
```

### 4. Pagination

Use pagination when fetching large datasets:

```javascript
async function getAllVersesPaginated(chapterId, translationId) {
  let page = 1;
  let allVerses = [];
  let hasMore = true;
  
  while (hasMore) {
    const verses = await client.verses.findByChapter(chapterId, {
      translations: [translationId],
      page,
      perPage: 50,
    });
    
    allVerses = [...allVerses, ...verses.verses];
    hasMore = page < verses.pagination.totalPages;
    page++;
  }
  
  return allVerses;
}
```

### 5. Language Defaults

Set default language to reduce parameter repetition:

```javascript
client.updateConfig({
  defaults: { language: Language.ENGLISH },
});

// Now language doesn't need to be specified in each call
const results = await client.search.search("mercy"); // Uses English by default
```

### 6. Field Selection

Only request fields you need to optimize response size:

```javascript
// ✅ Good - Only fetch needed fields
const verse = await client.verses.findByKey("2:255", {
  fields: { textUthmani: true },
  translationFields: { text: true },
});

// ❌ Bad - Fetching unnecessary data
const verse = await client.verses.findByKey("2:255", {
  // Fetches all available fields
});
```

### 7. Request Optimization

Combine data fetching when possible:

```javascript
// ✅ Good - Single request with all needed data
const verse = await client.verses.findByKey("2:255", {
  translations: [20, 131],
  tafsirs: [171],
  words: true,
  reciter: 2,
});

// ❌ Bad - Multiple requests for the same verse
const verse = await client.verses.findByKey("2:255");
const translations = await client.resources.findAllTranslations();
const tafsirs = await client.resources.findAllTafsirs();
```

### 8. Token Management

Clear cached tokens when switching accounts:

```javascript
function switchAccount(newClientId, newClientSecret) {
  client.clearCachedToken();
  client.updateConfig({
    clientId: newClientId,
    clientSecret: newClientSecret,
  });
}
```

### 9. Type Safety

Always use TypeScript for better type safety:

```typescript
import { Language, QuranClient, Verse } from "@quranjs/api";

async function getVerse(verseKey: string): Promise<Verse> {
  const verse = await client.verses.findByKey(verseKey);
  return verse;
}
```

### 10. Rate Limiting

Implement backoff strategies for rate limits:

```javascript
async function fetchWithRetry(fetchFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        // Rate limited - wait before retrying
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Usage
const verse = await fetchWithRetry(() =>
  client.verses.findByKey("2:255")
);
```

---

## Reference Information

### Important Links

- **Documentation**: https://api-docs.quran.foundation/docs/sdk/
- **Package**: https://www.npmjs.com/package/@quranjs/api
- **GitHub**: https://github.com/quran/api-js

### Additional Resources

- **Quran Foundation**: https://quran.foundation
- **Quran.com**: https://quran.com
- **API Status**: Check official documentation for service status

---

*This knowledgebase was compiled from the official Quran SDK documentation. For the most current and detailed information, please refer to the official documentation at https://api-docs.quran.foundation/docs/sdk/*
