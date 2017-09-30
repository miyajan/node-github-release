'use strict';

const commander = require('commander');
const GitHubRelease = require('../index');
const pkg = require('../package.json');
const git = require('simple-git');

class CommandLine {
    /**
     * Constructor
     */
    constructor(process) {
        this._process = process;
        this._program = new commander.Command();
    }

    /**
     * Execute a command
     */
    execute() {
        this._program
            .version(pkg.version, '-v, --version');

        const info = this._program
            .command('info')
            .option('-u, --user <user>', 'GitHub repo user or organisation (default: from git config --get remote.origin.url, required if not in git directory)')
            .option('-r, --repo <repo>', 'GitHub repo (default: from git config --get remote.origin.url, required if not in git directory)')
            .description('List tags and releases')
            .action(options => {
                this._getUserAndRepoFromGitConfig().then(result => {
                    const ghRelease = this._setupGitHubRelease();
                    const user = result ? result.user : options.user;
                    const repo = result ? result.repo : options.repo;
                    if (user === undefined || repo === undefined) {
                        info.outputHelp();
                        this._process.exit(1);
                    }

                    ghRelease.info(user, repo).then(info => {
                        this._process.stdout.write('tags:\n');
                        info.tags.forEach(tag => {
                            this._process.stdout.write(`${tag.name} (commit: ${tag.commitUrl})\n`);
                        });
                        this._process.stdout.write('releases:\n');
                        info.releases.forEach(release => {
                            this._process.stdout.write(`${release.tagName}, name: '${release.name}', description: '${release.description}', id: ${release.id}, tagged: ${this._formatDate(release.createdAt)}, published: ${this._formatDate(release.publishedAt)}, draft: ${this._mark(release.draft)}, prerelease: ${this._mark(release.prerelease)}\n`);
                        });
                    }).catch(err => {
                        this._process.stderr.write(err.message + '\n');
                        this._process.exit(1);
                    });
                });
            });

        const release = this._program
            .command('release')
            .option('-u, --user <user>', 'GitHub repo user or organisation (Required)')
            .option('-r, --repo <repo>', 'GitHub repo (Required)')
            .option('-t, --tag <tag>', 'Git tag to create a release from (Required)')
            .option('-n, --name <name>', 'Name of the release (defaults to tag)')
            .option('-d, --description <description>', 'Release description (defaults to tag)')
            .option('-c, --target <target>', 'Commit SHA or branch to create release of. Unused if the Git tag already exists. (defaults to the repository default branch)')
            .option('--draft', 'The release is a draft')
            .option('-p, --pre-release', 'The release is a pre-release')
            .description('Release')
            .action(options => {
                this._getUserAndRepoFromGitConfig().then(result => {
                    const ghRelease = this._setupGitHubRelease();
                    const user = result ? result.user : options.user;
                    const repo = result ? result.repo : options.repo;
                    const tag = options.tag;
                    const name = options.name;
                    const description = options.description;
                    const target = options.target;
                    const draft = options.draft;
                    const preRelease = options.preRelease;

                    if (user === undefined || repo === undefined || tag === undefined) {
                        release.outputHelp();
                        this._process.exit(1);
                    }

                    ghRelease.release(user, repo, tag, name, description, target, draft, preRelease).catch(err => {
                        this._process.stderr.write(err.message + '\n');
                        this._process.exit(1);
                    });
                });
            });

        const edit = this._program
            .command('edit')
            .option('-u, --user <user>', 'GitHub repo user or organisation (Required)')
            .option('-r, --repo <repo>', 'GitHub repo (Required)')
            .option('-t, --tag <tag>', 'Git tag to edit the release of (Required)')
            .option('-n, --name <name>', 'New name of the release (defaults to tag)')
            .option('-d, --description <description', 'New release description (defaults to tag)')
            .option('-c, --target <target>', 'Commit SHA or branch to create release of. Unused if the Git tag already exists. (defaults to the repository default branch)')
            .option('--draft', 'The release is a draft')
            .option('-p, --pre-release', 'The release is a pre-release')
            .description('Edit a release')
            .action(options => {
                this._getUserAndRepoFromGitConfig().then(result => {
                    const ghRelease = this._setupGitHubRelease();
                    const user = result ? result.user : options.user;
                    const repo = result ? result.repo : options.repo;
                    const tag = options.tag;
                    const name = options.name;
                    const description = options.description;
                    const target = options.target;
                    const draft = options.draft;
                    const preRelease = options.preRelease;

                    if (user === undefined || repo === undefined || tag === undefined) {
                        edit.outputHelp();
                        this._process.exit(1);
                    }

                    ghRelease.edit(user, repo, tag, name, description, target, draft, preRelease).catch(err => {
                        this._process.stderr.write(err.message + '\n');
                        this._process.exit(1);
                    });
                });
            });

        const upload = this._program.command('upload')
            .option('-u, --user <user>', 'GitHub repo user or organisation (Required)')
            .option('-r, --repo <repo>', 'GitHub repo (Required)')
            .option('-t, --tag <tag>', 'Git tag to upload (Required)')
            .option('-n, --name <name>', 'Name of the file (Required)')
            .option('-l, --label <label>', 'Label of the file')
            .option('-f, --file <file>', 'File to upload (Required)')
            .description('Upload a file')
            .action(options => {
                this._getUserAndRepoFromGitConfig().then(result => {
                    const ghRelease = this._setupGitHubRelease();
                    const user = result ? result.user : options.user;
                    const repo = result ? result.repo : options.repo;
                    const tag = options.tag;
                    const name = options.name;
                    const label = options.label;
                    const file = options.file;

                    if (user === undefined || repo === undefined || tag === undefined || name === undefined || file === undefined) {
                        upload.outputHelp();
                        this._process.exit(1);
                    }

                    ghRelease.upload(user, repo, tag, name, label, file).catch(err => {
                        this._process.stderr.write(err.message + '\n');
                        this._process.exit(1);
                    });
                });
            });

        const del = this._program.command('delete')
            .option('-u, --user <user>', 'GitHub repo user or organisation (Required)')
            .option('-r, --repo <repo>', 'GitHub repo (Required)')
            .option('-t, --tag <tag>', 'Git tag of release to delete (Required)')
            .description('Delete a release')
            .action(options => {
                this._getUserAndRepoFromGitConfig().then(result => {
                    const ghRelease = this._setupGitHubRelease();
                    const user = result ? result.user : options.user;
                    const repo = result ? result.repo : options.repo;
                    const tag = options.tag;

                    if (user === undefined || repo === undefined || tag === undefined) {
                        del.outputHelp();
                        this._process.exit(1);
                    }

                    ghRelease.destroy(user, repo, tag).catch(err => {
                        this._process.stderr.write(err.message + '\n');
                        this._process.exit(1);
                    });
                });
            });



        this._program.parse(this._process.argv);
        if (this._program.args.length === 0 || !(this._program.args[0] instanceof commander.Command)) {
            // no sub-commands
            this._program.outputHelp();
            this._process.exit(1);
        }
    }

    _setupGitHubRelease() {
        const token = this._process.env.GITHUB_TOKEN;
        const host = this._process.env.GITHUB_HOST;
        const pathPrefix = this._process.env.GITHUB_API_PATH_PREFIX;

        if (!token) {
            this._process.stderr.write('$GITHUB_TOKEN must be set\n');
            this._process.exit(1);
        }

        return new GitHubRelease(token, host, pathPrefix);
    }

    _formatDate(datetime) {
        const date = new Date(datetime);
        const YY = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const MM = month < 10 ? '0' + month : '' + month;
        const day = date.getUTCDate();
        const DD = day < 10 ? '0' + day : '' + day;
        const hour = date.getUTCHours();
        const hh = hour < 10 ? '0' + hour : '' + hour;
        const minute = date.getUTCMinutes();
        const mm = minute < 10 ? '0' + minute : '' + minute;
        return `${DD}/${MM}/${YY} at ${hh}:${mm}`;
    }

    _mark(ok) {
        return ok ? '✔' : '✗';
    }

    _getUserAndRepoFromGitConfig() {
        return new Promise((resolve, reject) => {
            git().raw(['config', '--get', 'remote.origin.url'], (err, result) => {
                if (err || !result) {
                    resolve(null);
                    return;
                }
                const tokens = result.split('/').reverse();
                resolve({
                    user: tokens[1],
                    repo: tokens[0].split('.')[0]
                });
            });
        });
    }
}

module.exports = CommandLine;
