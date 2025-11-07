/**
 * Quran SDK Resource API Test Script
 *
 * This script tests all Resource API functions from the Quran SDK.
 * Use the boolean flags at the top to select which functions to test.
 * 
 * Usage Option 1 (Recommended - uses .dev.vars):
 *   1. Create .dev.vars file: cp .dev.vars.example .dev.vars
 *   2. Add your credentials to .dev.vars
 *   3. Run: pnpm exec tsx src/quran/test_resources.ts
 *
 * Usage Option 2 (Manual environment variables):
 *   1. Set env vars: $env:QURAN_CLIENT_ID="..." and $env:QURAN_CLIENT_SECRET="..."
 *   2. Run: pnpm exec tsx src/quran/test_resources.ts
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
 * ============================================================
 * RESOURCE API TEST FLAGS - Set to true to run each test
 * ============================================================
 */
const TESTS = {
    // Recitations API
    getAllRecitations: false,
    getRecitationInfo: false,

    // Translations API
    getAllTranslations: false,
    getTranslationInfo: false,

    // Tafsirs API
    getAllTafsirs: true,
    getTafsirInfo: false,

    // Languages API
    getAllLanguages: false,

    // Chapter Resources
    getAllChapterInfos: false,
    getAllChapterReciters: false,

    // Recitation Styles
    getAllRecitationStyles: false,

    // Verse Media
    getVerseMedia: false,
};

/**
 * Main test function
 */
async function runTests() {
  console.log("🕌 Starting Quran SDK Resource API Tests...\n");

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

  // ============================================================
  // RECITATIONS API TESTS
  // ============================================================

  if (TESTS.getAllRecitations) {
    console.log("=== Test: Get All Recitations ===");
    try {
      const recitations = await client.resources.findAllRecitations();
      console.log(`✅ Found ${recitations.length} recitations`);
      console.log(recitations);
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch all recitations");
      console.error(`   Error: ${error.message}`);
      console.error(`   Status: ${error.status || "unknown"}`);
      console.log("");
    }
  }

  if (TESTS.getRecitationInfo) {
    console.log("=== Test: Get Recitation Info (ID: 2) ===");
    try {
      const info = await client.resources.findRecitationInfo("2");
      console.log("✅ Recitation info retrieved");
      console.log(info);
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch recitation info");
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  // ============================================================
  // TRANSLATIONS API TESTS
  // ============================================================

  if (TESTS.getAllTranslations) {
    console.log("=== Test: Get All Translations ===");
    try {
      const translations = await client.resources.findAllTranslations();
      console.log(`✅ Found ${translations.length} translations`);
      
      // Group by language for easier viewing
      const byLanguage: { [key: string]: any[] } = {};
      translations.forEach((t) => {
        const lang = t.languageName || "unknown";
        if (!byLanguage[lang]) {
          byLanguage[lang] = [];
        }
        byLanguage[lang].push({
          id: t.id,
          name: t.name,
          author: t.authorName,
        });
      });
      
      console.log("Translations by language:");
      console.log(byLanguage);
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch all translations");
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  if (TESTS.getTranslationInfo) {
    console.log("=== Test: Get Translation Info (ID: 20 - English Sahih International) ===");
    try {
      const info = await client.resources.findTranslationInfo("20");
      console.log("✅ Translation info retrieved");
      console.log(info);
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch translation info");
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  // ============================================================
  // TAFSIRS API TESTS
  // ============================================================

  if (TESTS.getAllTafsirs) {
    console.log("=== Test: Get All Tafsirs ===");
    try {
      const tafsirs = await client.resources.findAllTafsirs();
      console.log(`✅ Found ${tafsirs.length} tafsirs`);
      
      // Show first 5
      console.log(tafsirs);
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch all tafsirs");
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  if (TESTS.getTafsirInfo) {
    console.log("=== Test: Get Tafsir Info (ID: 171 - Tafsir Ibn Kathir) ===");
    try {
      const info = await client.resources.findTafsirInfo("171");
      console.log("✅ Tafsir info retrieved");
      console.log(info);
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch tafsir info");
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  // ============================================================
  // LANGUAGES API TESTS
  // ============================================================

  if (TESTS.getAllLanguages) {
    console.log("=== Test: Get All Languages ===");
    try {
      const languages = await client.resources.findAllLanguages();
      console.log(`✅ Found ${languages.length} languages`);
      console.log(languages);
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch all languages");
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  // ============================================================
  // CHAPTER RESOURCES API TESTS
  // ============================================================

  if (TESTS.getAllChapterInfos) {
    console.log("=== Test: Get All Chapter Infos ===");
    try {
      const chapterInfos = await client.resources.findAllChapterInfos();
      console.log(`✅ Found ${chapterInfos.length} chapter infos`);
      
      // Show first 5
      console.log("First 5 chapter infos:");
      console.log(chapterInfos.slice(0, 5));
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch all chapter infos");
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  if (TESTS.getAllChapterReciters) {
    console.log("=== Test: Get All Chapter Reciters ===");
    try {
      const reciters = await client.resources.findAllChapterReciters();
      console.log(`✅ Found ${reciters.length} chapter reciters`);
      
      // Show first 5
      console.log("First 5 reciters:");
      console.log(reciters.slice(0, 5));
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch all chapter reciters");
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  // ============================================================
  // RECITATION STYLES API TESTS
  // ============================================================

  if (TESTS.getAllRecitationStyles) {
    console.log("=== Test: Get All Recitation Styles ===");
    try {
      const styles = await client.resources.findAllRecitationStyles();
      console.log("✅ Recitation styles retrieved");
      console.log(styles);
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch recitation styles");
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  // ============================================================
  // VERSE MEDIA API TESTS
  // ============================================================

  if (TESTS.getVerseMedia) {
    console.log("=== Test: Get Verse Media ===");
    try {
      const media = await client.resources.findVerseMedia();
      console.log("✅ Verse media retrieved");
      console.log(media);
      console.log("");
    } catch (error: any) {
      console.error("❌ Failed to fetch verse media");
      console.error(`   Error: ${error.message}`);
      console.log("");
    }
  }

  console.log("🎉 All tests completed!\n");
}

// Run tests
runTests().catch((error) => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});
