'use strict';

const GitHubApi = require('github');
const Tag = require('./lib/tag');
const Release = require('./lib/release');
const Info = require('./lib/info');

class GitHubRelease {
    constructor(token, host, pathPrefix) {
        this.github = new GitHubApi({
            host: host,
            pathPrefix: pathPrefix
        });
        this.github.authenticate({
            type: 'token',
            token: token
        });
    }

    info(user, repo) {
        const tags = this.github.repos.getTags({
            owner: user,
            repo: repo,
            per_page: 100 // TODO: support for pagination
        });
        const releases = this.github.repos.getReleases({
            owner: user,
            repo: repo,
            per_page: 100 // TODO: support for pagination
        });
        return Promise.all([tags, releases]).then(resps => {
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

    release(user, repo, tag, name, description, target, draft, preRelease) {
        const options = {
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
        return this.github.repos.createRelease(options);
    }

    edit(user, repo, tag, name, description, target, draft, preRelease) {
        return this.github.repos.getReleaseByTag({
            owner: user,
            repo: repo,
            tag: tag
        }).catch(err => {
            if (err.code === 404) {
                throw new Error(`Error: release not found (user: ${user}, repo: ${repo}, tag: ${tag})`);
            }
            throw err;
        }).then(res => {
            const id = res.data.id;
            const options = {
                owner: user,
                repo: repo,
                id: id,
                tag_name: tag
            };
            if (name !== undefined) {
                options.name = name;
            }
            if (target !== undefined) {
                options.target = target;
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
            return this.github.repos.editRelease(options);
        });
    }

    upload(user, repo, tag, name, label, file) {
        return this.github.repos.getReleaseByTag({
            owner: user,
            repo: repo,
            tag: tag
        }).catch(err => {
            if (err.code === 404) {
                throw new Error(`Error: release not found (user: ${user}, repo: ${repo}, tag: ${tag})`);
            }
            throw err;
        }).then(res => {
            const id = res.data.id;
            const options = {
                owner: user,
                repo: repo,
                id: id,
                filePath: file,
                name: name
            };
            if (label !== undefined) {
                options.label = label;
            }
            return this.github.repos.uploadAsset(options);
        });
    }

    destroy(user, repo, tag) {
        return this.github.repos.getReleaseByTag({
            owner: user,
            repo: repo,
            tag: tag
        }).catch(err => {
            if (err.code === 404) {
                throw new Error(`Error: release not found (user: ${user}, repo: ${repo}, tag: ${tag})`);
            }
            throw err;
        }).then(res => {
            const id = res.data.id;
            const options = {
                owner: user,
                repo: repo,
                id: id
            };
            return this.github.repos.deleteRelease(options);
        });
    }
}

module.exports = GitHubRelease;
