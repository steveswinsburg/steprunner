/**
 * Generate a standalone HTML report for Cucumber results
 * This creates a simple, self-contained HTML file with embedded JSON data
 */

export async function generateCucumberHtml(cucumberJson) {
  const jsonString = JSON.stringify(cucumberJson, null, 2);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cucumber Test Report</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
    }
    
    .header h1 {
      margin-bottom: 10px;
      font-size: 2em;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      padding: 20px 30px;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    
    .stat {
      padding: 15px;
      background: white;
      border-radius: 6px;
      border-left: 4px solid #667eea;
    }
    
    .stat-label {
      font-size: 0.85em;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .stat-value {
      font-size: 1.5em;
      font-weight: bold;
    }
    
    .stat.passed { border-left-color: #28a745; }
    .stat.passed .stat-value { color: #28a745; }
    
    .stat.failed { border-left-color: #dc3545; }
    .stat.failed .stat-value { color: #dc3545; }
    
    .stat.skipped { border-left-color: #ffc107; }
    .stat.skipped .stat-value { color: #ffc107; }
    
    .content {
      padding: 30px;
    }
    
    .feature {
      margin-bottom: 40px;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .feature-header {
      background: #f8f9fa;
      padding: 20px;
      border-bottom: 2px solid #dee2e6;
    }
    
    .feature-title {
      font-size: 1.5em;
      color: #495057;
      margin-bottom: 5px;
    }
    
    .feature-description {
      color: #6c757d;
      margin-top: 10px;
      font-style: italic;
      white-space: pre-line;
    }
    
    .scenario {
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .scenario:last-child {
      border-bottom: none;
    }
    
    .scenario-title {
      font-size: 1.2em;
      margin-bottom: 15px;
      color: #212529;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .scenario-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75em;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .scenario-status.passed {
      background: #d4edda;
      color: #155724;
    }
    
    .scenario-status.failed {
      background: #f8d7da;
      color: #721c24;
    }
    
    .scenario-status.skipped {
      background: #fff3cd;
      color: #856404;
    }
    
    .scenario-status.undefined {
      background: #d1ecf1;
      color: #0c5460;
    }
    
    .steps {
      margin-left: 20px;
    }
    
    .step {
      padding: 10px;
      margin: 8px 0;
      border-radius: 4px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #f8f9fa;
    }
    
    .step.passed {
      background: #d4edda;
      border-left: 3px solid #28a745;
    }
    
    .step.failed {
      background: #f8d7da;
      border-left: 3px solid #dc3545;
    }
    
    .step.skipped {
      background: #fff3cd;
      border-left: 3px solid #ffc107;
    }
    
    .step.undefined {
      background: #d1ecf1;
      border-left: 3px solid #17a2b8;
    }
    
    .step-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
    }
    
    .step.passed .step-icon {
      background: #28a745;
    }
    
    .step.failed .step-icon {
      background: #dc3545;
    }
    
    .step.skipped .step-icon {
      background: #ffc107;
    }
    
    .step.undefined .step-icon {
      background: #17a2b8;
    }
    
    .step-text {
      flex-grow: 1;
      font-family: 'Courier New', monospace;
    }
    
    .step-keyword {
      font-weight: bold;
      color: #667eea;
      margin-right: 5px;
    }
    
    .step-duration {
      font-size: 0.85em;
      color: #6c757d;
      margin-left: 10px;
    }
    
    .step-error {
      margin-top: 10px;
      padding: 10px;
      background: #fff;
      border: 1px solid #dc3545;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.85em;
      color: #721c24;
      white-space: pre-wrap;
    }
    
    .step-image {
      margin-top: 10px;
      max-width: 100%;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }
    
    .timestamp {
      color: #6c757d;
      font-size: 0.9em;
    }
    
    .toggle-json {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin: 20px 30px;
      font-size: 1em;
    }
    
    .toggle-json:hover {
      background: #5568d3;
    }
    
    .raw-json {
      display: none;
      margin: 20px 30px;
      padding: 20px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    .raw-json.visible {
      display: block;
    }
    
    .raw-json pre {
      font-family: 'Courier New', monospace;
      font-size: 0.85em;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🥒 Cucumber Test Report</h1>
      <div class="timestamp" id="timestamp"></div>
    </div>
    
    <div class="stats" id="stats"></div>
    
    <div class="content" id="content"></div>
    
    <button class="toggle-json" onclick="toggleJson()">Show/Hide Raw JSON</button>
    <div class="raw-json" id="raw-json">
      <pre>${jsonString.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
  </div>

  <script>
    const CUCUMBER_DATA = ${jsonString};
    
    function toggleJson() {
      document.getElementById('raw-json').classList.toggle('visible');
    }
    
    function calculateStats(data) {
      const stats = {
        features: data.length,
        scenarios: 0,
        steps: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        undefined: 0
      };
      
      data.forEach(feature => {
        feature.elements.forEach(scenario => {
          stats.scenarios++;
          scenario.steps.forEach(step => {
            stats.steps++;
            if (step.result) {
              if (step.result.status === 'passed') stats.passed++;
              else if (step.result.status === 'failed') stats.failed++;
              else if (step.result.status === 'skipped') stats.skipped++;
              else if (step.result.status === 'undefined') stats.undefined++;
            }
          });
        });
      });
      
      return stats;
    }
    
    function getScenarioStatus(scenario) {
      if (!scenario.steps || scenario.steps.length === 0) return 'undefined';
      
      const statuses = scenario.steps.map(s => s.result?.status || 'undefined');
      if (statuses.some(s => s === 'failed')) return 'failed';
      if (statuses.some(s => s === 'undefined')) return 'undefined';
      if (statuses.every(s => s === 'passed')) return 'passed';
      return 'skipped';
    }
    
    function formatDuration(ns) {
      if (!ns) return '';
      const ms = ns / 1000000;
      if (ms < 1000) return \`\${ms.toFixed(0)}ms\`;
      return \`\${(ms / 1000).toFixed(2)}s\`;
    }
    
    function getStepIcon(status) {
      switch(status) {
        case 'passed': return '✓';
        case 'failed': return '✗';
        case 'skipped': return '⊘';
        case 'undefined': return '?';
        default: return '•';
      }
    }
    
    function renderReport() {
      // Render stats
      const stats = calculateStats(CUCUMBER_DATA);
      const statsHtml = \`
        <div class="stat">
          <div class="stat-label">Features</div>
          <div class="stat-value">\${stats.features}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Scenarios</div>
          <div class="stat-value">\${stats.scenarios}</div>
        </div>
        <div class="stat passed">
          <div class="stat-label">Passed</div>
          <div class="stat-value">\${stats.passed}</div>
        </div>
        <div class="stat failed">
          <div class="stat-label">Failed</div>
          <div class="stat-value">\${stats.failed}</div>
        </div>
        <div class="stat skipped">
          <div class="stat-label">Skipped</div>
          <div class="stat-value">\${stats.skipped}</div>
        </div>
      \`;
      document.getElementById('stats').innerHTML = statsHtml;
      
      // Render timestamp
      document.getElementById('timestamp').textContent = \`Generated: \${new Date().toLocaleString()}\`;
      
      // Render features
      const contentHtml = CUCUMBER_DATA.map(feature => {
        const scenariosHtml = feature.elements.map(scenario => {
          const status = getScenarioStatus(scenario);
          const stepsHtml = scenario.steps.map(step => {
            const stepStatus = step.result?.status || 'undefined';
            const duration = formatDuration(step.result?.duration);
            const errorHtml = step.result?.error_message ? 
              \`<div class="step-error">\${step.result.error_message}</div>\` : '';
            
            // Handle embedded images
            const imagesHtml = step.embeddings?.map(emb => {
              if (emb.mime_type?.startsWith('image/')) {
                return \`<img class="step-image" src="data:\${emb.mime_type};base64,\${emb.data}" alt="Step screenshot" />\`;
              }
              return '';
            }).join('') || '';
            
            return \`
              <div class="step \${stepStatus}">
                <div class="step-icon">\${getStepIcon(stepStatus)}</div>
                <div style="flex-grow: 1;">
                  <div class="step-text">
                    <span class="step-keyword">\${step.keyword}</span>
                    <span>\${step.name}</span>
                    \${duration ? \`<span class="step-duration">\${duration}</span>\` : ''}
                  </div>
                  \${errorHtml}
                  \${imagesHtml}
                </div>
              </div>
            \`;
          }).join('');
          
          return \`
            <div class="scenario">
              <div class="scenario-title">
                <span>\${scenario.keyword}: \${scenario.name}</span>
                <span class="scenario-status \${status}">\${status}</span>
              </div>
              <div class="steps">
                \${stepsHtml}
              </div>
            </div>
          \`;
        }).join('');
        
        return \`
          <div class="feature">
            <div class="feature-header">
              <div class="feature-title">\${feature.keyword}: \${feature.name}</div>
              \${feature.description ? \`<div class="feature-description">\${feature.description}</div>\` : ''}
            </div>
            \${scenariosHtml}
          </div>
        \`;
      }).join('');
      
      document.getElementById('content').innerHTML = contentHtml;
    }
    
    renderReport();
  </script>
</body>
</html>`;

  return html;
}

export async function downloadCucumberHtmlReport(sessionId, cucumberJson) {
  const html = await generateCucumberHtml(cucumberJson);
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cucumber-report-${sessionId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
