/**
 * Quran SDK Chapter Test Script
 *
 * This script specifically tests chapter retrieval functionality.
 * It tests different chapter IDs and API call formats to understand chapter data.
 *
 * Usage Option 1 (Recommended - uses .dev.vars):
 *   1. Create .dev.vars file: cp .dev.vars.example .dev.vars
 *   2. Add your credentials to .dev.vars
 *   3. Run: pnpm exec tsx src/quran/test_chapter.ts
 *
 * Usage Option 2 (Manual environment variables):
 *   1. Set env vars: $env:QURAN_CLIENT_ID="..." and $env:QURAN_CLIENT_SECRET="..."
 *   2. Run: pnpm exec tsx src/quran/test_chapter.ts
 */

import { Language } from "@quranjs/api";
import { createQuranClient, QuranEnvironment } from "./client";
import { config } from "dotenv";
import { resolve } from "path";

// Load .dev.vars file if it exists
try {
  config({ path: resolve(process.cwd(), ".dev.vars") });
  console.log("📄 Loaded credentials from .dev.vars file\n");
} catch (error) {
  console.log("⚠️  No .dev.vars file found, using environment variables\n");
}

/**
 * Test chapter IDs
 */
const TEST_CHAPTERS = [1];

/**
 * Main test function
 */
async function runChapterTests() {
  console.log("🕌 Starting Quran SDK Chapter Tests...\n");

  // Check for required environment variables
  const clientId = process.env.QURAN_CLIENT_ID;
  const clientSecret = process.env.QURAN_CLIENT_SECRET;
  const envType =
    process.env.QURAN_ENV?.toLowerCase() === "pre-production"
      ? QuranEnvironment.PRE_PRODUCTION
      : QuranEnvironment.PRODUCTION;

  if (!clientId || !clientSecret) {
    console.error("❌ Error: Missing required environment variables");
    console.error("Please either:");
    console.error("\n1. Create .dev.vars file (recommended):");
    console.error("   cp .dev.vars.example .dev.vars");
    console.error("   # Then edit .dev.vars with your credentials");
    console.error("\nOr set environment variables temporarily:");
    console.error('   $env:QURAN_CLIENT_ID="your-client-id"');
    console.error('   $env:QURAN_CLIENT_SECRET="your-client-secret"');
    console.error('   $env:QURAN_ENV="production" # or "pre-production"');
    process.exit(1);
  }

  console.log("✅ Environment variables found\n");

  // Initialize the Quran client
  const client = createQuranClient({
    clientId,
    clientSecret,
    defaultLanguage: Language.ENGLISH,
    environment: envType,
  });

  console.log("✅ Quran client initialized\n");

  // Test 1: Get all chapters (metadata only)
  console.log("=== Test 1: Get All Chapters (Metadata) ===");
  try {
    const chapters = await client.chapters.findAll();
    console.log(`✅ Found ${chapters.length} chapters`);
    console.log("First 5 chapters:");
    console.log(chapters.slice(0, 5).map(c => ({
      id: c.id,
      name: c.nameSimple,
      verses: c.versesCount,
      revelation: c.revelationPlace
    })));
    console.log("");
  } catch (error: any) {
    console.error("❌ Failed to fetch all chapters");
    console.error(`   Error: ${error.message}`);
    console.log("");
  }

  // Test 2: Get specific chapter by ID
  console.log("=== Test 2: Get Specific Chapters by ID ===");
  for (const chapterId of TEST_CHAPTERS) {
    console.log(`--- Testing Chapter: ${chapterId} ---`);
    try {
      const chapter = await client.chapters.findById(chapterId as any);
      console.log(`✅ Chapter ${chapterId} retrieved successfully`);
      console.log(`Name: ${chapter.nameSimple} (${chapter.nameArabic})`);
      console.log(`Verses: ${chapter.versesCount}`);
      console.log(`Revelation: ${chapter.revelationPlace}`);
      console.log(`Pages: ${chapter.pages.join('-')}`);
      console.log("");
    } catch (error: any) {
      console.error(`❌ Failed to fetch chapter ${chapterId}`);
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  // Test 3: Get verses by chapter
  console.log("=== Test 3: Get Verses by Chapter ===");
  for (const chapterId of TEST_CHAPTERS) {
    console.log(`--- Testing Verses for Chapter: ${chapterId} ---`);
    try {
      const verses = await client.verses.findByChapter(chapterId.toString() as any);
      console.log(`✅ Found ${verses.length} verses in chapter ${chapterId}`);

      // Show first verse details
      if (verses.length > 0) {
        const firstVerse = verses[0];
        console.log(`First verse (${firstVerse.verseKey}):`);
        console.log(`Arabic: ${firstVerse.textUthmani?.substring(0, 50)}...`);
        console.log(`Has translations: ${firstVerse.translations && firstVerse.translations.length > 0}`);
      }

      // Show last verse if it's a short chapter
      if (verses.length <= 10) {
        console.log("All verses in chapter:");
        verses.forEach((verse, index) => {
          console.log(`${index + 1}. ${verse.verseKey}: ${verse.textUthmani?.substring(0, 30)}...`);
        });
      }
      console.log("");
    } catch (error: any) {
      console.error(`❌ Failed to fetch verses for chapter ${chapterId}`);
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  // Test 4: Get verses by chapter with translations
  console.log("=== Test 4: Get Verses by Chapter with Translations ===");
  try {
    const verses = await client.verses.findByChapter("1", {
      translations: [20], // English Sahih International
    });
    console.log(`✅ Found ${verses.length} verses in chapter 1 with translations`);

    // Show first 3 verses with translations
    console.log("First 3 verses with translations:");
    verses.slice(0, 3).forEach((verse, index) => {
      console.log(`${index + 1}. ${verse.verseKey}:`);
      console.log(`   Arabic: ${verse.textUthmani}`);
      if (verse.translations && verse.translations.length > 0) {
        console.log(`   English: ${verse.translations[0].text}`);
      }
      console.log("");
    });
  } catch (error: any) {
    console.error("❌ Failed to fetch verses with translations");
    console.error(`   Error: ${error.message}`);
    console.log("");
  }

  // Test 5: Get verses by chapter with Arabic tafsir
  console.log("=== Test 5: Get Verses by Chapter with Tafsir ===");
  try {
    const verses = await client.verses.findByChapter("1", {
      tafsirs: [169], // Arabic Jalalayn Tafseer
      translations: [20],
    });
    console.log(`✅ Found ${verses.length} verses in chapter 1 with tafsir`);

    // Show first verse with tafsir
    // if (verses.length > 0) {
    //   const firstVerse = verses[0];
    //   console.log(`First verse (${firstVerse.verseKey}) with tafsir:`);
    //   console.log(`Arabic: ${firstVerse.textUthmani}`);
    //   if (firstVerse.translations && firstVerse.translations.length > 0) {
    //     console.log(`English: ${firstVerse.translations[0].text}`);
    //   }
    //   if (firstVerse.tafsirs && firstVerse.tafsirs.length > 0) {
    //     console.log(`Tafsir: ${firstVerse.tafsirs[0].text?.substring(0, 100)}...`);
    //   }
    // }
    console.log(verses);
  } catch (error: any) {
    console.error("❌ Failed to fetch verses with tafsir");
    console.error(`   Error: ${error.message}`);
    console.log("");
  }

  // Test 6: Test pagination with verses
  console.log("=== Test 6: Test Pagination with Chapter Verses ===");
  try {
    // Get a larger chapter to test pagination
    const verses = await client.verses.findByChapter("2", {
      translations: [20],
      size: 10, // Limit to 10 verses
      page: 1,  // First page
    });
    console.log(`✅ Found ${verses.length} verses (paginated) in chapter 2`);
    console.log("Verse keys:", verses.map(v => v.verseKey));
  } catch (error: any) {
    console.error("❌ Failed to fetch paginated verses");
    console.error(`   Error: ${error.message}`);
    console.log("");
  }

  // Test 7: Raw API response inspection for chapter
  console.log("=== Test 7: Raw Chapter API Response Inspection ===");
  try {
    const chapter = await client.chapters.findById(1);
    console.log("Chapter object keys:");
    console.log(Object.keys(chapter));
    console.log("\nChapter details:");
    console.log(`ID: ${chapter.id}`);
    console.log(`Name: ${chapter.nameSimple}`);
    console.log(`Arabic Name: ${chapter.nameArabic}`);
    console.log(`Verses Count: ${chapter.versesCount}`);
    console.log(`Revelation Place: ${chapter.revelationPlace}`);
    console.log(`Pages: ${chapter.pages}`);
  } catch (error: any) {
    console.error("❌ Failed to inspect chapter response");
    console.error(`   Error: ${error.message}`);
  }

  console.log("🎉 All chapter tests completed!\n");
}

// Run tests
runChapterTests().catch((error) => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});