'use strict';

class Release {
    constructor(id, tagName, name, description, draft, prerelease, createdAt, publishedAt) {
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

module.exports = Release;
