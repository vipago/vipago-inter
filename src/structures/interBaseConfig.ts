import { FileSystem } from "@effect/platform/FileSystem";
import { Config, ConfigProvider, Context, Effect, Layer, pipe, Redacted } from "effect";
import type { InterConfig, InterOptions } from "$models/config";

export namespace InterBaseConfig {
	export class Tag extends Context.Tag("bancointer/InterConfig")<Tag, InterConfig>() {}

	export const make = (options: InterOptions) => {
		return Layer.effect(
			Tag,
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
					certificate: Redacted.make(yield* makeTLSConfig(options.certificate)),
					privKey: Redacted.make(yield* makeTLSConfig(options.priv_key)),
					client_id: options.client_id,
					client_secret: Redacted.make(options.client_secret),
					base_url: options.base_url ?? (options.sandbox ? "https://cdpj-sandbox.partners.uatinter.co" : "https://cdpj.partners.bancointer.com.br"),
					sandbox: Boolean(options.sandbox),
					scope: options.scope,
				};
			}),
		);
	};

	export const layerConfig = (config: Config.Config.Wrap<InterOptions>) => {
		return pipe(Config.unwrap(config), Effect.map(make));
	};

	export const loadConfig = (config: InterOptions) => {
		return ConfigProvider.fromJson(config);
	};
}
