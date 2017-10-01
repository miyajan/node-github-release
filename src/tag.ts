export default class Tag {
    public readonly name: string;
    public readonly commitUrl: string;

    constructor(name: string, commitUrl: string) {
        this.name = name;
        this.commitUrl = commitUrl;
    }
}
