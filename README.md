# AI-Powered Code Review Assistant

An AI agent that integrates with GitHub to review pull requests in real-time. It detects bugs, security vulnerabilities, code smells, and performance bottlenecks, then generates actionable review comments automatically.

# AI-Powered Code Review Assistant

An AI agent that integrates with GitHub to review pull requests in real-time. It detects bugs, security vulnerabilities, code smells, and performance bottlenecks, then generates actionable review comments automatically.

**Demo Repository:** [ai-code-review-agent](https://github.com/Lisha-S-BME/ai-code-review-agent)  
**Demo Video:** [Watch Demo](https://drive.google.com/file/d/1DRU-oEqWSqG_YcfxsukZ9RvTGUnlT1en/view?usp=drivesdk)
---

## Problem

Developers spend hours reviewing pull requests manually. Important bugs, security issues, and performance problems are often missed. Existing tools flag issues but don't prioritize them or question whether something is intentional.

---

## Features

- **Real-Time PR Review:** Automatically triggers when a pull request is opened or updated
- **Bug Detection:** Finds logic errors, null pointers, and runtime risks
- **Security Scanning:** Flags hardcoded secrets, exposed keys, and unsafe practices
- **Performance Analysis:** Detects inefficient loops, bottlenecks, and slow queries
- **Code Smell Detection:** Identifies poor naming, outdated practices, and messy code

---

## Unique Selling Proposition (USP)

Most code review tools just dump problems. This agent does two things differently:

1. **Severity Classification:** Every issue is ranked as Critical, Moderate, or Minor so developers know what to fix first
2. **Intent Checks:** When something looks like a bug but could be deliberate business logic, the agent asks for human confirmation instead of assuming it's wrong

---

## Scalability

This solution is scalable to developers and teams who want to use GitHub repositories for faster and safer collaboration. Install the GitHub App on any repository, and it works across all pull requests automatically.

---

## Societal Impact

Developers ship safer code faster. Bugs are caught before production. Security flaws are flagged early. Teams spend less time reviewing and more time building. This makes software safer for everyone who uses it.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **AI Model:** Groq (Llama 3.3 70B)
- **Integration:** GitHub API, GitHub Apps
- **Deployment:** Render

---

## Limitations

- Currently reviews one repository at a time; no cross-repository analysis
- Cannot verify if suggested fixes would pass existing tests
- May generate less accurate reviews for very large pull requests
- Requires manual installation of the GitHub App per repository

---

## Future Scope

- Support for GitLab and Bitbucket integration
- Cross-repository impact analysis across microservices
- Automated fix generation with test validation
- Custom rulebooks per team and project
- Dashboard for review analytics and team insights

---

## Project Structure
├── server.js          # Main application with webhook and review logic
├── package.json       # Dependencies and scripts
├── package-lock.json  # Dependency lock file
└── .gitignore         # Ignored files (node_modules, .env)

---

## Setup

1. Clone the repository
2. Run `npm install`
3. Set environment variables:
   - `GITHUB_APP_ID`
   - `GITHUB_PRIVATE_KEY`
   - `GROQ_API_KEY`
4. Run `node server.js`
5. Set up a GitHub App with webhook URL pointing to your server

---
