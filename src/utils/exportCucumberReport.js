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

    // Fetch all images for this feature
    const images = await db.images
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

        // Get embeddings (images and text files) for this step
        const stepImages = images.filter(
          img => img.scenarioIndex === scenarioIndex && img.stepIndex === stepIndex
        );

        // Separate images and text files
        const imageEmbeddings = stepImages
          .filter(img => !img.fileType || img.fileType === 'image')
          .map(img => ({
            data: img.imageData,
            mime_type: img.mimeType
          }));

        // Text files will be added to ZIP as separate files
        const textFiles = stepImages.filter(img => img.fileType === 'text');

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
          ...(imageEmbeddings.length > 0 && { embeddings: imageEmbeddings }),
          // Store text files metadata for later extraction
          ...(textFiles.length > 0 && { _textFiles: textFiles })
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
  
  // Extract text files from report and create attachments folder
  const textFileAttachments = [];
  report.forEach((feature, featureIdx) => {
    feature.elements?.forEach((element, elementIdx) => {
      element.steps?.forEach((step, stepIdx) => {
        if (step._textFiles && step._textFiles.length > 0) {
          step._textFiles.forEach((file, fileIdx) => {
            textFileAttachments.push({
              path: `attachments/feature${featureIdx + 1}_scenario${elementIdx + 1}_step${stepIdx + 1}/${file.fileName}`,
              data: file.imageData,
              mimeType: file.mimeType
            });
          });
          // Remove _textFiles from export JSON (it's not part of Cucumber spec)
          delete step._textFiles;
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
  
  // Add text file attachments to ZIP
  textFileAttachments.forEach(attachment => {
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
