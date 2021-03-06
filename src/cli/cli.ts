import { build, GluegunToolbox } from 'gluegun';
import add from './commands/add';

/**
 * Create the cli and kick it off
 */
export async function run(argv?: string[] | string): Promise<GluegunToolbox> {
  // create a CLI runtime
  const cli = build('pkgdrop')
    .src(__dirname)
    .version()
    .exclude([
      'semver',
      'http',
      'template',
      'patching'
    ])
    .defaultCommand({
      description: 'Adds a new package',
      run: add.run,
      hidden: true
    })
    .create();

  return cli.run(argv);
}
