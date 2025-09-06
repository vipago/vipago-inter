import { describe, expect, test } from "bun:test";
import { Currency } from "../src/models/global";

const currencies: [string, string][] = [
	["123.456789", "123.46"],
	["99.999", "100.00"],
	["0.001", "0.01"],
	["42.125", "42.13"],
	["1000.9999", "1001.00"],
	["5.555", "5.56"],
	["10.004", "10.01"],
	["999.995", "1000.00"],
	["0.5", "0.50"],
	["123.45", "123.45"],
	["7.0", "7.00"],
	["0.015", "0.02"],
	["100.875", "100.88"],
	["99.891", "99.90"],
	["99.991", "100.00"],
	["99.8909", "99.89"],
	["99.821", "99.83"],
];

describe("Testes para o parser de dinheiro", () => {
	test.each(currencies)("%s deve virar %s", (value: string, expected: string) => {
		const decoded = Currency.decode(value);
		console.log("Decoded: ", decoded);
		expect(Currency.format(decoded)).toBe(expected);
	});
});
