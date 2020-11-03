const fs = require('fs');
const AWS = require('aws-sdk');

const profileCredentials = (profile) => {
  const config = sharedConfig();

  if(!config[profile]) throw new Error(`Profile ${profile} is not configured in ~/.aws/config`);

  const { mfa_serial: SerialNumber, role_arn: RoleArn, source_profile: sourceProfile = 'default' } = config[profile];

  const credentials = new AWS.SharedIniFileCredentials({ profile: sourceProfile });

  return {
    SerialNumber,
    RoleArn,
    sourceProfile,
    credentials
  };
};

const sharedConfig = () => {
  const config = fs.readFileSync(`${process.env.HOME}/.aws/config`, { encoding: 'utf-8' });

  const profiles = config.split(/\[profile\s/g);
  const profile = {};

  profiles.forEach((profileConfig) => {
    if(!profileConfig) return;

    const lines = profileConfig.split(/\n/);
    profileName = lines[0].match(/(\w+)\]/);
    profile[profileName[1]] = {};

    lines.forEach((line) => {
      const keyValPair = line.match(/^(\w+)\s*=\s*(.+)$/);
      if(!keyValPair) return;
      profile[profileName[1]][keyValPair[1]] = keyValPair[2];
    });
  });

  return profile;
};

module.exports = {
  profileCredentials,
  sharedConfig,
};
