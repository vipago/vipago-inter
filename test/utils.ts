import { lstatSync } from "node:fs";
import { BunFileSystem } from "@effect/platform-bun/index";
import { Config, Effect, Layer, Logger, ManagedRuntime, Redacted, Schema } from "effect";
import type { InterOAuthScopeType } from "../src/models/oauth";
import { InterConfig } from "../src/structures/interConfig";
import { InterCache } from "../src/structures/interOAuth";

const isValidPath = Schema.filter<Schema.SchemaClass<string, string, never>>((path: string) => {
	const stats = lstatSync(path, { throwIfNoEntry: false });

	if (!stats) {
		return `Path "${path}" does not exist.`;
	}

	if (!stats.isFile()) {
		return `Path "${path}" is not a file.`;
	}

	return true;
});

export const EnvSchema = Schema.Struct({
	INTER_CLIENT_ID: Schema.String.pipe(
		Schema.annotations({
			description: "The client ID for the Inter API",
		}),
	),
	INTER_CLIENT_SECRET: Schema.Redacted(Schema.String).pipe(
		Schema.annotations({
			description: "The client secret for the Inter API",
		}),
	),
	INTER_PRIVATE_KEY: Schema.String.pipe(
		Schema.annotations({
			description: "The private key for the Inter API",
		}),
		isValidPath,
	),
	INTER_CERTIFICATE: Schema.String.pipe(
		Schema.annotations({
			description: "The certificate for the Inter API",
		}),
		isValidPath,
	),
});

export const env = Schema.decodeUnknownSync(EnvSchema)(process.env, { errors: "all" });

export const makeConfigLayer = (scope: InterOAuthScopeType[]) =>
	InterConfig.make({
		certificate: env.INTER_CERTIFICATE,
		client_id: env.INTER_CLIENT_ID,
		client_secret: Redacted.value(env.INTER_CLIENT_SECRET),
		priv_key: env.INTER_PRIVATE_KEY,
		scope: scope,
		sandbox: true,
	});

const LogLevelLive = Config.logLevel("LOG_LEVEL").pipe(
	Effect.andThen(level =>
		// Set the minimum log level
		Logger.minimumLogLevel(level),
	),
	Layer.unwrapEffect, // Convert the effect into a layer
);

export const testRuntime = ManagedRuntime.make(
	Layer.merge(makeConfigLayer(["cob.read", "cob.write", "pix.write"]), InterCache.Layer).pipe(
		Layer.provide(BunFileSystem.layer),
		Layer.provide(LogLevelLive),
		Layer.provide(Logger.pretty),
	),
);
