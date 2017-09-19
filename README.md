# node-github-release

CLI to create and edit releases on Github (and upload artifacts)

## Acknowledgement

This tool is greatly inspired by [aktau's go implementation](https://github.com/aktau/github-release). Thank you so, so much!

## Requirement

* Node >= 6

## Usage

```bash
# set your token
export GITHUB_TOKEN=...

# (optional) you can point to a different GitHub host (for GitHub Enterprise)
# export GITHUB_HOST=github.company.com
# export GITHUB_API_PATH_PREFIX=/api/v3

# help
$ github-release --help

# make your tag and upload
$ git tag ... && git push --tags

# check the current tags and existing releases of the repo
$ github-release info -u miyajan -r node-github-release
tags:
- 0.1.0 (commit: https://api.github.com/repos/miyajan/node-github-release/commits/...)
releases:
- 0.1.0, name: '...', description: '...', id: ..., tagged: ... , published: ... , draft: ✔, prerelease: ✗
  - artifact: ...

# create a formal release
$ github-release release \
    --user miyajan \
    --repo node-github-release \
    --tag 0.1.0 \
    --name "..." \
    --description "..." \
    --pre-release
  
# you've made a mistake, but you can edit the release without
# having to delete it first (this also means you can edit without having
# to upload your files again)
$ github-release edit \
    --user miyajan \
    --repo node-github-release \
    --tag 0.1.0 \
    --name "..." \
    --description "..."

# upload a file
$ github-release upload \
    --user miyajan \
    --repo node-github-release \
    --tag 0.1.0 \
    --name "..." \
    --file ...

# upload other files...
$ github-release upload ...

# you're not happy with it, so delete it
$ github-release delete \
    --user miyajan \
    --repo node-github-release \
    --tag 0.1.0
```

## Install

```bash
$ npm install -g node-github-release
```

## License

[MIT](https://github.com/miyajan/node-github-release/blob/master/LICENSE)

## Author

[miyajan](https://github.com/miyajan): Jumpei Miyata miyajan777@gmail.com
