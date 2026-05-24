require('dotenv').config();
const express = require('express');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const APP_ID = process.env.GITHUB_APP_ID;
if (!process.env.GITHUB_PRIVATE_KEY) {
  console.error('GITHUB_PRIVATE_KEY is not set!');
  process.exit(1);
}
const PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n');

app.post('/webhook', async (req, res) => {
  console.log('Webhook received!');
  
  const event = req.headers['x-github-event'];
  const action = req.body.action;
  
  console.log('Event:', event);
  console.log('Action:', action);
  
  if (event === 'pull_request' && (action === 'opened' || action === 'synchronize')) {
    
    const prNumber = req.body.pull_request.number;
    const repoName = req.body.repository.name;
    const owner = req.body.repository.owner.login;
    
    console.log(`PR #${prNumber} in ${repoName} by ${owner}`);
    
    try {
      const installationId = req.body.installation.id;
      console.log('Getting installation token...');
      const token = await getInstallationToken(installationId);
      
      console.log('Fetching PR diff...');
      const diff = await getPullRequestDiff(token, owner, repoName, prNumber);
      
      console.log('Analyzing code with Groq...');
      const reviewResult = await analyzeCodeWithGroq(diff);
      
      console.log('Posting review...');
      await postReviewComment(token, owner, repoName, prNumber, reviewResult);
      
      console.log('Review posted successfully!');
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
  res.status(200).send('OK');
});

async function getInstallationToken(installationId) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 120,
    exp: now + 300,
    iss: APP_ID,
  };
  const generatedJwt = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
  
  const octokit = new Octokit({ auth: generatedJwt });
  const response = await octokit.apps.createInstallationAccessToken({
    installation_id: installationId,
  });
  return response.data.token;
}

async function getPullRequestDiff(token, owner, repo, prNumber) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3.diff',
    },
  });
  return response.data;
}

async function analyzeCodeWithGroq(diff) {
  const prompt = `You are an expert code reviewer with clinical diagnostic precision. Analyze the following pull request code diff.

Perform these tasks:
1. Find all potential bugs, security vulnerabilities, code smells, and performance issues.
2. Classify each finding as: CRITICAL (will break production, fix immediately), MODERATE (performance or maintainability issue, fix soon), or MINOR (style improvement, fix when convenient).
3. For each finding, explain what the issue is, why it matters, and suggest a fix.
4. IMPORTANT: If any finding looks like it could be intentional business logic rather than an actual bug, flag it with "INTENT CHECK: This might be deliberate. Please confirm."

Format your response exactly like this:

## Code Review Report

### CRITICAL
- Issue: [what is wrong]
- Fix: [how to fix it]

### MODERATE
- Issue: [what is wrong]
- Fix: [how to fix it]

### MINOR
- Issue: [what is wrong]
- Fix: [how to fix it]

### INTENT CHECKS
- Issue: [what looks suspicious]
- Question: [ask if this is intentional]

Here is the code diff:
${diff}`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}

async function postReviewComment(token, owner, repo, prNumber, reviewBody) {
  const octokit = new Octokit({ auth: token });
  
  await octokit.pulls.createReview({
    owner: owner,
    repo: repo,
    pull_number: prNumber,
    body: reviewBody,
    event: 'COMMENT',
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});