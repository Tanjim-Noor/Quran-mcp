/**
 * Quran API Client Configuration
 * 
 * This module handles the initialization and configuration of the Quran SDK client.
 * It uses the Client Credentials OAuth2 flow to authenticate with the Quran Foundation API.
 * 
 * The SDK automatically handles:
 * - OAuth2 token acquisition using client credentials
 * - Token caching and automatic renewal (tokens expire after 1 hour)
 * - Sending proper authentication headers (x-auth-token, x-client-id) with each request
 * 
 * Environment Configuration:
 * - Production: apis.quran.foundation (default)
 * - Pre-Production: apis-prelive.quran.foundation (for testing)
 * 
 * Warning: Access tokens are environment-specific and cannot be used across different environments.
 */

import { QuranClient, Language } from "@quranjs/api";

/**
 * API environment configuration
 */
export enum QuranEnvironment {
	/** Production environment - live API */
	PRODUCTION = "production",
	/** Pre-production environment - for testing and development */
	PRE_PRODUCTION = "pre-production",
}

/**
 * Configuration interface for Quran client
 */
export interface QuranConfig {
	/** OAuth2 Client ID from Quran Foundation */
	clientId: string;
	/** OAuth2 Client Secret from Quran Foundation */
	clientSecret: string;
	/** Default language for API responses */
	defaultLanguage?: Language;
	/** 
	 * API environment to use 
	 * @default QuranEnvironment.PRODUCTION
	 */
	environment?: QuranEnvironment;
}

/**
 * Environment-specific API endpoints
 */
const ENVIRONMENT_CONFIG = {
	[QuranEnvironment.PRODUCTION]: {
		contentBaseUrl: "https://apis.quran.foundation",
		authBaseUrl: "https://oauth2.quran.foundation",
	},
	[QuranEnvironment.PRE_PRODUCTION]: {
		contentBaseUrl: "https://apis-prelive.quran.foundation",
		authBaseUrl: "https://prelive-oauth2.quran.foundation",
	},
} as const;

/**
 * Creates and returns a configured Quran API client
 * 
 * The client handles OAuth2 authentication automatically:
 * 1. On first request, it obtains an access token using client credentials
 * 2. Tokens are cached and reused for 1 hour (3600 seconds)
 * 3. When a token expires, a new one is automatically requested
 * 4. All API requests include proper authentication headers
 * 
 * @param config - Quran client configuration
 * @returns Configured QuranClient instance
 * 
 * @example
 * ```typescript
 * // Production environment (default)
 * const prodClient = createQuranClient({
 *   clientId: env.QURAN_CLIENT_ID,
 *   clientSecret: env.QURAN_CLIENT_SECRET,
 *   defaultLanguage: Language.ENGLISH
 * });
 * 
 * // Pre-production environment for testing
 * const devClient = createQuranClient({
 *   clientId: env.QURAN_CLIENT_ID,
 *   clientSecret: env.QURAN_CLIENT_SECRET,
 *   environment: QuranEnvironment.PRE_PRODUCTION
 * });
 * ```
 */
export function createQuranClient(config: QuranConfig): QuranClient {
	const environment = config.environment || QuranEnvironment.PRODUCTION;
	const envConfig = ENVIRONMENT_CONFIG[environment];

	return new QuranClient({
		clientId: config.clientId,
		clientSecret: config.clientSecret,
		contentBaseUrl: envConfig.contentBaseUrl,
		authBaseUrl: envConfig.authBaseUrl,
		defaults: {
			language: config.defaultLanguage || Language.ENGLISH,
		},
	});
}

/**
 * Global client instance cache to avoid recreating the client
 * This is particularly useful in Cloudflare Workers where we want to reuse connections
 * and maintain the same OAuth2 token cache across multiple requests.
 * 
 * The cached client retains:
 * - Configuration settings
 * - OAuth2 access token (valid for 1 hour)
 * - HTTP connection pooling
 */
let cachedClient: QuranClient | null = null;
let cachedConfig: string | null = null;

/**
 * Generates a unique cache key for the client configuration
 */
function getConfigKey(config: QuranConfig): string {
	return `${config.clientId}:${config.environment || QuranEnvironment.PRODUCTION}`;
}

/**
 * Gets or creates a Quran client instance (singleton pattern)
 * 
 * This function implements caching to:
 * - Avoid recreating the client on every request
 * - Maintain OAuth2 token cache across requests
 * - Improve performance in serverless environments
 * 
 * The cache is invalidated if:
 * - Client credentials change
 * - Environment changes
 * 
 * @param config - Quran client configuration
 * @returns Cached or new QuranClient instance
 * 
 * @example
 * ```typescript
 * // First call creates a new client
 * const client1 = getQuranClient(config);
 * 
 * // Subsequent calls with same config return cached client
 * const client2 = getQuranClient(config); // Same instance as client1
 * 
 * // Different config creates a new client
 * const client3 = getQuranClient(differentConfig); // New instance
 * ```
 */
export function getQuranClient(config: QuranConfig): QuranClient {
	const configKey = getConfigKey(config);
	
	// Return cached client if configuration matches
	if (cachedClient && cachedConfig === configKey) {
		return cachedClient;
	}
	
	// Create new client if cache miss or configuration changed
	cachedClient = createQuranClient(config);
	cachedConfig = configKey;
	
	return cachedClient;
}

/**
 * Clears the cached client instance
 * 
 * Use this when:
 * - Credentials need to be updated
 * - Token needs to be forcefully refreshed
 * - Testing different configurations
 * - Switching between accounts
 * 
 * @example
 * ```typescript
 * // Clear token cache and force re-authentication
 * clearClientCache();
 * const client = getQuranClient(newConfig);
 * ```
 */
export function clearClientCache(): void {
	if (cachedClient) {
		cachedClient.clearCachedToken();
		cachedClient = null;
	}
	cachedConfig = null;
}
