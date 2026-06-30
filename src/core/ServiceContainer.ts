export class ServiceContainer 
{
    private readonly services = new Map<string, unknown>();

    public register<T>(key: string, service: T): void {
        this.services.set(key, service);
    }

    public get<T>(key: string): T {
        const service = this.services.get(key);
        if (!service) {
            throw new Error(`Service '${key}' not found.`);
        }

        return service as T;
    }
}