import { BigDecimal, Schema } from "effect";

export namespace Currency {
	/**
	 * Formats a BigDecimal to a string representation with two decimal places.
	 * @param bigDecimal The BigDecimal value to format.
	 * @return A string representation of the BigDecimal value formatted to two decimal places.
	 */
	export const format = (bigDecimal: BigDecimal.BigDecimal) => {
		let intString = bigDecimal.value.toString();
		let scale = bigDecimal.scale;
		if (scale > 2) {
			// Arredonda pra cima somente se houver valor na 3ª casa decimal. Matemática básica de arredondamento
			bigDecimal = BigDecimal.sum(bigDecimal, BigDecimal.make(4n, 3));
			const rounded = BigDecimal.round(bigDecimal, { mode: "half-ceil", scale: 2 });
			scale = rounded.scale;
			intString = rounded.value.toString();
		}

		if (scale <= 2) {
			if (intString.length >= scale) {
				intString = intString.padEnd(intString.length + (2 - scale), "0");
			}
			intString = intString.padStart(3, "0");

			scale = 2;
		}

		return `${intString.slice(0, intString.length - scale)}.${intString.slice(intString.length - scale)}`;
	};

	/**
	 * Encodes a string to a BigDecimal.
	 * @param value The string value to encode.
	 * @returns A BigDecimal representation of the value.
	 */
	export const decode = BigDecimal.unsafeFromString;

	export const Currency = Schema.String.pipe(
		Schema.transform(Schema.BigDecimalFromSelf, {
			strict: true,
			decode: decode,
			encode: format,
		}),
	);
}
