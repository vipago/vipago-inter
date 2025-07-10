import { InterAPIError, InterAPIErrorSchema } from "$models/error";
import { httpsRequestEffect, HttpsRequestError } from "$structures/httpRequest";
import { InterBaseConfig } from "$structures/interBaseConfig";
import { getGlobalOAuthToken } from "$structures/interOAuth";
import { Effect, Redacted, Schema } from "effect/index";

/** @internal **/
export const routeWithResponse =
	<Req, Res>(method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH", url: string, responseSchema: Schema.Schema<Res, any, never>) =>
	(body?: Req) =>
		Effect.gen(function* () {
			if (method === "GET" && body) {
				const queryParams = new URLSearchParams();
				for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
					if (value !== undefined && value !== null) {
						queryParams.append(key, String(value));
					}
				}
				const queryString = queryParams.toString();
				if (queryString) {
					const separator = url.includes("?") ? "&" : "?";
					url = `${url}${separator}${queryString}`;
				}
			}

			const config = yield* InterBaseConfig.Tag;

			const token = yield* getGlobalOAuthToken;

			const uri = URL.parse(url, config.base_url);

			if (uri === null) {
				return yield* new HttpsRequestError({ cause: new Error(`Invalid URL: ${url}`) });
			}

			return yield* httpsRequestEffect(method, uri.toString(), body, config.certificate.pipe(Redacted.value), config.privKey.pipe(Redacted.value), {
				Authorization: `Bearer ${token.pipe(Redacted.value)}`,
			}).pipe(
				Effect.catchIf(
					err => err._tag === "bancointer/HttpsRequestError" && Boolean(err.response),
					err =>
						Schema.decode(Schema.parseJson(InterAPIErrorSchema))(err.response!.responseBody).pipe(
							Effect.andThen(res => Effect.fail(new InterAPIError(res))),
						),
				),
				Effect.andThen(res => res.responseBody),
				Effect.andThen(res => Schema.decode(Schema.parseJson(responseSchema))(res)),
			);
		});

/** @internal **/
export const routeWithResponseAndParam =
	<Req, Res, Param = string>(
		method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH",
		url: (r: Param) => string,
		responseSchema: Schema.Schema<Res, any, never>,
	) =>
	(r: Param, body?: Req) =>
		routeWithResponse<Req, Res>(method, url(r), responseSchema)(body);
