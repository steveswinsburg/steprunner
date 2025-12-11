import db from '../db/indexedDb';
import { downloadCucumberHtmlReport } from './exportCucumberHtml';


/**
 * Export a report as a Cucumber JSON report
 * @param {number} sessionId - The ID of the session containing the data to export as a report
 * @returns {Object} Cucumber-compliant JSON report
 */
export async function exportCucumberReport(sessionId) {
  // Fetch all features for this session
  const features = await db.features
    .where('sessionId')
    .equals(sessionId)
    .toArray();

  const cucumberReport = [];

  for (const feature of features) {
    // Parse the feature content
    let parsedFeature;
    try {
      parsedFeature = JSON.parse(feature.content);
    } catch {
      // If not JSON, skip metadata (was a plain .feature file)
      const parseFeature = require('./parseFeature').default;
      parsedFeature = parseFeature(feature.content);
    }

    // Fetch all steps for this feature
    const steps = await db.steps
      .where({ sessionId, featureId: feature.id })
      .toArray();

    // Fetch all images for this feature
    const images = await db.images
      .where({ sessionId, featureId: feature.id })
      .toArray();

    // Build scenarios (elements in Cucumber JSON)
    const elements = parsedFeature.scenarios.map((scenario, scenarioIndex) => {
      // Build steps for this scenario
      const scenarioSteps = scenario.steps.map((stepText, stepIndex) => {
        const stepKey = steps.find(
          s => s.scenarioIndex === scenarioIndex && s.stepIndex === stepIndex
        );

        // Extract keyword and name from step text
        const match = stepText.match(/^(Given|When|Then|And|But)\s+(.+)$/);
        const keyword = match ? `${match[1]} ` : '';
        const name = match ? match[2] : stepText;

        // Get embeddings (images) for this step
        const stepImages = images.filter(
          img => img.scenarioIndex === scenarioIndex && img.stepIndex === stepIndex
        );

        const embeddings = stepImages.map(img => ({
          data: img.imageData,
          mime_type: img.mimeType
        }));

        return {
          arguments: [],
          keyword,
          line: stepIndex + 1, // Placeholder line number
          name,
          match: {
            location: stepKey?.matchLocation || 'unknown'
          },
          result: {
            status: mapStatusToCucumber(stepKey?.status || 'unknown'),
            duration: stepKey?.duration || 0,
            ...(stepKey?.errorMessage && { error_message: stepKey.errorMessage })
          },
          ...(embeddings.length > 0 && { embeddings })
        };
      });

      return {
        id: `${feature.title.toLowerCase().replace(/\s+/g, '-')};${scenario.title.toLowerCase().replace(/\s+/g, '-')}`,
        keyword: 'Scenario',
        name: scenario.title,
        description: '',
        line: scenarioIndex + 1, // Placeholder line number
        type: 'scenario',
        tags: scenario.tags || [],
        steps: scenarioSteps
      };
    });

    cucumberReport.push({
      keyword: 'Feature',
      name: parsedFeature.title,
      description: parsedFeature.description || '',
      line: 1,
      id: feature.title.toLowerCase().replace(/\s+/g, '-'),
      tags: [],
      uri: parsedFeature.uri || `features/${feature.title}.feature`,
      elements
    });
  }

  return cucumberReport;
}

/**
 * Map internal status to Cucumber status
 */
function mapStatusToCucumber(status) {
  const statusMap = {
    'pass': 'passed',
    'passed': 'passed',
    'fail': 'failed',
    'failed': 'failed',
    'skip': 'skipped',
    'skipped': 'skipped',
    'undo': 'undefined',
    'unknown': 'undefined'
  };
  
  return statusMap[status] || 'undefined';
}

/**
 * Download the Cucumber report as JSON and HTML files
 */
export async function downloadCucumberReport(sessionId) {
  const report = await exportCucumberReport(sessionId);
  const json = JSON.stringify(report, null, 2);
  
  // Download JSON file
  const jsonFilename = `cucumber-report-${sessionId}.json`;
  const jsonDataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
  
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonDataUrl;
  jsonLink.download = jsonFilename;
  document.body.appendChild(jsonLink);
  jsonLink.click();
  document.body.removeChild(jsonLink);
  
  // Download HTML file
  await downloadCucumberHtmlReport(sessionId, report);
}
