import { describe, expect, it } from "bun:test";
import { BigDecimal, Effect, Redacted, Schema } from "effect";
import { consultarCobranca, criarCobranca, pagarPixCobranca } from "../../src/endpoints/api-pix/cobranca";
import { CriarCobrancaRequestSchema } from "../../src/models/api-pix/cobranca";
import { getGlobalOAuthToken } from "../../src/structures/interOAuth";
import { testRuntime } from "../utils";

describe("Testes da API PIX", () => {
	it("deve criar corpo da requisição", () =>
		Effect.gen(function* () {
			const body = yield* Schema.encode(CriarCobrancaRequestSchema)(
				CriarCobrancaRequestSchema.make({
					chave: "abc",
					devedor: {
						nome: "João da Silva",
						cpf: "12345678909",
					},
					valor: {
						original: BigDecimal.unsafeFromString("10.1008"),
					},
				}),
			);

			yield* Effect.logDebug("Corpo da requisição:", body);

			expect(body).toBeDefined();
		}).pipe(testRuntime.runPromise));

	it(
		"deve criar uma cobrança e pagar",
		() =>
			Effect.gen(function* () {
				const cobranca = yield* criarCobranca({
					chave: "chave@pix",
					devedor: {
						nome: "João da Silva",
						cpf: "23783753015",
					},
					valor: {
						original: BigDecimal.make(1000n, 2),
					},
				});

				const token = yield* getGlobalOAuthToken;

				yield* Effect.logDebug("Token obtido:", Redacted.value(token));

				yield* Effect.logDebug("Cobranca criada:", cobranca);

				expect(cobranca).toBeDefined();
				expect(cobranca.status).toBe("ATIVA");

				yield* Effect.logDebug("Pagando pix:", cobranca.txid);
				const res = yield* pagarPixCobranca(cobranca.txid, {
					valor: BigDecimal.unsafeFromString("10.00"),
				});

				yield* Effect.logDebug("Pagamento realizado:", res);

				const newCobranca = yield* consultarCobranca(cobranca.txid);

				yield* Effect.logDebug("Cobranca consultada:", newCobranca);

				// expect(newCobranca.status).toBe("CONCLUIDA");
				// A cobrança na API do sandbox não muda o status...
			}).pipe(Effect.mapError(String), testRuntime.runPromise),
		10_000,
	);
});
