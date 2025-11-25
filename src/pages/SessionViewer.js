import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, ButtonGroup, Image, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaForward, FaQuestionCircle } from 'react-icons/fa';
import DragDropZone from '../components/DragDropZone';
import FeatureSidebar from '../components/FeatureSidebar';
import db from '../db/indexedDb';
import parseFeature from '../utils/parseFeature';
import parseCucumberReport from '../utils/parseCucumberReport';
import { downloadCucumberReport } from '../utils/exportCucumberReport';
import { auth } from '../firebase';

function SessionViewer() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [stepResults, setStepResults] = useState({});
  const [stepMetadata, setStepMetadata] = useState({});
  const [scenarioImages, setScenarioImages] = useState({});
  const [dragOverStep, setDragOverStep] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const loaded = await db.features
        .where('sessionId')
        .equals(Number(sessionId))
        .toArray();
      setFeatures(loaded);
    };

    fetchData();
  }, [sessionId]);

  const handleFileUpload = async (files) => {
    for (const file of files) {
      if (file.type === 'cucumber-report') {
        // Parse Cucumber JSON report
        const parsedFeatures = parseCucumberReport(file.content);
        
        // Store each feature from the report
        for (const parsedFeature of parsedFeatures) {
          // Create feature record
          const featureId = await db.features.add({
            sessionId: Number(sessionId),
            title: parsedFeature.title,
            content: JSON.stringify(parsedFeature) // Store parsed data as content
          });

          // Store steps with metadata
          for (let sIdx = 0; sIdx < parsedFeature.scenarios.length; sIdx++) {
            const scenario = parsedFeature.scenarios[sIdx];
            
            for (let stepIdx = 0; stepIdx < scenario.steps.length; stepIdx++) {
              const metadata = scenario.stepMetadata?.[stepIdx] || {};
              
              await db.steps.add({
                sessionId: Number(sessionId),
                featureId,
                scenarioIndex: sIdx,
                stepIndex: stepIdx,
                status: metadata.status || 'undo',
                modifiedBy: 'Imported from report',
                duration: metadata.duration,
                errorMessage: metadata.errorMessage,
                matchLocation: metadata.matchLocation
              });
            }

            // Store images from the report
            if (scenario.images && scenario.images.length > 0) {
              for (const image of scenario.images) {
                await db.images.add({
                  sessionId: Number(sessionId),
                  featureId,
                  scenarioIndex: sIdx,
                  stepIndex: image.stepIndex,
                  imageData: image.imageData,
                  mimeType: image.mimeType,
                  uploadedAt: new Date().toISOString()
                });
              }
            }
          }
        }
      } else {
        // Handle regular .feature file
        await db.features.add({
          sessionId: Number(sessionId),
          title: file.name,
          content: file.content
        });
      }
    }

    // Reload features
    const loaded = await db.features
      .where('sessionId')
      .equals(Number(sessionId))
      .toArray();
    setFeatures(loaded);
  };

  const handleSelectFeature = async (feature) => {
    setSelectedFeature(feature);
    
    // Check if content is JSON (from Cucumber report) or plain text (.feature file)
    let parsedFeature;
    try {
      const jsonContent = JSON.parse(feature.content);
      // If it parses as JSON, it's from a Cucumber report
      parsedFeature = jsonContent;
    } catch {
      // Otherwise, parse as .feature file
      parsedFeature = parseFeature(feature.content);
    }
    
    setParsed(parsedFeature);

    const steps = await db.steps
      .where({ sessionId: Number(sessionId), featureId: feature.id })
      .toArray();

    const mapped = {};
    const metadata = {};
    steps.forEach(s => {
      const key = `${s.scenarioIndex}-${s.stepIndex}`;
      mapped[key] = s.status;
      metadata[key] = {
        duration: s.duration,
        errorMessage: s.errorMessage,
        matchLocation: s.matchLocation
      };
    });

    setStepResults(mapped);
    setStepMetadata(metadata);

    // Load images for this feature
    const images = await db.images
      .where({ sessionId: Number(sessionId), featureId: feature.id })
      .toArray();

    const imagesByScenario = {};
    images.forEach(img => {
      const key = `${img.scenarioIndex}-${img.stepIndex}`;
      if (!imagesByScenario[key]) {
        imagesByScenario[key] = [];
      }
      imagesByScenario[key].push(img);
    });

    setScenarioImages(imagesByScenario);
  };

  const handleMarkStep = async (scenarioIndex, stepIndex, status) => {
    const key = `${scenarioIndex}-${stepIndex}`;
    const currentUser = auth.currentUser;

    await db.steps.put({
      sessionId: Number(sessionId),
      featureId: selectedFeature.id,
      scenarioIndex,
      stepIndex,
      status,
      modifiedBy: currentUser?.displayName || currentUser?.email || 'Unknown'
    });

    await logActivity(`Marked step ${scenarioIndex + 1}.${stepIndex + 1} as "${status}"`);

    setStepResults(prev => ({
      ...prev,
      [key]: status
    }));
  };

  const handleMarkAllInScenario = async (scenarioIndex, status) => {
    const stepCount = parsed?.scenarios?.[scenarioIndex]?.steps?.length || 0;
    const currentUser = auth.currentUser;

    const updates = [];
    for (let stepIndex = 0; stepIndex < stepCount; stepIndex++) {
      updates.push({
        sessionId: Number(sessionId),
        featureId: selectedFeature.id,
        scenarioIndex,
        stepIndex,
        status,
        modifiedBy: currentUser?.displayName || currentUser?.email || 'Unknown'
      });
    }

    await db.steps.bulkPut(updates);

    await logActivity(`Marked all steps in Scenario ${scenarioIndex + 1} as "${status}"`);

    setStepResults(prev => {
      const updated = { ...prev };
      for (let stepIndex = 0; stepIndex < stepCount; stepIndex++) {
        const key = `${scenarioIndex}-${stepIndex}`;
        updated[key] = status;
      }
      return updated;
    });
  };

  const handleDeleteSession = async () => {
    if (!window.confirm('Are you sure you want to delete this session and all associated data?')) return;

    const id = Number(sessionId);
    await db.steps.where('sessionId').equals(id).delete();
    await db.features.where('sessionId').equals(id).delete();
    await db.sessions.delete(id);

    navigate('/');
  };

  const handleExportSession = async () => {
    try {
      await downloadCucumberReport(Number(sessionId));
      await logActivity('Exported session as Cucumber report');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export session. See console for details.');
    }
  };

  const getStepStyle = (status) => {
    switch (status) {
      case 'pass': return { backgroundColor: '#d4edda' };
      case 'fail': return { backgroundColor: '#f8d7da' };
      case 'skip': return { backgroundColor: '#fff3cd' };
      default: return {};
    }
  };

  const highlightKeyword = (text) => {
    if (!text) return null;
    const words = text.split(' ');
    const firstWord = words.shift();
    return (
      <span>
        <span style={{ color: '#0056b3', fontWeight: 'bold' }}>{firstWord}</span>{' '}
        {words.join(' ')}
      </span>
    );
  };

  const logActivity = async (message) => {
    const user = auth.currentUser;

    await db.activities.add({
      sessionId: Number(sessionId),
      timestamp: new Date().toISOString(),
      user: user?.displayName || user?.email || 'Unknown',
      message
    });
  };

  const handleDeleteImage = async (imageId, scenarioIndex, stepIndex) => {
    await db.images.delete(imageId);
    
    // Reload images
    const images = await db.images
      .where({ sessionId: Number(sessionId), featureId: selectedFeature.id })
      .toArray();

    const imagesByScenario = {};
    images.forEach(img => {
      const key = `${img.scenarioIndex}-${img.stepIndex}`;
      if (!imagesByScenario[key]) {
        imagesByScenario[key] = [];
      }
      imagesByScenario[key].push(img);
    });

    setScenarioImages(imagesByScenario);
    
    await logActivity(`Deleted image from step ${scenarioIndex + 1}.${stepIndex + 1}`);
  };

  const handleDragOver = (e, scenarioIndex, stepIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStep(`${scenarioIndex}-${stepIndex}`);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStep(null);
  };

  const handleDrop = async (e, scenarioIndex, stepIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStep(null);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (!imageFile) {
      return;
    }

    // Read image as base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result.split(',')[1];
      
      await db.images.add({
        sessionId: Number(sessionId),
        featureId: selectedFeature.id,
        scenarioIndex,
        stepIndex,
        imageData: base64Data,
        mimeType: imageFile.type,
        uploadedAt: new Date().toISOString()
      });

      // Reload images
      const images = await db.images
        .where({ sessionId: Number(sessionId), featureId: selectedFeature.id })
        .toArray();

      const imagesByScenario = {};
      images.forEach(img => {
        const key = `${img.scenarioIndex}-${img.stepIndex}`;
        if (!imagesByScenario[key]) {
          imagesByScenario[key] = [];
        }
        imagesByScenario[key].push(img);
      });

      setScenarioImages(imagesByScenario);
      
      await logActivity(`Added image to step ${scenarioIndex + 1}.${stepIndex + 1}`);
    };
    
    reader.readAsDataURL(imageFile);
  };

  return (
    <div style={{ display: 'flex' }}>
      <style>{`
        .image-container .delete-image-btn {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .image-container:hover .delete-image-btn {
          opacity: 1 !important;
        }
        .step-drag-over {
          background-color: #e3f2fd !important;
          border: 2px dashed #2196f3 !important;
          padding: 8px;
          border-radius: 4px;
        }
      `}</style>
      <div className="d-flex flex-column border-end pe-2" style={{ width: '300px', flexShrink: 0 }}>
        <FeatureSidebar
          features={features}
          selectedId={selectedFeature?.id}
          onSelect={handleSelectFeature}
        />
      </div>

      <div className="p-4 flex-grow-1" style={{ minWidth: 0 }}>
        <div className="d-flex justify-content-between align-items-center">
          <h2>Session #{sessionId}</h2>
          <div className="d-flex gap-2">
            <Button variant="primary" size="sm" onClick={handleExportSession}>
              Export Session
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleDeleteSession}>
              Delete Session
            </Button>
          </div>
        </div>

        {features.length === 0 && (
          <div className="mt-4 text-muted">
            <p>No features added yet. Add some .feature files.</p>
          </div>
        )}

        {features.length > 0 && !selectedFeature && (
          <div className="mt-4 text-muted">
            <p>Select a feature to begin testing.</p>
          </div>
        )}

        {parsed && (
          <div className="mt-4">
            <h4>Feature: {parsed.title}</h4>
            
            {/* Feature description */}
            {parsed.description && (
              <div className="mb-4" style={{ 
                padding: '12px', 
                backgroundColor: '#f8f9fa', 
                borderLeft: '3px solid #6c757d',
                whiteSpace: 'pre-line',
                fontStyle: 'italic'
              }}>
                {parsed.description}
              </div>
            )}
            
            {/* Background section */}
            {parsed.background && (
              <div className="mb-4">
                <h5 style={{ color: '#6c757d' }}>Background:</h5>
                <div style={{ marginLeft: '20px' }}>
                  {parsed.background.steps.map((step, idx) => (
                    <div 
                      key={`bg-${idx}`}
                      style={{
                        padding: '8px',
                        marginBottom: '6px',
                        borderRadius: '4px',
                        backgroundColor: '#e9ecef',
                        border: '1px solid #ced4da',
                        fontStyle: 'italic'
                      }}
                    >
                      {highlightKeyword(step)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {parsed.scenarios.map((sc, sIdx) => (
              <div key={sIdx} className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Scenario: {sc.title}</h5>
                  <ButtonGroup>
                    <Button 
                      size="sm" 
                      variant="success" 
                      onClick={() => handleMarkAllInScenario(sIdx, 'pass')}
                      title="Mark all steps in this scenario as Passed"
                    >
                      <FaCheckCircle className="me-1" /> All
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleMarkAllInScenario(sIdx, 'fail')}
                      title="Mark all steps in this scenario as Failed"
                    >
                      <FaTimesCircle className="me-1" /> All
                    </Button>
                    <Button 
                      size="sm" 
                      variant="warning" 
                      onClick={() => handleMarkAllInScenario(sIdx, 'skip')}
                      title="Mark all steps in this scenario as Skipped"
                    >
                      <FaForward className="me-1" /> All
                    </Button>
                    <Button 
                      size="sm" 
                      variant="info" 
                      onClick={() => handleMarkAllInScenario(sIdx, 'undo')}
                      title="Mark all steps in this scenario as Undefined"
                    >
                      <FaQuestionCircle className="me-1" /> All
                    </Button>
                  </ButtonGroup>
                </div>
                <div>
                  {sc.steps.map((step, stepIdx) => {
                    const key = `${sIdx}-${stepIdx}`;
                    const status = stepResults[key];
                    const metadata = stepMetadata[key] || {};
                    const images = scenarioImages[key] || [];
                    const isDragOver = dragOverStep === key;
                    
                    return (
                      <div 
                        key={stepIdx} 
                        style={{
                          ...getStepStyle(status),
                          transition: 'all 0.2s',
                          padding: '12px',
                          marginBottom: '8px',
                          borderRadius: '4px',
                          border: '1px solid #dee2e6'
                        }}
                        className={isDragOver ? 'step-drag-over' : ''}
                        onDragOver={(e) => handleDragOver(e, sIdx, stepIdx)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, sIdx, stepIdx)}
                      >
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            {highlightKeyword(step)}{' '}
                            
                            {/* Display metadata if available */}
                            {metadata.duration && (
                              <Badge bg="secondary" className="ms-2">
                                {(metadata.duration / 1000000).toFixed(0)}ms
                              </Badge>
                            )}
                            {metadata.matchLocation && (
                              <small className="ms-2 text-muted">
                                {metadata.matchLocation}
                              </small>
                            )}
                          </div>
                          
                          <ButtonGroup size="sm" className="ms-2">
                            <Button 
                              variant={status === 'pass' ? 'success' : 'secondary'} 
                              style={status !== 'pass' ? { opacity: 0.6 } : {}}
                              onClick={() => handleMarkStep(sIdx, stepIdx, 'pass')}
                              title="Mark as Passed"
                            >
                              <FaCheckCircle />
                            </Button>
                            <Button 
                              variant={status === 'fail' ? 'danger' : 'secondary'} 
                              style={status !== 'fail' ? { opacity: 0.6 } : {}}
                              onClick={() => handleMarkStep(sIdx, stepIdx, 'fail')}
                              title="Mark as Failed"
                            >
                              <FaTimesCircle />
                            </Button>
                            <Button 
                              variant={status === 'skip' ? 'warning' : 'secondary'} 
                              style={status !== 'skip' ? { opacity: 0.6 } : {}}
                              onClick={() => handleMarkStep(sIdx, stepIdx, 'skip')}
                              title="Mark as Skipped"
                            >
                              <FaForward />
                            </Button>
                            <Button 
                              variant={status === 'undo' ? 'info' : 'secondary'} 
                              style={status !== 'undo' ? { opacity: 0.6 } : {}}
                              onClick={() => handleMarkStep(sIdx, stepIdx, 'undo')}
                              title="Mark as Undefined"
                            >
                              <FaQuestionCircle />
                            </Button>
                          </ButtonGroup>
                        </div>
                        
                        {metadata.errorMessage && (
                          <div className="text-danger small mt-2">
                            {metadata.errorMessage}
                          </div>
                        )}
                        
                        {/* Display images */}
                        {images.length > 0 && (
                          <div className="mt-2 d-flex gap-2 flex-wrap">
                            {images.map((img, imgIdx) => (
                              <div 
                                key={imgIdx} 
                                style={{ position: 'relative' }}
                                className="image-container"
                              >
                                <Image
                                  src={`data:${img.mimeType};base64,${img.imageData}`}
                                  thumbnail
                                  style={{ maxWidth: '200px', cursor: 'pointer' }}
                                  onClick={() => window.open(`data:${img.mimeType};base64,${img.imageData}`, '_blank')}
                                />
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="delete-image-btn"
                                  style={{ 
                                    position: 'absolute', 
                                    top: '5px', 
                                    right: '5px'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to delete this image?')) {
                                      handleDeleteImage(img.id, sIdx, stepIdx);
                                    }
                                  }}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <DragDropZone onFiles={handleFileUpload} />
        </div>
      </div>
    </div>
  );
}

export default SessionViewer;