/** Nhà cung cấp (Groq/Azure) báo hết quota miễn phí (HTTP 429). */
export class ProviderQuotaError extends Error {
    constructor(provider: string) {
        super(`${provider} quota exceeded`);
        this.name = 'ProviderQuotaError';
    }
}
