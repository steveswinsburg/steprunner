import Dexie from 'dexie';

const db = new Dexie('StepRunnerDB');

db.version(1).stores({
  sessions: '++id, name, createdAt',
  features: '++id, sessionId, title, content',
  steps: '++id, sessionId, featureId, scenarioIndex, stepIndex, status',
});

export default db;