import db from '../db/indexedDb';
import { generateCucumberHtml } from './exportCucumberHtml';
import { exportAuditLog } from './exportAuditLog';
import parseFeature from './parseFeature';
import JSZip from 'jszip';


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
      parsedFeature = parseFeature(feature.content);
    }

    console.log('parseFeature function:', parseFeature);
    console.log('parsedFeature result:', parsedFeature);

    // Fetch all steps for this feature
    const steps = await db.steps
      .where({ sessionId, featureId: feature.id })
      .toArray();
    
    console.log('Steps from DB:', steps);
    if (steps.length > 0) {
      console.log('First step example (full):', JSON.stringify(steps[0], null, 2));
      console.log('All step statuses:', steps.map((s, i) => `${i}: ${s.status}`));
    }

    // Fetch all attachments for this feature
    const images = await db.attachments
      .where({ sessionId, featureId: feature.id })
      .toArray();

    // Build scenarios (elements in Cucumber JSON)
    const elements = parsedFeature.scenarios.map((scenario, scenarioIndex) => {
      console.log(`\nProcessing scenario ${scenarioIndex}:`, scenario.title);
      console.log('Scenario steps:', scenario.steps);
      
      // Build steps for this scenario
      const scenarioSteps = scenario.steps.map((stepText, stepIndex) => {
        const stepKey = steps.find(
          s => s.scenarioIndex === scenarioIndex && s.stepIndex === stepIndex
        );
        
        console.log(`  Step ${stepIndex}: "${stepText}"`);
        console.log(`    Found stepKey:`, stepKey);
        console.log(`    Status: ${stepKey?.status}`);

        // Extract keyword and name from step text
        const match = stepText.match(/^(Given|When|Then|And|But)\s+(.+)$/);
        const keyword = match ? `${match[1]} ` : '';
        const name = match ? match[2] : stepText;

        // Get all attachments (images and document files) for this step
        const stepAttachments = images.filter(
          img => img.scenarioIndex === scenarioIndex && img.stepIndex === stepIndex
        );

        // All attachments go into embeddings (Cucumber supports any MIME type)
        const embeddings = stepAttachments.map(attachment => ({
          data: attachment.imageData,
          mime_type: attachment.mimeType,
          ...(attachment.fileName && { name: attachment.fileName })
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
 * Download the Cucumber report as a ZIP file containing JSON, HTML, audit log, and attachments
 */
export async function downloadCucumberReport(sessionId) {
  const report = await exportCucumberReport(sessionId);
  
  // Optionally extract non-image attachments to separate files for convenience
  // (they're already embedded in the JSON, but separate files are easier to view)
  const fileAttachments = [];
  report.forEach((feature, featureIdx) => {
    feature.elements?.forEach((element, elementIdx) => {
      element.steps?.forEach((step, stepIdx) => {
        if (step.embeddings && step.embeddings.length > 0) {
          step.embeddings.forEach((embedding, embIdx) => {
            // Extract non-image files as separate files
            if (embedding.mime_type && !embedding.mime_type.startsWith('image/')) {
              const fileName = embedding.name || `attachment_${embIdx + 1}`;
              fileAttachments.push({
                path: `attachments/feature${featureIdx + 1}_scenario${elementIdx + 1}_step${stepIdx + 1}/${fileName}`,
                data: embedding.data,
                mimeType: embedding.mime_type
              });
            }
          });
        }
      });
    });
  });
  
  const json = JSON.stringify(report, null, 2);
  
  // Generate HTML report
  const html = await generateCucumberHtml(report);
  
  // Export audit log as text
  const auditLog = await exportAuditLog(sessionId);
  
  // Create ZIP file
  const zip = new JSZip();
  zip.file(`cucumber-report-${sessionId}.json`, json);
  zip.file(`cucumber-report-${sessionId}.html`, html);
  zip.file(`audit-log-${sessionId}.txt`, auditLog);
  
  // Add file attachments to ZIP (for convenience - they're also in embeddings)
  fileAttachments.forEach(attachment => {
    const binaryData = atob(attachment.data);
    zip.file(attachment.path, binaryData);
  });
  
  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  // Download ZIP file
  const zipUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = zipUrl;
  link.download = `cucumber-report-${sessionId}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(zipUrl);
}
