import { Cache, Effect, Layer, Redacted, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import type { InterConfig } from "$models/config";
import { InterOAuthResponseJSON } from "$models/oauth";
import type { HttpsRequestError } from "./httpRequest";
import { httpsRequestEffect } from "./httpRequest";
import { InterBaseConfig } from "./interBaseConfig";

const DEFAULT_ROUTE = "/oauth/v2/token";

const accessTokenService = (config: InterConfig) =>
	Effect.gen(function* () {
		const response = yield* httpsRequestEffect(
			"POST",
			`${config.base_url}${DEFAULT_ROUTE}`,
			new URLSearchParams({
				client_id: config.client_id,
				client_secret: Redacted.value(config.client_secret),
				grant_type: "client_credentials",
				scope: config.scope,
			}).toString(),
			Redacted.value(config.certificate),
			Redacted.value(config.privKey),
			{
				"Content-Type": "application/x-www-form-urlencoded",
			},
		).pipe(Effect.flatMap(({ responseBody }) => Schema.decode(InterOAuthResponseJSON)(responseBody)));
		return response.access_token;
	}).pipe(Effect.scoped);

export namespace InterCache {
	export class Tag extends Effect.Tag("bancointer/InterCacheService")<
		Tag,
		Cache.Cache<InterConfig, Redacted.Redacted<string>, HttpsRequestError | ParseError>
	>() {}

	export const LAYER = Layer.effect(
		Tag,
		Cache.make({
			capacity: 10,
			timeToLive: "1 hour",
			lookup: accessTokenService,
		}),
	);
}

export const getGlobalOAuthToken = Effect.gen(function* () {
	const config = yield* InterBaseConfig.Tag;
	const cache = yield* InterCache.Tag;
	return yield* cache.get(config);
});
