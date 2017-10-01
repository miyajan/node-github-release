import Tag from './tag';
import Release from './release';

export default class Info {
    public readonly tags: Tag[];
    public readonly releases: Release[];

    constructor(tags: Tag[], releases: Release[]) {
        this.tags = tags;
        this.releases = releases;
    }
}
