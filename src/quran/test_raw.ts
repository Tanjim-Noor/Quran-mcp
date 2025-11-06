/**
 * Quran SDK Raw Test Script
 * 
 * This script tests the Quran SDK independently of the MCP server.
 * On success, it outputs the raw verse object without any formatting.
 * This is useful for understanding the actual API response structure.
 * 
 * Usage Option 1 (Recommended - uses .dev.vars):
 *   1. Create .dev.vars file: cp .dev.vars.example .dev.vars
 *   2. Add your credentials to .dev.vars
 *   3. Run: pnpm exec tsx src/quran/test_raw.ts
 * 
 * Usage Option 2 (Manual environment variables):
 *   1. Set env vars: $env:QURAN_CLIENT_ID="..." and $env:QURAN_CLIENT_SECRET="..."
 *   2. Run: pnpm exec tsx src/quran/test_raw.ts
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
 * Main test function
 */
async function runTests() {
	console.log("🕌 Starting Quran SDK Raw Tests...\n");

	// Check for required environment variables
	const clientId = process.env.QURAN_CLIENT_ID;
	const clientSecret = process.env.QURAN_CLIENT_SECRET;
	const envType = process.env.QURAN_ENV?.toLowerCase() === "pre-production" 
		? QuranEnvironment.PRE_PRODUCTION 
		: QuranEnvironment.PRODUCTION;

	if (!clientId || !clientSecret) {
		console.error("❌ Error: Missing required environment variables");
		console.error("Please either:");
		console.error("\n1. Create .dev.vars file (recommended):");
		console.error('   cp .dev.vars.example .dev.vars');
		console.error('   # Then edit .dev.vars with your credentials');
		console.error("\n2. Or set environment variables temporarily:");
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

	// Test 1: Fetch a simple verse (Ayat al-Kursi - 2:255)
	console.log("=== Test 1: Simple Verse (2:255) ===");
	try {
		const verse = await client.verses.findByKey("2:255");
		console.log(verse);
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch verse");
		console.error(`   Error: ${error.message}`);
		console.error(`   Status: ${error.status || "unknown"}`);
		if (error.response) {
			console.error(`   Response: ${JSON.stringify(error.response, null, 2)}`);
		}
		console.log("");
	}

	// Test 2: Fetch verse with English translation
	console.log("=== Test 2: Verse with Translation (1:1) ===");
	try {
		const verse = await client.verses.findByKey("1:1", {
			translations: [20], // English - Sahih International
		});
		console.log(verse);
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch verse with translation");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 3: Fetch all chapters
	// console.log("=== Test 3: All Chapters ===");
	// try {
	// 	const chapters = await client.chapters.findAll();
	// 	console.log(chapters);
	// 	console.log("");
	// } catch (error: any) {
	// 	console.error("❌ Failed to fetch chapters");
	// 	console.error(`   Error: ${error.message}`);
	// 	console.log("");
	// }

	// Test 4: Search functionality
	console.log("=== Test 4: Search 'light' ===");
	try {
		const results = await client.search.search("light", {
			language: Language.ENGLISH,
			size: 5,
		});
		console.log(results);
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to search");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 5: Get verse with words (word-by-word)
	console.log("=== Test 5: Verse with Words (112:1) ===");
	try {
		const verse = await client.verses.findByKey("112:1", {
			words: true,
			translations: [20],
		});
		console.log(verse);
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch verse with words");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 6: Word Fields Selection
	console.log("=== Test 6: Word Fields Selection (1:1) ===");
	try {
		const verse = await client.verses.findByKey("1:1", {
			words: true,
			wordFields: {
				textUthmani: true,
				verseKey: true,
				location: true,
			},
		});
		console.log(verse);
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch verse with word fields");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 7: Translation Fields Selection
	console.log("=== Test 7: Translation Fields Selection (2:255) ===");
	try {
		const verse = await client.verses.findByKey("2:255", {
			translations: [20, 131],
			translationFields: {
				languageName: true,
				resourceName: true,
				verseKey: true,
			},
		});
		console.log(verse);
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch verse with translation fields");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 8: Verse Fields Selection
	console.log("=== Test 8: Verse Fields Selection (1:1) ===");
	try {
		const verse = await client.verses.findByKey("1:1", {
			fields: {
				textUthmani: true,
				textUthmaniTajweed: true,
				codeV1: true,
				v1Page: true,
			},
		});
		console.log(verse);
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch verse with custom fields");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	console.log("🎉 All tests completed!\n");
}

// Run tests
runTests().catch((error) => {
	console.error("\n💥 Unexpected error:", error);
	process.exit(1);
});
