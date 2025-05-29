import { Effect, Layer, Redacted, Schema } from "effect";
import { InterConfigTag, type InterConfig } from "./interBaseConfig";
import type { HttpsRequestError } from "./httpRequest";
import { httpsRequestEffect } from "./httpRequest";
import type { ParseError } from "effect/ParseResult";

const DEFAULT_ROUTE = "/oauth/v2/token";

export type InterOAuthScope =
	| "extrato.read"
	| "boleto-cobranca.read"
	| "boleto-cobranca.write"
	| "pagamento-boleto.write"
	| "pagamento-boleto.read"
	| "pagamento-darf.write"
	| "cob.write"
	| "cob.read"
	| "cobv.write"
	| "cobv.read"
	| "pix.write"
	| "pix.read"
	| "webhook.read"
	| "webhook.write"
	| "payloadlocation.write"
	| "payloadlocation.read"
	| "pagamento-pix.write"
	| "pagamento-pix.read"
	| "webhook-banking.write"
	| "webhook-banking.read"
	| "pagamento-lote.write"
	| "pagamento-lote.read"
	| "lotecobv.read"
	| "lotecobv.write";

export interface InterOAuthParams {
	scope: InterOAuthScope | InterOAuthScope[];
}

const InterOAuthResponseSchema = Schema.parseJson(
	Schema.Struct({
		access_token: Schema.String.pipe(Schema.Redacted),
		token_type: Schema.String,
		expires_in: Schema.Number,
		scope: Schema.String,
	}),
);

export type InterOAuthResponse = typeof InterOAuthResponseSchema.Type;

export interface InterOAuthService {
	getAccessToken: Effect.Effect<Redacted.Redacted<string>, HttpsRequestError | ParseError, never>;
}

export class InterOAuthServiceTag extends Effect.Tag("bancointer/InterOAuthService")<InterOAuthServiceTag, InterOAuthService>() {}

const token = {
	token: Redacted.make(""),
	last_renew: 0,
	expires_in: 0,
	latch: Effect.unsafeMakeLatch(),
};

const accessTokenService = (config: InterConfig) =>
	Effect.gen(function* () {
		if (token.last_renew + token.expires_in * 1e3 > Date.now()) {
			return token.token;
		}

		yield* token.latch.close;
		yield* Effect.addFinalizer(() => token.latch.open); // Abre o latch quando finalizar, independente do resultado

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
		).pipe(Effect.flatMap(({ responseBody }) => Schema.decode(InterOAuthResponseSchema)(responseBody)));

		token.token = response.access_token;
		token.last_renew = Date.now();
		token.expires_in = response.expires_in;

		return token.token;
	}).pipe(token.latch.whenOpen, Effect.scoped);

export const InterOAuthServiceLive = Layer.effect(
	InterOAuthServiceTag,
	Effect.gen(function* () {
		const config = yield* InterConfigTag;

		return {
			getAccessToken: accessTokenService(config),
		};
	}),
);
