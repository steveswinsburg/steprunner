export default function parseFeature(text) {
    const lines = text.split('\n');
    const title = lines.find(l => l.startsWith('Feature:'))?.replace('Feature:', '').trim() || 'Untitled Feature';
  
    // Extract feature description (lines between Feature: and first Background/Scenario)
    let description = '';
    let descriptionLines = [];
    let foundFeature = false;
    let descriptionEnded = false;
    
    for (let line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Feature:')) {
        foundFeature = true;
        continue;
      }
      
      if (foundFeature && !descriptionEnded) {
        if (trimmedLine.startsWith('Background:') || trimmedLine.startsWith('Scenario:')) {
          descriptionEnded = true;
        } else if (trimmedLine.length > 0) {
          descriptionLines.push(trimmedLine);
        }
      }
    }
    
    description = descriptionLines.join('\n');
    
    // Extract Background steps
    let background = null;
    let inBackground = false;
    
    const scenarios = [];
    let currentScenario = null;
  
    for (let line of lines) {
      line = line.trim();
      
      if (line.startsWith('Background:')) {
        inBackground = true;
        background = {
          title: 'Background',
          steps: []
        };
        continue;
      }
  
      if (line.startsWith('Scenario:')) {
        inBackground = false;
        if (currentScenario) {
          scenarios.push(currentScenario);
        }
        currentScenario = {
          title: line.replace('Scenario:', '').trim(),
          steps: []
        };
      } else if (/^(Given|When|Then|And|But)/.test(line)) {
        if (inBackground) {
          background?.steps.push(line);
        } else {
          currentScenario?.steps.push(line);
        }
      }
    }
  
    if (currentScenario) {
      scenarios.push(currentScenario);
    }
  
    return { 
      title, 
      description,
      background,
      scenarios 
    };
  }