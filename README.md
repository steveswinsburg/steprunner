# 🏃‍♂️ StepRunner

**A viewer and runner for Cucumber/Gherkin feature files.**

StepRunner is a lightweight app for exploring and running `.feature` files manually. It helps QA engineers, product owners, and developers walk through Gherkin test scenarios step by step - Ideal for exploratory testing, documentation walkthroughs, or scenarios not ready for automation.

https://steprunner-abc1f.web.app/

[![Node.js CI](https://github.com/steveswinsburg/steprunner/actions/workflows/node.js.yml/badge.svg)](https://github.com/steveswinsburg/steprunner/actions/workflows/node.js.yml)
[![Deploy to Firebase Hosting on merge](https://github.com/steveswinsburg/steprunner/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/steveswinsburg/steprunner/actions/workflows/firebase-hosting-merge.yml)

## 🚀 Features

- 📂 Upload and parse `.feature` files
- 🧾 Display features, scenarios, and steps in a clean UI
- ✅ Manually mark steps as passed/failed/skipped one-by-one or in bulk
- 🗂 Group and filter by feature or tag
- 💾 Save and load sessions
- 🔍 Syntax-highlighted Gherkin viewer

## 📸 Screenshot

<img src="screenshot.png" width="600px" />

## 🧠 How It Works
1. Upload a .feature file or a zip of feature files
2. Browse scenarios and steps via the UI
3. Click to mark steps as passed, failed, or skipped
4. Export results

## 📦 Getting Started

### Prerequisites

- Node.js (>= 18)
- npm

## 🤝 Contributing

Contributions are welcome! If you have suggestions, ideas, or bug reports:
1. Fork the repo
2. Create a feature branch
3. Submit a pull request

## 🤓 Developers

```
npm install
npm start
```
Then open `http://localhost:3000` in your browser.
