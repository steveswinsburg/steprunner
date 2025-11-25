import Dexie from 'dexie';

const db = new Dexie('StepRunnerDB');

db.version(1).stores({
  sessions: '++id, name, createdAt',
  features: '++id, sessionId, title, content',
  steps: '++id, sessionId, featureId, scenarioIndex, stepIndex, status, modifiedBy',
  activities: '++id, sessionId, timestamp' //also: user, message
});

db.version(2).stores({
  sessions: '++id, name, createdAt',
  features: '++id, sessionId, title, content',
  steps: '++id, sessionId, featureId, scenarioIndex, stepIndex, status, modifiedBy, duration, matchLocation',
  activities: '++id, sessionId, timestamp',
  images: '++id, sessionId, featureId, scenarioIndex, stepIndex, uploadedAt'
});

export default db;