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
			"Array of translation IDs to include. First use getAvailableTranslations tool to discover available IDs. Common IDs: 20=English Sahih International, 234=Urdu Jalandhari, 85=English Abdel Haleem. Pass multiple IDs like [20, 234] for multiple translations."
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
		.describe("Whether to include tafsir (commentary) for the verse. Set to true to enable tafsir."),
	tafsirIds: z
		.array(z.number())
		.optional()
		.describe("Array of tafsir IDs to include (e.g., [171] for Tafsir Ibn Kathir). Only used when includeTafsir is true."),
});

export type GetVerseParams = z.infer<typeof getVerseSchema>;

/**
 * Schema for the getAvailableTranslations tool parameters
 */
export const getAvailableTranslationsSchema = z.object({
	language: z
		.string()
		.optional()
		.describe(
			"Filter translations by language (e.g., 'english', 'urdu', 'arabic', 'spanish', 'french'). Leave empty to get all available translations."
		),
});

export type GetAvailableTranslationsParams = z.infer<typeof getAvailableTranslationsSchema>;

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
			fields: { textUthmani: true }, // Always include Arabic text
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

/**
 * Fetches all available Quran translations, optionally filtered by language
 * 
 * @param client - Configured Quran API client
 * @param params - Parameters for filtering translations
 * @returns Formatted list of available translations with IDs
 */
export async function getAvailableTranslations(
	client: QuranClient,
	params: GetAvailableTranslationsParams
) {
	const { language } = params;

	try {
		// Fetch all translations from the API
		const allTranslations = await client.resources.findAllTranslations();

		// Filter by language if specified
		let filteredTranslations = allTranslations;
		if (language) {
			filteredTranslations = allTranslations.filter(
				(t) => t.languageName?.toLowerCase() === language.toLowerCase()
			);
		}

		// Format the response
		let response = "";

		if (language) {
			response += `📚 **Available ${language.charAt(0).toUpperCase() + language.slice(1)} Translations** (${filteredTranslations.length} found)\n\n`;
		} else {
			response += `📚 **All Available Translations** (${filteredTranslations.length} total)\n\n`;
		}

		if (filteredTranslations.length === 0) {
			response += `No translations found`;
			if (language) {
				response += ` for language: ${language}`;
			}
			response += `.\n\nTry using common languages like: english, urdu, arabic, spanish, french, turkish, bengali, indonesian, russian, persian`;
		} else {
			// Group translations by language if showing all
			if (!language) {
				const byLanguage: { [key: string]: any[] } = {};
				filteredTranslations.forEach((t) => {
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

				// Display grouped by language
				Object.keys(byLanguage)
					.sort()
					.forEach((lang) => {
						response += `**${lang.charAt(0).toUpperCase() + lang.slice(1)}** (${byLanguage[lang].length} translations):\n`;
						byLanguage[lang].forEach((translation) => {
							response += `  • ID: ${translation.id} - ${translation.name}`;
							if (translation.author) {
								response += ` by ${translation.author}`;
							}
							response += `\n`;
						});
						response += `\n`;
					});
			} else {
				// Display simple list for specific language
				filteredTranslations.forEach((translation) => {
					response += `• **ID: ${translation.id}** - ${translation.name}`;
					if (translation.authorName) {
						response += ` by ${translation.authorName}`;
					}
					response += `\n`;
				});
				response += `\n`;
			}

			// Add usage example
			response += `\n**Usage Example:**\n`;
			const exampleId = filteredTranslations[0].id;
			response += `To fetch a verse with translation ID ${exampleId}, use:\n`;
			response += `\`\`\`\ngetVerse({ verseKey: "2:255", translations: [${exampleId}] })\n\`\`\`\n`;
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
					text: `❌ **Error fetching translations**\n\nError Type: ${errorType}\nMessage: ${errorMessage}\n\nPlease try again.`,
				},
			],
			isError: true,
		};
	}
}
