import type { Redacted } from "effect";
import type { InterOAuthScopeType } from "./oauth";

export interface InterOptions {
	readonly certificate: string | Buffer;
	readonly priv_key: string | Buffer;
	readonly client_id: string;
	readonly client_secret: string;
	readonly scope: InterOAuthScopeType | InterOAuthScopeType[];
	readonly sandbox?: boolean;
	readonly base_url?: string;
}

export interface InterConfig {
	readonly certificate: Redacted.Redacted<Buffer>;
	readonly privKey: Redacted.Redacted<Buffer>;
	readonly client_id: string;
	readonly client_secret: Redacted.Redacted<string>;
	readonly scope: InterOAuthScopeType | InterOAuthScopeType[];
	readonly base_url: string;
	readonly sandbox: boolean;
}
