/**
 * Test script for the getAvailableTranslations tool
 * 
 * This script tests the resources endpoint to fetch available translations.
 * It demonstrates how to:
 * - Get all available translations
 * - Filter translations by language
 * - Find specific translation IDs for use in getVerse
 * 
 * Usage Option 1 (Recommended - uses .dev.vars):
 *   1. Create .dev.vars file: cp .dev.vars.example .dev.vars
 *   2. Add your credentials to .dev.vars
 *   3. Run: pnpm test:sdk:translations
 *
 * Usage Option 2 (Manual environment variables):
 *   1. Set env vars: $env:QURAN_CLIENT_ID="..." and $env:QURAN_CLIENT_SECRET="..."
 *   2. Run: pnpm test:sdk:translations
 */

import { Language } from "@quranjs/api";
import { createQuranClient, QuranEnvironment } from "./client";
import { getAvailableTranslations } from "./tools";
import { config } from "dotenv";
import { resolve } from "path";

// Load .dev.vars file if it exists
try {
	config({ path: resolve(process.cwd(), ".dev.vars") });
	console.log("📄 Loaded credentials from .dev.vars file\n");
} catch (error) {
	console.log("⚠️  No .dev.vars file found, using environment variables\n");
}

async function testGetAvailableTranslations() {
	console.log("🕌 Testing Quran MCP - Get Available Translations Tool\n");
	console.log("=".repeat(80));
	console.log("\n");

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

	// Test 1: Get all English translations
	console.log("📚 Test 1: Get all English translations");
	console.log("-".repeat(80));
	try {
		const result1 = await getAvailableTranslations(client, { language: "english" });
		console.log(result1.content[0].text);
	} catch (error) {
		console.error("Error:", error);
	}
	console.log("\n");

	// Test 2: Get all Urdu translations
	console.log("📚 Test 2: Get all Urdu translations");
	console.log("-".repeat(80));
	try {
		const result2 = await getAvailableTranslations(client, { language: "urdu" });
		console.log(result2.content[0].text);
	} catch (error) {
		console.error("Error:", error);
	}
	console.log("\n");

	// Test 3: Get all Arabic translations
	console.log("📚 Test 3: Get all Arabic translations");
	console.log("-".repeat(80));
	try {
		const result3 = await getAvailableTranslations(client, { language: "arabic" });
		console.log(result3.content[0].text);
	} catch (error) {
		console.error("Error:", error);
	}
	console.log("\n");

	// Test 4: Get all translations (no filter)
	console.log("📚 Test 4: Get all available translations (grouped by language)");
	console.log("-".repeat(80));
	try {
		const result4 = await getAvailableTranslations(client, {});
		console.log(result4.content[0].text);
	} catch (error) {
		console.error("Error:", error);
	}
	console.log("\n");

	// Test 5: Get translations for Spanish
	console.log("📚 Test 5: Get all Spanish translations");
	console.log("-".repeat(80));
	try {
		const result5 = await getAvailableTranslations(client, { language: "spanish" });
		console.log(result5.content[0].text);
	} catch (error) {
		console.error("Error:", error);
	}
	console.log("\n");

	// Test 6: Test with invalid language (should return empty result)
	console.log("📚 Test 6: Get translations for invalid language");
	console.log("-".repeat(80));
	try {
		const result6 = await getAvailableTranslations(client, { language: "klingon" });
		console.log(result6.content[0].text);
	} catch (error) {
		console.error("Error:", error);
	}
	console.log("\n");

	console.log("=".repeat(80));
	console.log("✅ All tests completed!");
}

// Run the tests
testGetAvailableTranslations().catch(console.error);
