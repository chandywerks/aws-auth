#!/usr/bin/env node

const { writeFileSync } = require('fs');
const { sessionMFA } = require('../lib/index');

const argv = require('yargs')
  .option('profile', {
    describe: 'AWS profile configured in ~/.aws/config',
    type: 'string',
    demandOption: true,
  })
  .option('file', {
    describe: 'Session file output name (excluding the extension)',
    type: 'string',
    default: '.aws-session',
  })
  .epilogue('Generates a temporary session for an assumed role and writes it to a JSON file for use in aws-sdk apps and a sh file for importing as environment variables.')
  .help()
  .argv;

const { profile, file, } = argv;

(async () => {
  try {
    const session = await sessionMFA(profile);
    console.log('Session expires %s', session.Credentials.Expiration);

    // Write session to JSON file
    writeFileSync(`${file}.json`, JSON.stringify(session));

    // Write session for env export
    const { AccessKeyId, SecretAccessKey, SessionToken } = session.Credentials;

    const exports = `#!/bin/sh
export AWS_ACCESS_KEY_ID='${AccessKeyId}'
export AWS_SECRET_ACCESS_KEY='${SecretAccessKey}'
export AWS_SESSION_TOKEN='${SessionToken}'
`;

    writeFileSync(`${file}.sh`, exports);
  } catch (error) {
    console.log('Unable to assume role: ', error);
  }
})();
