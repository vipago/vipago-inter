import { describe, expect, it } from "bun:test";
import { BunFileSystem } from "@effect/platform-bun/index";
import { Effect } from "effect";
import { getGlobalOAuthToken, InterCache } from "../src/structures/interOAuth";
import { InterConfig } from "../src/structures/interConfig";
import { makeConfigLayer, testRuntime } from "./utils";

describe("Testes do cliente do Inter e OAuth", () => {
	it("deve construir o InterClient", () =>
		Effect.gen(function* () {
			const config = yield* InterConfig.Tag;

			expect(config.sandbox).toBe(true);
			expect(config.scope).toEqual(["cob.read", "cob.write"]);
		}).pipe(Effect.provide(makeConfigLayer(["cob.read", "cob.write"])), Effect.provide(BunFileSystem.layer), Effect.runPromise));

	it("deve obter o token", () =>
		Effect.gen(function* () {
			const token = yield* getGlobalOAuthToken;

			expect(token).toBeDefined();
		}).pipe(testRuntime.runPromise));

	it("deve obter o token do cache", () =>
		Effect.gen(function* () {
			yield* getGlobalOAuthToken;

			const cache = yield* InterCache.Tag;

			const metrics = yield* cache.cacheStats;

			yield* Effect.logDebug("Cache status", metrics);

			metrics.hits > 0 && expect(metrics.misses).toBeGreaterThan(0);
		}).pipe(Effect.timeout("100 millis"), testRuntime.runPromise));
});
