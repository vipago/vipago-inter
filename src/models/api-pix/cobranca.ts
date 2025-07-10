/**
 * # API PIX - Cobrança Imediata
 *
 * Esta API permite criar e gerenciar cobranças PIX imediatas no Banco Inter.
 *
 * ## Documentação Oficial
 * https://developers.inter.co/references/pix#tag/Cobranca-Imediata
 *
 */

import { Schema } from "effect";

export const DevedorCobranca = Schema.Union(
	Schema.Struct({
		nome: Schema.String.annotations({
			title: "Nome do Devedor",
			description: "Nome completo da pessoa física devedora",
		}),
		cpf: Schema.String.annotations({
			title: "CPF",
			description: "CPF do devedor pessoa física",
		}),
	}),
	Schema.Struct({
		nome: Schema.String.pipe(
			Schema.annotations({
				title: "Razão Social",
				description: "Razão social da pessoa jurídica devedora",
			}),
		),
		cnpj: Schema.String.pipe(
			Schema.annotations({
				title: "CNPJ",
				description: "CNPJ do devedor pessoa jurídica",
			}),
		),
	}),
).annotations({
	title: "Devedor da Cobrança",
	description: "Dados do devedor da cobrança PIX (pessoa física ou jurídica)",
	identifier: "DevedorCobranca",
});

export const CalendarioCobranca = Schema.Struct({
	expiracao: Schema.Int.pipe(
		Schema.propertySignature,
		Schema.withConstructorDefault(() => 600), // 10 minutos
	).annotations({
		title: "Tempo de Expiração",
		description: "Tempo em segundos até a expiração da cobrança",
	}),
	criacao: Schema.DateFromString.pipe(Schema.optionalWith({ nullable: true })).annotations({
		title: "Data de Criação",
		description: "Data e hora de criação da cobrança",
	}),
}).annotations({
	title: "Calendário da Cobrança",
	description: "Informações de tempo relacionadas à cobrança PIX",
	identifier: "CalendarioCobranca",
});

export const LocCobrancaRequest = Schema.Struct({
	id: Schema.Int.annotations({
		title: "ID da Location",
		description: "Identificador numérico da location",
	}),
	tipoCob: Schema.Literal("cob", "cobv").annotations({
		title: "Tipo de Cobrança",
		description: "Tipo da cobrança: 'cob' para imediata ou 'cobv' para com vencimento",
	}),
}).annotations({
	title: "Location de Cobrança (Requisição)",
	description: "Dados para criação de location de cobrança",
	identifier: "LocCobrancaRequest",
});

export const LocCobrancaResponse = Schema.Struct({
	location: Schema.String.pipe(Schema.optionalWith({ nullable: true })).annotations({
		title: "URL da Location",
		description: "URL da location criada para a cobrança",
	}),
	criacao: Schema.DateFromString.annotations({
		title: "Data de Criação da Location",
		description: "Data e hora de criação da location",
	}),
	...LocCobrancaRequest.fields,
}).annotations({
	title: "Location de Cobrança (Resposta)",
	description: "Dados da location criada para a cobrança",
	identifier: "LocCobrancaResponse",
});

export const ValorCobranca = Schema.Struct({
	original: Schema.BigDecimal.annotations({
		title: "Valor Original",
		description: "Valor monetário original da cobrança em reais",
	}),
	modalidadeAlteracao: Schema.Literal(0, 1)
		.pipe(Schema.optionalWith({ nullable: true }))
		.annotations({
			title: "Modalidade de Alteração",
			description: "Indica se o valor pode ser alterado: 0 = não alterável, 1 = alterável",
		}),
}).annotations({
	title: "Valor da Cobrança",
	description: "Informações sobre o valor da cobrança PIX",
	identifier: "ValorCobranca",
});

export const InfoAdicionaisCobranca = Schema.Array(
	Schema.Struct({
		nome: Schema.String.annotations({
			title: "Nome do Campo",
			description: "Nome identificador da informação adicional",
		}),
		valor: Schema.String.annotations({
			title: "Valor do Campo",
			description: "Valor da informação adicional",
		}),
	}).annotations({
		title: "Informação Adicional",
		description: "Par nome-valor de informação adicional",
	}),
).annotations({
	title: "Informações Adicionais",
	description: "Lista de informações adicionais da cobrança",
	identifier: "InfoAdicionaisCobranca",
});

export const CobrancaStatus = Schema.Literal("ATIVA", "CONCLUIDA", "REMOVIDA_PELO_USUARIO_RECEBEDOR", "REMOVIDA_PELO_PSP").annotations({
	title: "Status da Cobrança",
	description: "Status atual da cobrança PIX",
	identifier: "CobrancaStatus",
});

export const CriarCobrancaRequestSchema = Schema.Struct({
	calendario: CalendarioCobranca.pick("expiracao").pipe(
		Schema.propertySignature,
		Schema.withConstructorDefault(() => CalendarioCobranca.make()),
	),
	devedor: DevedorCobranca,
	loc: LocCobrancaRequest.pipe(Schema.optionalWith({ nullable: true })),
	valor: ValorCobranca,
	chave: Schema.String.pipe(
		Schema.annotations({
			title: "Chave PIX",
			description: "Chave PIX do recebedor",
		}),
	),
	solicitacaoPagador: Schema.String.pipe(Schema.optionalWith({ nullable: true })).annotations({
		title: "Solicitação do Pagador",
		description: "Texto livre para solicitação ao pagador",
	}),
	infoAdicionais: InfoAdicionaisCobranca,
}).annotations({
	title: "Criar Cobrança PIX - Requisição",
	description: "Dados necessários para criar uma nova cobrança PIX imediata",
	identifier: "CriarCobrancaRequest",
});

export const CriarCobrancaResponseSchema = Schema.Struct({
	devedor: DevedorCobranca,
	loc: LocCobrancaResponse,
	location: Schema.String.pipe(Schema.optionalWith({ nullable: true })).annotations({
		title: "Location da Cobrança",
		description: "URL da location da cobrança criada",
	}),
	status: CobrancaStatus,
	valor: ValorCobranca,
	calendario: CalendarioCobranca,
	txid: Schema.String.annotations({
		title: "TXID",
		description: "Identificador único da transação",
	}),
	revisao: Schema.Int.annotations({
		title: "Revisão",
		description: "Número da revisão da cobrança",
	}),
	pixCopiaECola: Schema.String.annotations({
		title: "PIX Copia e Cola",
		description: "Código PIX para cópia e colagem",
	}),
	chave: Schema.String.annotations({
		title: "Chave PIX",
		description: "Chave PIX do recebedor",
	}),
	solicitacaoPagador: Schema.String.pipe(Schema.optionalWith({ nullable: true })).annotations({
		title: "Solicitação do Pagador",
		description: "Texto livre para solicitação ao pagador",
	}),
	infoAdicionais: InfoAdicionaisCobranca,
}).annotations({
	title: "Criar Cobrança PIX - Resposta",
	description: "Dados da cobrança PIX criada com sucesso",
	identifier: "CriarCobrancaResponse",
});

export const ConsultarCobrancaResponseSchema = CriarCobrancaResponseSchema.annotations({
	title: "Consultar Cobrança PIX - Resposta",
	description: "Dados completos da cobrança PIX consultada",
	identifier: "ConsultarCobrancaResponse",
});

export const PagarPixCobrancaRequestSchema = Schema.Struct({
	valor: Schema.Number.annotations({
		title: "Valor do Pagamento",
		description: "Valor a ser pago na cobrança PIX",
	}),
}).annotations({
	title: "Pagar Cobrança PIX - Requisição",
	description: "Dados necessários para pagar uma cobrança PIX",
	identifier: "PagarPixCobrancaRequest",
});

export const PagarPixCobrancaResponseSchema = Schema.Struct({
	e2e: Schema.String.annotations({
		title: "E2E ID",
		description: "Identificador único do pagamento E2E",
	}),
}).annotations({
	title: "Pagar Cobrança PIX - Resposta",
	description: "Dados do pagamento realizado na cobrança PIX",
	identifier: "PagarPixCobrancaResponse",
});
