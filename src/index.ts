import * as Octokit from '@octokit/rest';
import Tag from './tag';
import Release from './release';
import Info from './info';

export default class GitHubRelease {
    private readonly octokit: Octokit;

    constructor(token: string, host?: string, pathPrefix?: string) {
        this.octokit = new Octokit({
            host: host,
            pathPrefix: pathPrefix
        });
        this.octokit.authenticate({
            type: 'token',
            token: token
        });
    }

    public info(user: string, repo: string): Promise<Info> {
        const tags = this.octokit.repos.getTags({
            owner: user,
            repo: repo,
            per_page: 100 // TODO: support for pagination
        });
        const releases = this.octokit.repos.getReleases({
            owner: user,
            repo: repo,
            per_page: 100 // TODO: support for pagination
        });
        return Promise.all([tags, releases]).then((resps: InfoResponse) => {
            const tagsResp = resps[0];
            const releasesResp = resps[1];
            const tags = tagsResp.data.map(obj => {
                return new Tag(obj.name, obj.commit.url);
            });
            const releases = releasesResp.data.map(obj => {
                return new Release(obj.id, obj.tag_name, obj.name, obj.body, obj.draft, obj.prerelease, obj.created_at, obj.published_at);
            });
            return new Info(tags, releases);
        });
    }

    public release(user: string, repo: string, tag: string, name?: string, description?: string, target?: string, draft?: boolean, preRelease?: boolean): Promise<void> {
        const options: Octokit.ReposCreateReleaseParams = {
            owner: user,
            repo: repo,
            tag_name: tag
        };
        if (name !== undefined) {
            options.name = name;
        }
        if (target !== undefined) {
            options.target_commitish = target;
        }
        if (draft !== undefined) {
            options.draft = draft;
        }
        if (preRelease !== undefined) {
            options.prerelease = preRelease;
        }
        if (description !== undefined) {
            options.body = description;
        }
        return this.octokit.repos.createRelease(options);
    }

    public edit(user: string, repo: string, tag: string, name?: string, description?: string, target?: string, draft?: boolean, preRelease?: boolean): Promise<void> {
        return this.octokit.repos.getReleaseByTag({
            owner: user,
            repo: repo,
            tag: tag
        }).catch(err => {
            if (err.code === 404) {
                throw new Error(`Error: release not found (user: ${user}, repo: ${repo}, tag: ${tag})`);
            }
            throw err;
        }).then((res: ReleaseResponse) => {
            const id = res.data.id;
            const options: Octokit.ReposEditReleaseParams = {
                owner: user,
                repo: repo,
                id: id,
                tag_name: tag
            };
            if (name !== undefined) {
                options.name = name;
            }
            if (target !== undefined) {
                options.target_commitish = target;
            }
            if (draft !== undefined) {
                options.draft = draft;
            }
            if (preRelease !== undefined) {
                options.prerelease = preRelease;
            }
            if (description !== undefined) {
                options.body = description;
            }
            return this.octokit.repos.editRelease(options);
        });
    }

    public upload(user: string, repo: string, tag: string, name: string, file: string, label?: string): Promise<void> {
        return this.octokit.repos.getReleaseByTag({
            owner: user,
            repo: repo,
            tag: tag
        }).catch(err => {
            if (err.code === 404) {
                throw new Error(`Error: release not found (user: ${user}, repo: ${repo}, tag: ${tag})`);
            }
            throw err;
        }).then((res: ReleaseResponse) => {
            const id = res.data.id;
            const options: Octokit.ReposUploadAssetParams = {
                owner: user,
                repo: repo,
                id: id,
                filePath: file,
                name: name
            };
            if (label !== undefined) {
                options.label = label;
            }
            return this.octokit.repos.uploadAsset(options);
        });
    }

    public destroy(user: string, repo: string, tag: string): Promise<void> {
        return this.octokit.repos.getReleaseByTag({
            owner: user,
            repo: repo,
            tag: tag
        }).catch(err => {
            if (err.code === 404) {
                throw new Error(`Error: release not found (user: ${user}, repo: ${repo}, tag: ${tag})`);
            }
            throw err;
        }).then((res: ReleaseResponse) => {
            const id = res.data.id;
            const options: Octokit.ReposDeleteReleaseParams = {
                owner: user,
                repo: repo,
                id: id
            };
            return this.octokit.repos.deleteRelease(options);
        });
    }
}

interface InfoResponse {
    0: TagsResponse
    1: ReleasesResponse
}

interface TagsResponse {
    data: TagObject[]
}

interface TagObject {
    name: string
    commit: CommitObject
}

interface CommitObject {
    url: string
}

interface ReleasesResponse {
    data: ReleaseObject[]
}

interface ReleaseObject {
    id: string
    tag_name: string
    name: string
    body: string
    draft: boolean
    prerelease: boolean
    created_at: string
    published_at: string
}

interface ReleaseResponse {
    data: ReleaseObject
}
