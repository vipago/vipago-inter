import https from "node:https";
import { Data, Effect } from "effect";

export class HttpsRequestError extends Data.TaggedError("bancointer/HttpsRequestError")<{ cause: Error; response?: HttpsResponse }> {
	override toString(): string {
		return `HttpsRequestError: ${this.cause.message}${this.response ? `\nResponse: ${JSON.stringify(this.response)}` : ""}`;
	}
}

export type HttpsResponse = {
	statusCode: number;
	responseBody: string;
};

export const httpsRequestEffect = (
	method: string,
	url: string,
	body: unknown,
	cert: Buffer,
	key: Buffer,
	headers: Record<string, string> = {},
): Effect.Effect<HttpsResponse, HttpsRequestError, never> =>
	Effect.async(resume => {
		const parsedUrl = new URL(url);
		headers["Content-Type"] ??= "application/json";
		const options = {
			method,
			hostname: parsedUrl.hostname,
			path: parsedUrl.pathname + parsedUrl.search,
			cert,
			key,
			headers,
		};

		const req = https.request(options, res => {
			let data = "";
			res.on("data", chunk => {
				data += chunk;
			});
			res.on("end", () => {
				const finalResponse = {
					statusCode: res.statusCode || 0,
					responseBody: data,
				};
				if (finalResponse.statusCode < 200 || finalResponse.statusCode > 299) {
					resume(
						Effect.fail(
							new HttpsRequestError({
								cause: new Error(`Non 2xx status code: ${finalResponse.statusCode}`),
								response: finalResponse,
							}),
						),
					);
				} else {
					resume(Effect.succeed(finalResponse));
				}
			});
		});

		req.on("error", error => {
			resume(Effect.fail(new HttpsRequestError({ cause: error })));
		});

		if (body) req.write(typeof body === "object" && headers["Content-Type"].toLowerCase() === "application/json" ? JSON.stringify(body) : body);
		req.end();
	});
