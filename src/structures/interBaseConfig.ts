import { FileSystem } from "@effect/platform/FileSystem";
import { Config, Context, Effect, Layer, pipe, Redacted } from "effect";
import type { InterOAuthScope } from "./interOAuth";

export interface InterBaseConfig {
	readonly certificate: string | Buffer;
	readonly priv_key: string | Buffer;
	readonly client_id: string;
	readonly client_secret: string;
	readonly scope: InterOAuthScope | InterOAuthScope[];
	readonly sandbox?: boolean;
	readonly base_url?: string;
}

export interface InterConfig {
	readonly certificate: Redacted.Redacted<Buffer>;
	readonly privKey: Redacted.Redacted<Buffer>;
	readonly client_id: string;
	readonly client_secret: Redacted.Redacted<string>;
	readonly scope: InterOAuthScope | InterOAuthScope[];
	readonly base_url: string;
	readonly sandbox: boolean;
}

export class InterConfigTag extends Context.Tag("bancointer/InterConfig")<InterConfigTag, InterConfig>() {}

export const make = (config: InterBaseConfig) => {
	return Layer.effect(
		InterConfigTag,
		Effect.gen(function* () {
			const makeTLSConfig = (config: string | Buffer) => {
				return Effect.gen(function* () {
					if (typeof config === "string") {
						const fs = yield* FileSystem;

						const file = yield* fs.readFile(config);

						return Buffer.from(file);
					}

					return config;
				});
			};

			return {
				certificate: Redacted.make(yield* makeTLSConfig(config.certificate)),
				privKey: Redacted.make(yield* makeTLSConfig(config.priv_key)),
				client_id: config.client_id,
				client_secret: Redacted.make(config.client_secret),
				base_url:
					(config.base_url ?? Boolean(config.sandbox)) ? " https://cdpj-sandbox.partners.uatinter.co" : "https://cdpj.partners.bancointer.com.br",
				sandbox: Boolean(config.sandbox),
				scope: config.scope,
			};
		}),
	);
};

export const layerConfig = (config: Config.Config.Wrap<InterBaseConfig>) => {
	return pipe(Config.unwrap(config), Effect.map(make));
};
