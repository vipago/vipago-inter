// biome-ignore-all lint/suspicious/noExplicitAny: This is a type definition file, so using `any` is acceptable here.
//
// Master gambiarra do Tiago para especificar as dependencias das fields de uma struct do effect schema
import type { Schema } from "effect";

export type PropertySignatureAnyWithContext<Requirements, Key extends PropertyKey = PropertyKey> = Schema.PropertySignature<
	Schema.PropertySignature.Token,
	any,
	Key,
	Schema.PropertySignature.Token,
	any,
	boolean,
	Requirements
>;
export type FieldWithContext<Requirements> = Schema.Schema<any, any, Requirements> | PropertySignatureAnyWithContext<Requirements>;

export type FieldsWithContext<Requirements> = { readonly [x: PropertyKey]: FieldWithContext<Requirements> };
