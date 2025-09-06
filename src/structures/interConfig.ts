import { FileSystem } from "@effect/platform/FileSystem";
import { Config, ConfigProvider, Context, Effect, Layer, pipe, Redacted } from "effect";
import type { InterOAuthScopeType } from "../models/oauth";

export namespace InterConfig {
	export class Tag extends Context.Tag("bancointer/InterConfig")<Tag, InterConfig>() {}

	export interface InterOptions {
		readonly certificate: string | Buffer;
		readonly priv_key: string | Buffer;
		readonly client_id: string;
		readonly client_secret: string;
		readonly scope: InterOAuthScopeType | InterOAuthScopeType[];
		readonly sandbox?: boolean;
		readonly base_url?: string;
	}

	export interface InterConfig {
		readonly certificate: Redacted.Redacted<Buffer>;
		readonly privKey: Redacted.Redacted<Buffer>;
		readonly client_id: string;
		readonly client_secret: Redacted.Redacted<string>;
		readonly scope: InterOAuthScopeType | InterOAuthScopeType[];
		readonly base_url: string;
		readonly sandbox: boolean;
	}

	export const makeEffect = (options: InterOptions) => {
		return Effect.gen(function* () {
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
				certificate: Redacted.make(yield* makeTLSConfig(options.certificate)),
				privKey: Redacted.make(yield* makeTLSConfig(options.priv_key)),
				client_id: options.client_id,
				client_secret: Redacted.make(options.client_secret),
				base_url: options.base_url ?? (options.sandbox ? "https://cdpj-sandbox.partners.uatinter.co" : "https://cdpj.partners.bancointer.com.br"),
				sandbox: Boolean(options.sandbox),
				scope: options.scope,
			};
		});
	};
	export const make = (options: InterOptions) => {
		return Layer.effect(Tag, makeEffect(options));
	};
	export const layerConfig = (config: Config.Config.Wrap<InterOptions>) => {
		return Layer.effect(Tag, pipe(Config.unwrap(config), Effect.andThen(makeEffect)));
	};

	export const loadConfig = (config: InterOptions) => {
		return ConfigProvider.fromJson(config);
	};
}
