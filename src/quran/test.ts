/**
 * Quran SDK Test Script
 * 
 * This script tests the Quran SDK independently of the MCP server.
 * Use this to verify that the API credentials are working and the SDK is functioning correctly.
 * 
 * The SDK handles OAuth2 authentication automatically:
 * 1. Uses client credentials flow to obtain access tokens
 * 2. Caches tokens for 1 hour (3600 seconds)
 * 3. Automatically renews expired tokens
 * 4. Sends proper authentication headers (x-auth-token, x-client-id) with each request
 * 
 * Usage Option 1 (Recommended - uses .dev.vars):
 *   1. Create .dev.vars file: cp .dev.vars.example .dev.vars
 *   2. Add your credentials to .dev.vars
 *   3. Run: pnpm test:sdk
 * 
 * Usage Option 2 (Manual environment variables):
 *   1. Set env vars: $env:QURAN_CLIENT_ID="..." and $env:QURAN_CLIENT_SECRET="..."
 *   2. Run: pnpm exec tsx src/quran/test.ts
 * 
 * Environment Selection:
 *   Set QURAN_ENV=production or QURAN_ENV=pre-production in .dev.vars
 *   Default: production
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
	console.log("🕌 Starting Quran SDK Tests...\n");

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

	console.log("✅ Environment variables found");
	console.log(`   Client ID: ${clientId.substring(0, 10)}...`);
	console.log(`   Client Secret Length: ${clientSecret.length} characters`);
	console.log(`   Environment: ${envType}`);
	console.log("");

	console.log("🔐 Authentication Flow:");
	console.log("   The SDK will automatically:");
	console.log("   1. Request an OAuth2 access token using client credentials");
	console.log("   2. Cache the token for 1 hour (3600 seconds)");
	console.log("   3. Send x-auth-token and x-client-id headers with each request");
	console.log("   4. Automatically renew the token when it expires");
	console.log("");

	// Initialize the Quran client
	const client = createQuranClient({
		clientId,
		clientSecret,
		defaultLanguage: Language.ENGLISH,
		environment: envType,
	});

	console.log("✅ Quran client initialized\n");

	// Test 1: Fetch a simple verse (Ayat al-Kursi - 2:255)
	console.log("📖 Test 1: Fetching Ayat al-Kursi (2:255)...");
	try {
		const verse = await client.verses.findByKey("2:255");
        console.log(verse);
		console.log("✅ Success!");
		console.log(`   Arabic: ${verse.textUthmani?.substring(0, 50)}...`);
		console.log(`   Verse Key: ${verse.verseKey}`);
		console.log(`   Page: ${verse.pageNumber}, Juz: ${verse.juzNumber}`);
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
	console.log("📖 Test 2: Fetching Al-Fatiha (1:1) with English translation...");
	try {
		const verse = await client.verses.findByKey("1:1", {
			translations: [20], // English - Sahih International
		});
		console.log("✅ Success!");
        console.log(verse);
		console.log(`   Arabic: ${verse.textUthmani}`);
		if (verse.translations && verse.translations.length > 0) {
			console.log(`   English: ${verse.translations[0].text}`);
		}
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch verse with translation");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 3: Fetch all chapters
	console.log("📚 Test 3: Fetching all chapters...");
	try {
		const chapters = await client.chapters.findAll();
		console.log("✅ Success!");
		console.log(`   Total chapters: ${chapters.length}`);
		console.log(`   First chapter: ${chapters[0].nameSimple} (${chapters[0].nameArabic})`);
		console.log(`   Last chapter: ${chapters[chapters.length - 1].nameSimple} (${chapters[chapters.length - 1].nameArabic})`);
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch chapters");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 4: Search functionality
	console.log("🔍 Test 4: Searching for 'light'...");
	try {
		const results = await client.search.search("light", {
			language: Language.ENGLISH,
			size: 5,
		});
		console.log("✅ Success!");
		console.log(`   Total results: ${results.totalResults}`);
		if (results.results && results.results.length > 0) {
			console.log(`   First result: ${results.results[0].verseKey}`);
			console.log(`   Text: ${results.results[0].text?.substring(0, 80)}...`);
		}
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to search");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 5: Get verse with words (word-by-word)
	console.log("📝 Test 5: Fetching verse with word-by-word breakdown (112:1)...");
	try {
		const verse = await client.verses.findByKey("112:1", {
			words: true,
			translations: [20],
		});
		console.log("✅ Success!");
        console.log("VERSE:", verse);
		console.log(`   Arabic: ${verse.textUthmani}`);
		if (verse.words && verse.words.length > 0) {
			console.log(`   Total words: ${verse.words.length}`);
			console.log(`   First word: ${verse.words[0].textUthmani || "N/A"}`);
		}
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch verse with words");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 6: Word Fields Selection
	console.log("🔤 Test 6: Testing word fields selection (1:1)...");
	try {
		const verse = await client.verses.findByKey("1:1", {
			words: true,
			wordFields: {
				textUthmani: true,
				verseKey: true,
				location: true,
			},
		});
		console.log("✅ Success!");
		console.log(`   Arabic: ${verse.textUthmani}`);
		if (verse.words && verse.words.length > 0) {
			console.log(`   Total words: ${verse.words.length}`);
			console.log(`   First word details:`);
			console.log(`     - Text: ${verse.words[0].textUthmani || "N/A"}`);
			console.log(`     - Verse Key: ${verse.words[0].verseKey || "N/A"}`);
			console.log(`     - Location: ${verse.words[0].location || "N/A"}`);
			console.log(`   Full word object:`, JSON.stringify(verse.words[0], null, 2));
		}
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch verse with word fields");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 7: Translation Fields Selection
	console.log("🌐 Test 7: Testing translation fields selection (2:255)...");
	try {
		const verse = await client.verses.findByKey("2:255", {
			translations: [20, 131],
			translationFields: {
				languageName: true,
				resourceName: true,
				verseKey: true,
			},
		});
		console.log("✅ Success!");
		console.log(`   Arabic: ${verse.textUthmani?.substring(0, 50)}...`);
		if (verse.translations && verse.translations.length > 0) {
			console.log(`   Total translations: ${verse.translations.length}`);
			verse.translations.forEach((translation, index) => {
				console.log(`   Translation ${index + 1}:`);
				console.log(`     - Language: ${translation.languageName || "N/A"}`);
				console.log(`     - Resource: ${translation.resourceName || "N/A"}`);
				console.log(`     - Verse Key: ${translation.verseKey || "N/A"}`);
				console.log(`     - Text: ${translation.text?.substring(0, 80)}...`);
			});
			console.log(`   Full translation object:`, JSON.stringify(verse.translations[0], null, 2));
		}
		console.log("");
	} catch (error: any) {
		console.error("❌ Failed to fetch verse with translation fields");
		console.error(`   Error: ${error.message}`);
		console.log("");
	}

	// Test 8: Verse Fields Selection
	console.log("📄 Test 8: Testing verse fields selection (1:1)...");
	try {
		const verse = await client.verses.findByKey("1:1", {
			fields: {
				textUthmani: true,
				textUthmaniTajweed: true,
				codeV1: true,
				v1Page: true,
			},
		});
		console.log("✅ Success!");
		console.log(`   Verse fields:`);
		console.log(`     - Text Uthmani: ${verse.textUthmani || "N/A"}`);
		console.log(`     - Text Uthmani Tajweed: ${verse.textUthmaniTajweed || "N/A"}`);
		console.log(`     - Code V1: ${verse.codeV1 || "N/A"}`);
		console.log(`     - V1 Page: ${verse.v1Page || "N/A"}`);
		console.log(`   Full verse object:`, JSON.stringify(verse, null, 2));
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
