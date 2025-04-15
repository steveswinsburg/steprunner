export default function parseFeature(text) {
    const lines = text.split('\n');
    const title = lines.find(l => l.startsWith('Feature:'))?.replace('Feature:', '').trim() || 'Untitled Feature';
  
    const scenarios = [];
    let currentScenario = null;
  
    for (let line of lines) {
      line = line.trim();
  
      if (line.startsWith('Scenario:')) {
        if (currentScenario) {
          scenarios.push(currentScenario);
        }
        currentScenario = {
          title: line.replace('Scenario:', '').trim(),
          steps: []
        };
      } else if (/^(Given|When|Then|And)/.test(line)) {
        currentScenario?.steps.push(line);
      }
    }
  
    if (currentScenario) {
      scenarios.push(currentScenario);
    }
  
    return { title, scenarios };
  }