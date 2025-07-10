import { Data, Schema } from "effect/index";

export const InterAPIErrorViolacoes = Schema.Struct({
	razao: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
	propriedade: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
	valor: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
});

export const InterAPIErrorSchema = Schema.Struct({
	type: Schema.String,
	title: Schema.String,
	status: Schema.Int,
	detail: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
	correlationId: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
	violacoes: Schema.Array(InterAPIErrorViolacoes).pipe(Schema.optional),
});

export class InterAPIError extends Data.TaggedError("bancointer/InterAPIError")<typeof InterAPIErrorSchema.Type> {}
