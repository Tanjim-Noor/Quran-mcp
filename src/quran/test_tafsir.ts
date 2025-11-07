/**
 * Quran SDK Tafsir Test Script
 *
 * This script specifically tests tafsir (commentary) functionality.
 * It tests different verses, tafsir IDs, and API call formats to troubleshoot tafsir issues.
 *
 * Usage Option 1 (Recommended - uses .dev.vars):
 *   1. Create .dev.vars file: cp .dev.vars.example .dev.vars
 *   2. Add your credentials to .dev.vars
 *   3. Run: pnpm exec tsx src/quran/test_tafsir.ts
 *
 * Usage Option 2 (Manual environment variables):
 *   1. Set env vars: $env:QURAN_CLIENT_ID="..." and $env:QURAN_CLIENT_SECRET="..."
 *   2. Run: pnpm exec tsx src/quran/test_tafsir.ts
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
 * Available Tafsir IDs from documentation:
 * Arabic: 926, 925, 90, 14, 93, 94, 15, 91, 16
 * English: 169, 168, 817
 * Bengali: 381, 166, 164, 165
 * Urdu: 157, 160, 818, 159
 * Other: 170, 231, 804
 */
const TAFSIR_IDS = {
  english: [169, 168, 817],
  arabic: [926, 925, 14],
  urdu: [157, 160, 818, 159],
  bengali: [381, 166, 164, 165],
};

/**
 * Main test function
 */
async function runTafsirTests() {
  console.log("🕌 Starting Quran SDK Tafsir Tests...\n");

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

  // Test 1: Basic verse without tafsir (control test)
  console.log("=== Test 1: Basic Verse (1:1) - Control Test ===");
  try {
    const verse = await client.verses.findByKey("1:1");
    console.log("✅ Basic verse fetched successfully");
    console.log(`Verse key: ${verse.verseKey}`);
    console.log(`Arabic: ${verse.textUthmani}`);
    console.log(`Has tafsirs property: ${verse.hasOwnProperty('tafsirs')}`);
    console.log(`Tafsirs value: ${verse.tafsirs}`);
    console.log("");
  } catch (error: any) {
    console.error("❌ Failed to fetch basic verse");
    console.error(`   Error: ${error.message}`);
    console.log("");
  }

  // Test 2: Verse with translation only (control test)
  console.log("=== Test 2: Verse with Translation Only (1:1) ===");
  try {
    const verse = await client.verses.findByKey("1:1", {
      translations: [20], // English Sahih International
    });
    console.log("✅ Verse with translation fetched successfully");
    console.log(`Has translations: ${verse.translations && verse.translations.length > 0}`);
    console.log(`Translation count: ${verse.translations?.length || 0}`);
    console.log(`Has tafsirs property: ${verse.hasOwnProperty('tafsirs')}`);
    console.log(`Tafsirs value: ${verse.tafsirs}`);
    console.log("");
  } catch (error: any) {
    console.error("❌ Failed to fetch verse with translation");
    console.error(`   Error: ${error.message}`);
    console.log("");
  }

  // Test 3: Try different tafsir IDs with English tafsir
  console.log("=== Test 3: Testing English Tafsirs (1:1) ===");
  for (const tafsirId of TAFSIR_IDS.english) {
    console.log(`--- Testing Tafsir ID: ${tafsirId} ---`);
    try {
      const verse = await client.verses.findByKey("1:1", {
        tafsirs: [tafsirId],
        translations: [20],
      });
      console.log(`✅ Tafsir ${tafsirId} request successful`);
      console.log(`Has tafsirs: ${verse.tafsirs && verse.tafsirs.length > 0}`);
      if (verse.tafsirs && verse.tafsirs.length > 0) {
        console.log(`Tafsir count: ${verse.tafsirs.length}`);
        console.log(`Tafsir resource name: ${verse.tafsirs[0].resourceName}`);
        console.log(`Tafsir text length: ${verse.tafsirs[0].text?.length || 0}`);
        console.log(`Tafsir text preview: ${verse.tafsirs[0].text?.substring(0, 100)}...`);
      } else {
        console.log("❌ No tafsir data returned");
      }
    } catch (error: any) {
      console.error(`❌ Failed with tafsir ${tafsirId}`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Status: ${error.status || "unknown"}`);
    }
    console.log("");
  }

  // Test 4: Try Arabic tafsirs
  console.log("=== Test 4: Testing Arabic Tafsirs (1:1) ===");
  for (const tafsirId of TAFSIR_IDS.arabic) {
    console.log(`--- Testing Tafsir ID: ${tafsirId} ---`);
    try {
      const verse = await client.verses.findByKey("1:1", {
        tafsirs: [tafsirId],
      });
      console.log(`✅ Arabic tafsir ${tafsirId} request successful`);
      console.log(`Has tafsirs: ${verse.tafsirs && verse.tafsirs.length > 0}`);
      if (verse.tafsirs && verse.tafsirs.length > 0) {
        console.log(`Tafsir count: ${verse.tafsirs.length}`);
        console.log(`Tafsir resource name: ${verse.tafsirs[0].resourceName}`);
        console.log(`Tafsir text length: ${verse.tafsirs[0].text?.length || 0}`);
        console.log(`Tafsir text preview: ${verse.tafsirs[0].text?.substring(0, 100)}...`);
      } else {
        console.log("❌ No tafsir data returned");
      }
    } catch (error: any) {
      console.error(`❌ Failed with Arabic tafsir ${tafsirId}`);
      console.error(`   Error: ${error.message}`);
    }
    console.log("");
  }

  // Test 5: Try different verses
  console.log("=== Test 5: Testing Different Verses with Tafsir 169 ===");
  const testVerses = ["1:1", "2:1", "2:255", "112:1"];

  for (const verseKey of testVerses) {
    console.log(`--- Testing Verse: ${verseKey} ---`);
    try {
      const verse = await client.verses.findByKey(verseKey as any, {
        tafsirs: [169], // Ibn Kathir (Abridged)
        translations: [20],
      });
      console.log(`✅ Verse ${verseKey} with tafsir request successful`);
      console.log(`Has tafsirs: ${verse.tafsirs && verse.tafsirs.length > 0}`);
      if (verse.tafsirs && verse.tafsirs.length > 0) {
        console.log(`Tafsir count: ${verse.tafsirs.length}`);
        console.log(`Tafsir resource name: ${verse.tafsirs[0].resourceName}`);
        console.log(`Tafsir text length: ${verse.tafsirs[0].text?.length || 0}`);
        if (verse.tafsirs[0].text && verse.tafsirs[0].text.length > 0) {
          console.log("🎉 SUCCESS: Tafsir text found!");
          console.log(`Preview: ${verse.tafsirs[0].text.substring(0, 150)}...`);
        }
      } else {
        console.log("❌ No tafsir data returned for this verse");
      }
    } catch (error: any) {
      console.error(`❌ Failed with verse ${verseKey}`);
      console.error(`   Error: ${error.message}`);
    }
    console.log("");
  }

  // Test 6: Check API response structure
  console.log("=== Test 6: Raw API Response Inspection ===");
  try {
    console.log("Making raw request to inspect response structure...");
    const verse = await client.verses.findByKey("1:1", {
      tafsirs: [169],
      translations: [20],
    });

    console.log("Full response keys:");
    console.log(Object.keys(verse));

    console.log("\nTafsirs property details:");
    console.log(`tafsirs exists: ${verse.hasOwnProperty('tafsirs')}`);
    console.log(`tafsirs value: ${verse.tafsirs}`);
    console.log(`tafsirs type: ${typeof verse.tafsirs}`);

    if (verse.tafsirs) {
      console.log(`tafsirs is array: ${Array.isArray(verse.tafsirs)}`);
      console.log(`tafsirs length: ${verse.tafsirs.length}`);
      if (verse.tafsirs.length > 0) {
        console.log("First tafsir object keys:");
        console.log(Object.keys(verse.tafsirs[0]));
      }
    }
  } catch (error: any) {
    console.error("❌ Failed to inspect API response");
    console.error(`   Error: ${error.message}`);
  }

  console.log("🎉 All tafsir tests completed!\n");
}

// Run tests
runTafsirTests().catch((error) => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});