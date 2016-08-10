import * as path from 'path';

import { removeDirectory } from '../actions/files';
import { complain, inform } from '../actions/logging';
import { defaults } from '../config';

export const command = 'remove';

export const desc = 'Removes the cache directory containing the Serenity BDD Reporter jar';

export const builder = {
    cacheDir: {
        default:  defaults.cacheDir,
        describe: 'An absolute or relative path to where the Serenity BDD Reporter jar should be stored',
    },
};

export const handler = (argv: any) =>
    removeDirectory(path.resolve(process.cwd(), argv.cacheDir))
        .catch(complain('Couldn\'t remove the cache directory: %s'))
        .then(inform('Removed cache directory at %s'));