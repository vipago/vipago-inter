import { Effect, Redacted, Schema } from "effect/index";
import { InterAPIError, InterAPIErrorSchema } from "$models/error";
import { HttpsRequestError, httpsRequestEffect } from "$structures/httpRequest";
import { InterConfig } from "$structures/interConfig";
import { getGlobalOAuthToken } from "$structures/interOAuth";
import type { FieldsWithContext } from "./fields";

/** @internal **/
export const routeWithResponse =
	<Res, Req extends FieldsWithContext<ReqRequirements> = never, ReqRequirements = never>(
		method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH",
		url: string,
		responseSchema: Schema.Schema<Res, any, never>,
		requestSchema?: Schema.Struct<Req>,
	) =>
	(body?: Schema.Struct.Constructor<Req>) =>
		Effect.gen(function* () {
			const bodyEncoded = body && requestSchema ? yield* Schema.encode(requestSchema)(requestSchema.make(body)) : undefined;
			if (method === "GET" && bodyEncoded) {
				const queryParams = new URLSearchParams();
				for (const [key, value] of Object.entries(bodyEncoded)) {
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

			const config = yield* InterConfig.Tag;

			const token = yield* getGlobalOAuthToken;

			const uri = URL.parse(url, config.base_url);

			if (uri === null) {
				return yield* new HttpsRequestError({
					cause: new Error(`Invalid URL: ${url}`),
				});
			}

			return yield* httpsRequestEffect(
				method,
				uri.toString(),
				bodyEncoded,
				config.certificate.pipe(Redacted.value),
				config.privKey.pipe(Redacted.value),
				{
					Authorization: `Bearer ${token.pipe(Redacted.value)}`,
				},
			).pipe(
				Effect.catchIf(
					err => err._tag === "bancointer/HttpsRequestError" && Boolean(err.response),
					err =>
						Schema.decode(Schema.parseJson(InterAPIErrorSchema))(
							// biome-ignore lint/style/noNonNullAssertion: This is safe because we check for response existence
							err.response!.responseBody,
						).pipe(
							Effect.andThen(res => Effect.fail(new InterAPIError(res))),
							Effect.catchTag("ParseError", parseErr => {
								return Effect.fail(
									new InterAPIError({
										type: "ParseError",
										title: "Failed to parse API response",
										status: 500,
										detail: `${parseErr.message}\n\n${err.response?.responseBody}`,
									}),
								);
							}),
						),
				),
				Effect.andThen(res => res.responseBody),
				Effect.tap(res => Effect.logTrace(res)),
				Effect.andThen(res => Schema.decode(Schema.parseJson(responseSchema))(res)),
			);
		}).pipe(Effect.withSpan(`${method} ${url}`));

/** @internal **/
export const routeWithResponseAndParam =
	<Res, Req extends FieldsWithContext<ReqRequirements> = never, ReqRequirements = never, Param = string>(
		method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH",
		url: (r: Param) => string,
		responseSchema: Schema.Schema<Res, any, never>,
		requestSchema?: Schema.Struct<Req>,
	) =>
	(r: Param, body?: Schema.Struct.Constructor<Req>) =>
		routeWithResponse<Res, Req, ReqRequirements>(method, url(r), responseSchema, requestSchema)(body);
