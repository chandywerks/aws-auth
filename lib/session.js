const AWS = require('aws-sdk');
const inquirer = require('inquirer');
const { readFileSync } = require('fs');

const { profileCredentials } = require('./credentials');

const session = async (profile) => {
  const { RoleArn, credentials } = profileCredentials(profile);

  AWS.config.credentials = credentials;
  const sts = new AWS.STS();

  const session = await sts.assumeRole({
    RoleArn,
    RoleSessionName: profile,
    DurationSeconds: 3600,
  }).promise();

  return session;
}

const credentials = async (profile) => {
  const session = await session(profile);

  // Get credentials from authenticated session
  return sts.credentialsFrom(session);
};

const sessionMFA = async (profile) => {
  const { SerialNumber, RoleArn, sourceProfile, credentials } = profileCredentials(profile);

  AWS.config.credentials = credentials;
  const sts = new AWS.STS();

  const response = await inquirer.prompt({
    name: 'token',
    type: 'input',
    default: '',
    message: `Enter MFA code for ${RoleArn}:`,
  });

  const session = await sts.assumeRole({
    RoleArn,
    RoleSessionName: profile,
    DurationSeconds: 3600,
    SerialNumber,
    TokenCode: response.token,
  }).promise();

  return session;
};

const credentialsMFA = async (profile) => {
  const session = await sessionMFA(profile);

  // Get credentials from authenticated session
  const sts = new AWS.STS();
  return sts.credentialsFrom(session);
};

const sessionFromFile = (filePath) => {

  let session;

  try {
    session = JSON.parse(readFileSync(filePath));
  } catch(error) {
    throw error;
  }

  return session;
};

const credentialsFromFile = (filePath) => {
  let credentials;

  try {
    const session = sessionFromFile(filePath);
    const sts = new AWS.STS();

    credentials = sts.credentialsFrom(session);
  } catch(error) {
    throw error;
  }

  return credentials;
};

module.exports = {
  session,
  sessionMFA,
  sessionFromFile,
  credentials,
  credentialsMFA,
  credentialsFromFile,
};
