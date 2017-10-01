export default class Release {
    public readonly id: string;
    public readonly tagName: string;
    public readonly name: string;
    public readonly description: string;
    public readonly draft: boolean;
    public readonly prerelease: boolean;
    public readonly createdAt: string;
    public readonly publishedAt: string;

    constructor(id: string, tagName: string, name: string, description: string, draft: boolean, prerelease: boolean, createdAt: string, publishedAt: string) {
        this.id = id;
        this.tagName = tagName;
        this.name = name;
        this.description = description;
        this.draft = draft;
        this.prerelease = prerelease;
        this.createdAt = createdAt;
        this.publishedAt = publishedAt;
    }
}
