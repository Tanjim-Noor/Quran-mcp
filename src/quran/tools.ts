/**
 * Quran MCP Tools
 * 
 * This module defines MCP tools that interact with the Quran API.
 * Each tool corresponds to a specific Quran-related operation.
 */

import { z } from "zod";
import type { QuranClient } from "@quranjs/api";

/**
 * Schema for the getVerse tool parameters
 */
export const getVerseSchema = z.object({
	verseKey: z
		.string()
		.describe(
			"The verse key in 'chapter:verse' format (e.g., '2:255' for Ayat al-Kursi, '1:1' for first verse of Al-Fatiha)"
		),
	translations: z
		.array(z.number())
		.optional()
		.describe(
			"Array of translation IDs to include (e.g., [20] for English Sahih International, [131] for Urdu)"
		),
	includeWords: z
		.boolean()
		.optional()
		.default(false)
		.describe("Whether to include word-by-word breakdown of the verse"),
	includeTafsir: z
		.boolean()
		.optional()
		.default(false)
		.describe("Whether to include tafsir (commentary) for the verse"),
	tafsirIds: z
		.array(z.number())
		.optional()
		.describe("Array of tafsir IDs to include (e.g., [171] for Tafsir Ibn Kathir)"),
});

export type GetVerseParams = z.infer<typeof getVerseSchema>;

/**
 * Fetches a Quranic verse by its key with optional translations, words, and tafsir
 * 
 * @param client - Configured Quran API client
 * @param params - Parameters for verse retrieval
 * @returns Formatted verse data with requested information
 */
export async function getVerse(client: QuranClient, params: GetVerseParams) {
	const { verseKey, translations, includeWords, includeTafsir, tafsirIds } = params;

	try {
		// Fetch the verse with all requested data
		const verse = await client.verses.findByKey(verseKey as any, {
			translations: translations,
			words: includeWords,
			tafsirs: includeTafsir && tafsirIds ? tafsirIds : undefined,
		});

		// Format the response
		let response = `📖 **Verse ${verse.verseKey}**\n\n`;
		response += `**Arabic (Uthmani):**\n${verse.textUthmani}\n\n`;

		// Add metadata
		response += `**Metadata:**\n`;
		response += `- Chapter: ${verse.chapterId}\n`;
		response += `- Verse Number: ${verse.verseNumber}\n`;
		response += `- Page: ${verse.pageNumber}\n`;
		response += `- Juz: ${verse.juzNumber}\n\n`;

		// Add translations if available
		if (verse.translations && verse.translations.length > 0) {
			response += `**Translations:**\n`;
			verse.translations.forEach((translation) => {
				response += `\n*${translation.resourceName || "Translation"}* (${translation.languageName || "N/A"}):\n`;
				response += `${translation.text}\n`;
			});
			response += `\n`;
		}

		// Add tafsir if available
		if (verse.tafsirs && verse.tafsirs.length > 0) {
			response += `**Tafsir (Commentary):**\n`;
			verse.tafsirs.forEach((tafsir) => {
				response += `\n*${tafsir.resourceName || "Tafsir"}*:\n`;
				response += `${tafsir.text}\n`;
			});
			response += `\n`;
		}

		// Add word-by-word breakdown if requested
		if (includeWords && verse.words && verse.words.length > 0) {
			response += `**Word-by-Word Breakdown:**\n`;
			verse.words.forEach((word, index) => {
				response += `${index + 1}. ${word.textUthmani || word.textImlaei || "N/A"}\n`;
			});
		}

		return {
			content: [
				{
					type: "text" as const,
					text: response,
				},
			],
		};
	} catch (error: any) {
		// Handle API errors gracefully
		const errorMessage = error.message || "Unknown error occurred";
		const errorType = error.status || "error";

		return {
			content: [
				{
					type: "text" as const,
					text: `❌ **Error fetching verse ${verseKey}**\n\nError Type: ${errorType}\nMessage: ${errorMessage}\n\nPlease check the verse key format (should be 'chapter:verse', e.g., '2:255') and try again.`,
				},
			],
			isError: true,
		};
	}
}
