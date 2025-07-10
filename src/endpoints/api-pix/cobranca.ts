import { routeWithResponse, routeWithResponseAndParam } from "internal/httpClient";
import { BASE_ROUTE, withSandboxVerification } from "./utils";
import {
	ConsultarCobrancaResponseSchema,
	CriarCobrancaResponseSchema,
	type PagarPixCobrancaRequestSchema,
	PagarPixCobrancaResponseSchema,
	type CriarCobrancaRequestSchema,
} from "$models/api-pix/cobranca";

/**
 * Cria uma nova cobrança PIX imediata.
 *
 * Permite gerar uma cobrança PIX com QR Code para recebimento imediato.
 * A cobrança possui um prazo de expiração e pode incluir informações do devedor,
 * valor, chave PIX e dados adicionais.
 *
 * @param body - Dados da cobrança a ser criada
 * @returns Cobrança criada com TXID, QR Code e demais informações
 */
export const criarCobranca = routeWithResponse<typeof CriarCobrancaRequestSchema.Type, typeof CriarCobrancaResponseSchema.Type>(
	"POST",
	`${BASE_ROUTE}/cob`,
	CriarCobrancaResponseSchema,
);

/**
 * Consulta uma cobrança PIX existente pelo TXID.
 *
 * Permite recuperar informações completas de uma cobrança PIX previamente criada,
 * incluindo status atual, dados do devedor, valor e informações de pagamento.
 *
 * @param txid - Identificador único da transação (TXID)
 * @returns Dados completos da cobrança consultada
 */
export const consultarCobranca = routeWithResponseAndParam<never, typeof ConsultarCobrancaResponseSchema.Type>(
	"GET",
	txid => `${BASE_ROUTE}/cob/${txid}`,
	ConsultarCobrancaResponseSchema,
);

/**
 * Paga uma cobrança PIX existente.
 *
 * Permite efetuar o pagamento de uma cobrança PIX utilizando o TXID e o valor a ser pago.
 * Retorna os dados da cobrança após o pagamento, incluindo status atualizado.
 *
 * # Somente Sandbox.
 * ---
 *
 *
 * @param txid - Identificador único da transação (TXID)
 * @param body - Valor do pagamento a ser efetuado
 * @returns Dados da cobrança após o pagamento
 */
export const pagarPixCobranca = withSandboxVerification(
	routeWithResponseAndParam<typeof PagarPixCobrancaRequestSchema.Type, typeof PagarPixCobrancaResponseSchema.Type>(
		"POST",
		txid => `${BASE_ROUTE}/cob/pagar/${txid}`,
		PagarPixCobrancaResponseSchema,
	),
);
