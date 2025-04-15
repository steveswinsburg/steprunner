import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, ButtonGroup } from 'react-bootstrap';
import { CheckCircleFill, XCircleFill, SkipForwardFill } from 'react-bootstrap-icons';
import DragDropZone from '../components/DragDropZone';
import FeatureSidebar from '../components/FeatureSidebar';
import db from '../db/indexedDb';
import parseFeature from '../utils/parseFeature';

function SessionViewer() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [stepResults, setStepResults] = useState({});

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
    const featureData = files.map(file => ({
      sessionId: Number(sessionId),
      title: file.name,
      content: file.content
    }));

    await db.features.bulkAdd(featureData);
    const loaded = await db.features
      .where('sessionId')
      .equals(Number(sessionId))
      .toArray();
    setFeatures(loaded);
  };

  const handleSelectFeature = async (feature) => {
    setSelectedFeature(feature);
    const parsedFeature = parseFeature(feature.content);
    setParsed(parsedFeature);

    const steps = await db.steps
      .where({ sessionId: Number(sessionId), featureId: feature.id })
      .toArray();

    const mapped = {};
    steps.forEach(s => {
      const key = `${s.scenarioIndex}-${s.stepIndex}`;
      mapped[key] = s.status;
    });

    setStepResults(mapped);
  };

  const handleMarkStep = async (scenarioIndex, stepIndex, status) => {
    const key = `${scenarioIndex}-${stepIndex}`;

    await db.steps.put({
      sessionId: Number(sessionId),
      featureId: selectedFeature.id,
      scenarioIndex,
      stepIndex,
      status
    });

    setStepResults(prev => ({
      ...prev,
      [key]: status
    }));
  };

  const handleMarkAllInScenario = async (scenarioIndex, status) => {
    const stepCount = parsed?.scenarios?.[scenarioIndex]?.steps?.length || 0;

    const updates = [];
    for (let stepIndex = 0; stepIndex < stepCount; stepIndex++) {
      updates.push({
        sessionId: Number(sessionId),
        featureId: selectedFeature.id,
        scenarioIndex,
        stepIndex,
        status
      });
    }

    await db.steps.bulkPut(updates);

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
    alert('Export coming soon!');
  };

  const getStepStyle = (status) => {
    switch (status) {
      case 'pass': return { backgroundColor: '#d4edda' };
      case 'fail': return { backgroundColor: '#f8d7da' };
      case 'skip': return { backgroundColor: '#fff3cd' };
      default: return {};
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div className="d-flex flex-column border-end pe-2" style={{ minWidth: '180px' }}>
        <FeatureSidebar
          features={features}
          selectedId={selectedFeature?.id}
          onSelect={handleSelectFeature}
        />
      </div>

      <div className="p-4 flex-grow-1">
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
            <h4>{parsed.title}</h4>
            {parsed.scenarios.map((sc, sIdx) => (
              <div key={sIdx} className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>{sc.title}</h5>
                  <ButtonGroup>
                    <Button size="sm" variant="success" onClick={() => handleMarkAllInScenario(sIdx, 'pass')}>
                      <CheckCircleFill className="me-1" /> Pass All
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleMarkAllInScenario(sIdx, 'fail')}>
                      <XCircleFill className="me-1" /> Fail All
                    </Button>
                    <Button size="sm" variant="warning" onClick={() => handleMarkAllInScenario(sIdx, 'skip')}>
                      <SkipForwardFill className="me-1" /> Skip All
                    </Button>
                  </ButtonGroup>
                </div>
                <ul>
                  {sc.steps.map((step, stepIdx) => {
                    const key = `${sIdx}-${stepIdx}`;
                    const status = stepResults[key];
                    return (
                      <li key={stepIdx} style={getStepStyle(status)} className="mb-1">
                        {step}{' '}
                        <ButtonGroup size="sm">
                          <Button variant={status === 'pass' ? 'success' : 'outline-success'} onClick={() => handleMarkStep(sIdx, stepIdx, 'pass')}><CheckCircleFill /></Button>
                          <Button variant={status === 'fail' ? 'danger' : 'outline-danger'} onClick={() => handleMarkStep(sIdx, stepIdx, 'fail')}><XCircleFill /></Button>
                          <Button variant={status === 'skip' ? 'warning' : 'outline-warning'} onClick={() => handleMarkStep(sIdx, stepIdx, 'skip')}><SkipForwardFill /></Button>
                        </ButtonGroup>
                      </li>
                    );
                  })}
                </ul>
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