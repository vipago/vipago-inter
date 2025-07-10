import { Schema } from "effect";

export const InterOAuthScope = Schema.Literal(
	"extrato.read",
	"boleto-cobranca.read",
	"boleto-cobranca.write",
	"pagamento-boleto.write",
	"pagamento-boleto.read",
	"pagamento-darf.write",
	"cob.write",
	"cob.read",
	"cobv.write",
	"cobv.read",
	"pix.write",
	"pix.read",
	"webhook.read",
	"webhook.write",
	"payloadlocation.write",
	"payloadlocation.read",
	"pagamento-pix.write",
	"pagamento-pix.read",
	"webhook-banking.write",
	"webhook-banking.read",
	"pagamento-lote.write",
	"pagamento-lote.read",
	"lotecobv.read",
	"lotecobv.write",
);

export type InterOAuthScopeType = typeof InterOAuthScope.Type;

export interface InterOAuthParams {
	scope: InterOAuthScopeType | InterOAuthScopeType[];
}

export const InterOAuthResponseSchema = Schema.Struct({
	access_token: Schema.String.pipe(Schema.Redacted),
	token_type: Schema.String,
	expires_in: Schema.Number,
	scope: Schema.String,
});

export const InterOAuthResponseJSON = Schema.parseJson(InterOAuthResponseSchema);

export type InterOAuthResponse = typeof InterOAuthResponseSchema.Type;
