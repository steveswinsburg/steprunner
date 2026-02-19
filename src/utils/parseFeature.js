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
  

    let inScenarioOutline = false;
    let scenarioOutline = null;
    let examplesHeader = null;
    let examplesRows = [];
    let collectingExamples = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (line.startsWith('Background:')) {
        inBackground = true;
        background = {
          title: 'Background',
          steps: []
        };
        continue;
      }

      if (line.startsWith('Scenario Outline:')) {
        inBackground = false;
        if (currentScenario) {
          scenarios.push(currentScenario);
        }
        if (scenarioOutline) {
          // If previous outline not processed, process it
          if (examplesHeader && examplesRows.length > 0) {
            scenarios.push(...expandScenarioOutline(scenarioOutline, examplesHeader, examplesRows));
          }
        }
        inScenarioOutline = true;
        scenarioOutline = {
          title: line.replace('Scenario Outline:', '').trim(),
          steps: []
        };
        examplesHeader = null;
        examplesRows = [];
        collectingExamples = false;
        continue;
      }

      if (line.startsWith('Scenario:')) {
        inBackground = false;
        if (currentScenario) {
          scenarios.push(currentScenario);
        }
        if (scenarioOutline) {
          // If previous outline not processed, process it
          if (examplesHeader && examplesRows.length > 0) {
            scenarios.push(...expandScenarioOutline(scenarioOutline, examplesHeader, examplesRows));
          }
          scenarioOutline = null;
          examplesHeader = null;
          examplesRows = [];
          collectingExamples = false;
          inScenarioOutline = false;
        }
        currentScenario = {
          title: line.replace('Scenario:', '').trim(),
          steps: []
        };
        continue;
      }

      if (inScenarioOutline) {
        if (/^(Given|When|Then|And|But)/.test(line)) {
          scenarioOutline.steps.push(line);
        } else if (line.startsWith('Examples:')) {
          collectingExamples = true;
        } else if (collectingExamples && line.startsWith('|')) {
          const row = line.split('|').slice(1, -1).map(cell => cell.trim());
          if (!examplesHeader) {
            examplesHeader = row;
          } else {
            examplesRows.push(row);
          }
        } else if (collectingExamples && !line.startsWith('|') && line !== '') {
          // End of examples table
          collectingExamples = false;
        }
        continue;
      }

      if (/^(Given|When|Then|And|But)/.test(line)) {
        if (inBackground) {
          background?.steps.push(line);
        } else {
          currentScenario?.steps.push(line);
        }
      }
    }

    // Finalize any remaining scenario outline
    if (scenarioOutline && examplesHeader && examplesRows.length > 0) {
      scenarios.push(...expandScenarioOutline(scenarioOutline, examplesHeader, examplesRows));
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

// Helper to expand scenario outlines
function expandScenarioOutline(outline, header, rows) {
  // outline: { title, steps }
  // header: [var1, var2, ...]
  // rows: [[val1, val2, ...], ...]
  const scenarios = [];
  for (const row of rows) {
    let scenarioTitle = outline.title;
    let steps = outline.steps.map(step => {
      let newStep = step;
      header.forEach((h, idx) => {
        const re = new RegExp(`<\s*${h}\s*>`, 'g');
        newStep = newStep.replace(re, row[idx]);
      });
      return newStep;
    });
    scenarios.push({ title: scenarioTitle, steps });
  }
  return scenarios;
}