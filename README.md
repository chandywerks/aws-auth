# About

Provides aws-sdk authentication scripts and methods, with support for MFA and [named profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html), helpful for local development.

## Scripts

### assume-role

Assume a role and generate a temporary session.

```bash
npx assume-role --profile developer
```

The session is written to `.aws-session.json` and `.aws-session.sh` in the working directory.

In your app you can use the aws-sdk's credentailsFromFile() function to read the `.aws-session.json` file and return it as an STS credentials object for testing authenticated AWS SDK calls.

You can use `.aws-session.sh` to import the session as environment variables

```bash
$ source .aws-session.sh
```

This will set your session's temporary `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` environment variables.

## Exported Functions

### session(profile)

```js
const session = await session('developer');
sts.credentialsFrom(session);
```
The session object can be saved and used later to generate credentials at any time.

### sessionMFA(profile)

Generate a session with MFA for local development.

### sessionFromFile(filePath)

Read session from a JSON file. You can generate this session with the aws-session.js script.

### credentials()

Authenticate with the AWS SDK using a profile. Returns an [authenticated AWS.Credentials class](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Credentials.html) ready to be used with the aws-sdk.

```js
const AWS = require('aws-sdk');
const credentials = await credentials('developer');

// Pass the authenticated session to AWS
AWS.config.update({
  region: 'us-east-1',
  credentials,
});
```

### credentialsMFA()

Generate credentials with MFA for local development.

### credentialsFromFile(filePath)

New STS auth from a JSON session file. You can generate this session with the aws-session.js script.

This is useful for testing AWS calls from a local development environment after generating a session.

```javascript
const AWS = require('aws-sdk');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  const { credentialsFromFile } = require('aws-auth');

  const filePath = path.resolve(__dirname, '../../.aws-session.json');
  const credentials = credentialsFromFile(filePath);
  AWS.config.update({ credentials });
}
```

### sharedConfig()

Parses the profiles configured in ~/.aws/config and returns them as an object with profiles as the top level key.

### profileCredentials(profile)

Given a profile parses ~/.aws/config and generates credentials. This is used to generate a session.

## More Documentation

- [AWS SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
- [Configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
