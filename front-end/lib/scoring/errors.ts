/** Nhà cung cấp (Groq/Gemini/Azure) báo hết quota miễn phí (HTTP 429). */
export class ProviderQuotaError extends Error {
    constructor(provider: string) {
        super(`${provider} quota exceeded`);
        this.name = 'ProviderQuotaError';
    }
}
