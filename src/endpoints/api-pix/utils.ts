import { InterBaseConfig } from "$structures/interBaseConfig";
import { Effect } from "effect";

/** @internal **/
export const BASE_ROUTE = "/pix/v2";

/** @internal */
export const withSandboxVerification =
	<Args extends any[], R, E, D>(routeFn: (...args: Args) => Effect.Effect<R, E, D>) =>
	(...args: Args) =>
		Effect.gen(function* () {
			const config = yield* InterBaseConfig.Tag;

			if (!config.sandbox) {
				return yield* Effect.fail(new Error("Sandbox mode is not enabled. Please set `sandbox: true` in the configuration."));
			}

			return yield* routeFn(...args);
		});
