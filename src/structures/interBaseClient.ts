import { Config, Console, Context, Effect, Layer, pipe } from "effect";

export interface InterBaseClientConfig {
	readonly certificate: string | Buffer;
	readonly priv_key: string | Buffer;
	readonly client_id: string;
	readonly client_secret: string;
}

export const layerConfig = (config: Config.Config.Wrap<InterBaseClientConfig>) => {
	Config.unwrap(config).pipe();
};
