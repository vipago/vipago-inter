import { Data, Schema } from "effect";

export const InterAPIErrorViolacoes = Schema.Struct({
	razao: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
	propriedade: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
	valor: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
});

export const InterAPIErrorSchema = Schema.Struct({
	type: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
	title: Schema.String,
	status: Schema.Int.pipe(Schema.optionalWith({ nullable: true })),
	detail: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
	correlationId: Schema.String.pipe(Schema.optionalWith({ nullable: true })),
	violacoes: Schema.Array(InterAPIErrorViolacoes).pipe(Schema.optional),
});

export class InterAPIError extends Data.TaggedError("bancointer/InterAPIError")<typeof InterAPIErrorSchema.Type> {
	override toString(): string {
		return `${this.title}${this.type ? ` (${this.type})` : ""}\n${this.detail}\n\nViolations: ${this.violacoes?.map(v => `${v.propriedade}: ${v.valor} (${v.razao})`).join(", ") || "None"}`;
	}
}
