import { complain, inform } from '../actions/logging';
import { defaults } from '../config';

import path = require('path');
import os = require('os');

import { ensureFileIsPresent, filenameOf } from '../actions/files';
import { executeWith } from '../actions/process';
import { adjustLogging } from '../logger';
const javaHome = require('java-home'); // tslint:disable-line:no-var-requires

export const command = 'run';

export const desc = 'Aggregates the JSON reports generated by Serenity BDD and produces one in HTML';

export const builder = {
    cacheDir:        {
        default:  defaults.cacheDir,
        describe: 'An absolute or relative path to where the Serenity BDD CLI jar file should be stored',
    },
    destination:     {
        default:  defaults.reportDir,
        describe: 'Directory to contain the generated Serenity BDD report',
    },
    features:        {
        default:  defaults.featuresDir,
        describe: 'Source directory containing the Cucumber.js feature files',
    },
    source:          {
        default:  defaults.sourceDir,
        describe: 'Source directory containing the Serenity BDD JSON output files',
    },
    issueTrackerUrl: {
        describe: 'Base URL for issue trackers other than JIRA',
    },
    jiraProject:     {
        describe: 'JIRA project identifier',
    },
    jiraUrl:         {
        describe: 'Base URL of your JIRA server',
    },
    project:         {
        describe: 'Project name to appear in the Serenity reports (defaults to the project directory name)',
    },
};

export const handler = (argv: any) =>
    adjustLogging(argv.verbose)
        .then(findJava)
        .then(inform('Using Java at: %s'))
        .catch(complain('Did you set JAVA_HOME correctly? %s'))
        .then(executeWith(flatten([ '-jar', cliJarIn(argv.cacheDir), argumentsFrom(argv) ])))
        .catch(complain('%s'))
        .then(inform('All done!'));

// --

export const javaFor = (os: string) => (os === 'Windows_NT') ? 'java.exe' : 'java';

const findJava = () => javaHome.getPath().then(javaDir => ensureFileIsPresent(path.resolve(javaDir, 'bin', javaFor(os.type()))));

const cliJarIn = (cacheDir: string) => path.resolve(cacheDir, filenameOf(defaults.artifact));

const argumentsFrom = (argv: string) => {
    const validArguments = [
              'destination',
              'features',
              'issueTrackerUrl',
              'jiraProject',
              'jiraUrl',
              'project',
              'source',
          ],
          onlyThoseThatArePresent  = (arg) => !! argv[ arg ],
          toCLIParams = (arg) => [ `--${ arg }`, argv[ arg ] ];

    return validArguments.filter(onlyThoseThatArePresent).map(toCLIParams);
};

const flatten = (list: any[]) => list.reduce(
    (acc, current) => (Array.isArray(current)
        ? acc.push(...flatten(current))
        : acc.push(current), acc), []);
