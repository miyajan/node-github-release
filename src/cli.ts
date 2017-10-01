import GitHubRelease from './index';
import * as commander from 'commander';

const pkg = require('../package.json');
const git = require('simple-git'); // TODO: bundle type

export default class CommandLine {
    private readonly process: NodeJS.Process;
    private readonly program: commander.CommanderStatic; // TODO: fix @types/commander to export commander.Command

    /**
     * Constructor
     */
    constructor(process: NodeJS.Process) {
        this.process = process;
        this.program = <commander.CommanderStatic> new commander.Command(); // TODO: fix @types/commander to export commander.Command
    }

    /**
     * Execute a command
     */
    public execute() {
        this.program
            .version(pkg.version, '-v, --version');

        const info = this.program
            .command('info')
            .option('-u, --user <user>', 'GitHub repo user or organisation (default: from git config --get remote.origin.url, required if not in git directory)')
            .option('-r, --repo <repo>', 'GitHub repo (default: from git config --get remote.origin.url, required if not in git directory)')
            .description('List tags and releases')
            .action(options => {
                this.getUserAndRepoFromGitConfig().then(result => {
                    const ghRelease = this.setupGitHubRelease();
                    const user = result ? result.user : options.user;
                    const repo = result ? result.repo : options.repo;
                    if (user === undefined || repo === undefined) {
                        info.outputHelp();
                        this.process.exit(1);
                    }

                    ghRelease.info(user, repo).then(info => {
                        this.process.stdout.write('tags:\n');
                        info.tags.forEach(tag => {
                            this.process.stdout.write(`${tag.name} (commit: ${tag.commitUrl})\n`);
                        });
                        this.process.stdout.write('releases:\n');
                        info.releases.forEach(release => {
                            this.process.stdout.write(`${release.tagName}, name: '${release.name}', description: '${release.description}', id: ${release.id}, tagged: ${this.formatDate(release.createdAt)}, published: ${this.formatDate(release.publishedAt)}, draft: ${this.mark(release.draft)}, prerelease: ${this.mark(release.prerelease)}\n`);
                        });
                    }).catch(err => {
                        this.process.stderr.write(err.message + '\n');
                        this.process.exit(1);
                    });
                });
            });

        const release = this.program
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
                this.getUserAndRepoFromGitConfig().then(result => {
                    const ghRelease = this.setupGitHubRelease();
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
                        this.process.exit(1);
                    }

                    ghRelease.release(user, repo, tag, name, description, target, draft, preRelease).catch(err => {
                        this.process.stderr.write(err.message + '\n');
                        this.process.exit(1);
                    });
                });
            });

        const edit = this.program
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
                this.getUserAndRepoFromGitConfig().then(result => {
                    const ghRelease = this.setupGitHubRelease();
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
                        this.process.exit(1);
                    }

                    ghRelease.edit(user, repo, tag, name, description, target, draft, preRelease).catch(err => {
                        this.process.stderr.write(err.message + '\n');
                        this.process.exit(1);
                    });
                });
            });

        const upload = this.program.command('upload')
            .option('-u, --user <user>', 'GitHub repo user or organisation (Required)')
            .option('-r, --repo <repo>', 'GitHub repo (Required)')
            .option('-t, --tag <tag>', 'Git tag to upload (Required)')
            .option('-n, --name <name>', 'Name of the file (Required)')
            .option('-l, --label <label>', 'Label of the file')
            .option('-f, --file <file>', 'File to upload (Required)')
            .description('Upload a file')
            .action(options => {
                this.getUserAndRepoFromGitConfig().then(result => {
                    const ghRelease = this.setupGitHubRelease();
                    const user = result ? result.user : options.user;
                    const repo = result ? result.repo : options.repo;
                    const tag = options.tag;
                    const name = options.name;
                    const label = options.label;
                    const file = options.file;

                    if (user === undefined || repo === undefined || tag === undefined || name === undefined || file === undefined) {
                        upload.outputHelp();
                        this.process.exit(1);
                    }

                    ghRelease.upload(user, repo, tag, name, file, label).catch(err => {
                        this.process.stderr.write(err.message + '\n');
                        this.process.exit(1);
                    });
                });
            });

        const del = this.program.command('delete')
            .option('-u, --user <user>', 'GitHub repo user or organisation (Required)')
            .option('-r, --repo <repo>', 'GitHub repo (Required)')
            .option('-t, --tag <tag>', 'Git tag of release to delete (Required)')
            .description('Delete a release')
            .action(options => {
                this.getUserAndRepoFromGitConfig().then(result => {
                    const ghRelease = this.setupGitHubRelease();
                    const user = result ? result.user : options.user;
                    const repo = result ? result.repo : options.repo;
                    const tag = options.tag;

                    if (user === undefined || repo === undefined || tag === undefined) {
                        del.outputHelp();
                        this.process.exit(1);
                    }

                    ghRelease.destroy(user, repo, tag).catch(err => {
                        this.process.stderr.write(err.message + '\n');
                        this.process.exit(1);
                    });
                });
            });


        this.program.parse(this.process.argv);
        if (this.program.args.length === 0 || !((<any[]>this.program.args)[0] instanceof commander.Command)) {
            // no sub-commands
            this.program.outputHelp();
            this.process.exit(1);
        }
    }

    private setupGitHubRelease(): GitHubRelease {
        const token = this.process.env.GITHUB_TOKEN;
        const host = this.process.env.GITHUB_HOST;
        const pathPrefix = this.process.env.GITHUB_API_PATH_PREFIX;

        if (!token) {
            this.process.stderr.write('$GITHUB_TOKEN must be set\n');
            this.process.exit(1);
        }

        return new GitHubRelease(<string> token, host, pathPrefix);
    }

    private formatDate(datetime: string): string {
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

    private mark(ok: boolean): string {
        return ok ? '✔' : '✗';
    }

    private getUserAndRepoFromGitConfig(): Promise<null | ConfigObject> {
        return new Promise(resolve => {
            git().raw(['config', '--get', 'remote.origin.url'], (err: Error | undefined, result: string) => {
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

interface ConfigObject {
    user: string
    repo: string
}
