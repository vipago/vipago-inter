import { Cache, Effect, Layer as EffectLayer, Redacted, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import { InterOAuthResponseJSON } from "../models/oauth";
import type { HttpsRequestError } from "./httpRequest";
import { httpsRequestEffect } from "./httpRequest";
import { InterConfig } from "./interConfig";
const DEFAULT_ROUTE = "/oauth/v2/token";
export type UnredactedConfig = {
  [K in keyof InterConfig.InterConfig]: InterConfig.InterConfig[K] extends Redacted.Redacted<infer U> ? U : InterConfig.InterConfig[K]
} extends infer B ? B : never;
const accessTokenService = (configJson: string) =>
	Effect.gen(function* () {
		const config = JSON.parse(configJson) as UnredactedConfig;
		const response = yield* httpsRequestEffect(
			"POST",
			`${config.base_url}${DEFAULT_ROUTE}`,
			new URLSearchParams({
				client_id: config.client_id,
				client_secret: config.client_secret,
				grant_type: "client_credentials",
				scope: typeof config.scope === "string" ? config.scope : config.scope.join(" "),
			}).toString(),
			config.certificate,
			config.privKey,
			{
				"Content-Type": "application/x-www-form-urlencoded",
			},
		).pipe(Effect.flatMap(({ responseBody }) => Schema.decode(InterOAuthResponseJSON)(responseBody)));
		return response.access_token;
	}).pipe(Effect.scoped);

export namespace InterCache {
	export class Tag extends Effect.Tag("bancointer/InterCacheService")<
		Tag,
		Cache.Cache<string, Redacted.Redacted<string>, HttpsRequestError | ParseError>
	>() {}

	export const Layer = EffectLayer.effect(
		Tag,
		Cache.make({
			capacity: Infinity,
			timeToLive: "1 hour",
			lookup: accessTokenService,
		}),
	);
}

export const getGlobalOAuthToken = Effect.gen(function* () {
	const config = yield* InterConfig.Tag;
	const cache = yield* InterCache.Tag;
	return yield* cache.get(JSON.stringify({
		...config,
		client_secret: Redacted.value(config.client_secret),
		certificate: Redacted.value(config.certificate),
		privKey: Redacted.value(config.privKey),		
	} satisfies UnredactedConfig));
});
