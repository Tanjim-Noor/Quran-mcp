import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { Octokit } from "octokit";
import { z } from "zod";
import { GitHubHandler } from "./github-handler";
import { Language } from "@quranjs/api";
import { getQuranClient, QuranEnvironment } from "./quran/client";
import { getVerse, getVerseSchema, getAvailableTranslations, getAvailableTranslationsSchema } from "./quran/tools";

// Context from the auth process, encrypted & stored in the auth token
// and provided to the DurableMCP as this.props
type Props = {
	login: string;
	name: string;
	email: string;
	accessToken: string;
};

/**
 * ALLOWED_USERNAMES: GitHub usernames that have access to demo/restricted tools
 * 
 * The image generation demo tool (generateImage) is only available to users
 * in this Set. This demonstrates how to implement access control in MCP servers.
 * 
 * To enable for your account:
 * 1. Find your GitHub username
 * 2. Add it to this Set: ALLOWED_USERNAMES.add('yourusername');
 * 
 * Example:
 *   const ALLOWED_USERNAMES = new Set<string>(['username1', 'username2']);
 * 
 * For production deployments, consider using role-based access control
 * or environment-based configuration instead of hardcoding usernames.
 */
const ALLOWED_USERNAMES = new Set<string>([
	// Add GitHub usernames here to enable restricted tools for those users
	// Example: 'Tanjim-Noor', 'another-user'
]);

export class MyMCP extends McpAgent<Env, Record<string, never>, Props> {
	server = new McpServer({
		name: "Quran MCP Server with OAuth",
		version: "1.0.0",
	});

	async init() {
		// Determine Quran API environment from environment variable (if set)
		// Default to production if not specified
		// The environment variable can be set in:
		// - .dev.vars file for local development (QURAN_ENV=pre-production)
		// - Wrangler secrets for production (wrangler secret put QURAN_ENV)
		const quranEnvStr = (this.env as any).QURAN_ENV?.toLowerCase();
		const quranEnv = quranEnvStr === "pre-production"
			? QuranEnvironment.PRE_PRODUCTION
			: QuranEnvironment.PRODUCTION;

		// Initialize Quran client with automatic OAuth2 token management
		// The SDK will:
		// 1. Obtain an access token using client credentials on first request
		// 2. Cache the token for 1 hour (3600 seconds)
		// 3. Automatically renew the token when it expires
		// 4. Include proper authentication headers (x-auth-token, x-client-id) with each request
		const quranClient = getQuranClient({
			clientId: this.env.QURAN_CLIENT_ID,
			clientSecret: this.env.QURAN_CLIENT_SECRET,
			defaultLanguage: Language.ENGLISH,
			environment: quranEnv,
		});

		// 🕌 Quran Tool: Get Verse by Key
		this.server.tool(
			"getVerse",
			"Fetch a Quranic verse by its key (chapter:verse format, e.g., '2:255' for Ayat al-Kursi). Optionally include translations, word-by-word breakdown, and tafsir (commentary). NOTE: To find available translation IDs, use the getAvailableTranslations tool first.",
			{
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
			},
			async (params) => {
				return await getVerse(quranClient, params);
			},
		);

		// 🕌 Quran Tool: Get Available Translations
		this.server.tool(
			"getAvailableTranslations",
			"Get all available Quran translations with their IDs, optionally filtered by language. Use this to find translation IDs before calling getVerse.",
			{
				language: z
					.string()
					.optional()
					.describe(
						"Filter translations by language (e.g., 'english', 'urdu', 'arabic', 'spanish', 'french'). Leave empty to get all available translations."
					),
			},
			async (params) => {
				return await getAvailableTranslations(quranClient, params);
			},
		);

		// ===== DEMO TOOLS (for testing/demonstration purposes) =====
		// These tools are kept for reference and testing. They are not core functionality.
		// To enable these demo tools in production, modify the conditions below.

		// Demo Tool 1: Simple Math Addition
		// Purpose: Basic demonstration of MCP tool architecture
		// Status: Demo only
		this.server.tool(
			"add",
			"[DEMO] Add two numbers - demonstration tool for MCP architecture",
			{ a: z.number(), b: z.number() },
			async ({ a, b }) => ({
				content: [{ text: String(a + b), type: "text" }],
			}),
		);

		// Demo Tool 2: Get GitHub User Info via OAuth
		// Purpose: Demonstrates OAuth integration with GitHub Octokit
		// Status: Demo only - uses authenticated user's token
		// Note: For production use, consider security implications
		this.server.tool(
			"userInfoOctokit",
			"[DEMO] Get authenticated user info from GitHub - OAuth integration demo",
			{},
			async () => {
				const octokit = new Octokit({ auth: this.props!.accessToken });
				return {
					content: [
						{
							text: JSON.stringify(await octokit.rest.users.getAuthenticated()),
							type: "text",
						},
					],
				};
			},
		);

		// Demo Tool 3: AI Image Generation
		// Purpose: Demonstrates integration with Cloudflare Workers AI
		// Status: Demo only - restricted to ALLOWED_USERNAMES
		// Note: Requires Cloudflare AI binding configured in wrangler.jsonc
		// To enable, add GitHub usernames to ALLOWED_USERNAMES Set at the top of this file
		if (ALLOWED_USERNAMES.has(this.props!.login)) {
			this.server.tool(
				"generateImage",
				"[DEMO] Generate an image using Cloudflare Workers AI - image generation demo",
				{
					prompt: z
						.string()
						.describe("A text description of the image you want to generate."),
					steps: z
						.number()
						.min(4)
						.max(8)
						.default(4)
						.describe(
							"The number of diffusion steps; higher values can improve quality but take longer. Must be between 4 and 8, inclusive.",
						),
				},
				async ({ prompt, steps }) => {
					const response = await this.env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
						prompt,
						steps,
					});

					return {
						content: [{ data: response.image!, mimeType: "image/jpeg", type: "image" }],
					};
				},
			);
		}
		// ===== END DEMO TOOLS =====
	}
}

export default new OAuthProvider({
	// NOTE - during the summer 2025, the SSE protocol was deprecated and replaced by the Streamable-HTTP protocol
	// https://developers.cloudflare.com/agents/model-context-protocol/transport/#mcp-server-with-authentication
	apiHandlers: {
		"/sse": MyMCP.serveSSE("/sse"), // deprecated SSE protocol - use /mcp instead
		"/mcp": MyMCP.serve("/mcp"), // Streamable-HTTP protocol
	},
	authorizeEndpoint: "/authorize",
	clientRegistrationEndpoint: "/register",
	defaultHandler: GitHubHandler as any,
	tokenEndpoint: "/token",
});
