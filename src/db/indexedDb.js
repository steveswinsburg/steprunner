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

db.version(3).stores({
  sessions: '++id, name, createdAt',
  features: '++id, sessionId, title, content',
  steps: '[sessionId+featureId+scenarioIndex+stepIndex], [sessionId+featureId], sessionId, featureId',
  activities: '++id, sessionId, timestamp',
  images: '++id, sessionId, featureId, scenarioIndex, stepIndex, uploadedAt'
});

// Version 4: Support multiple file types (images and text files)
// Note: 'images' table name kept for compatibility, but now stores any file type
// New fields added to records: fileName, fileType ('image' or 'text')
db.version(4).stores({
  sessions: '++id, name, createdAt',
  features: '++id, sessionId, title, content',
  steps: '[sessionId+featureId+scenarioIndex+stepIndex], [sessionId+featureId], sessionId, featureId',
  activities: '++id, sessionId, timestamp',
  images: '++id, sessionId, featureId, scenarioIndex, stepIndex, uploadedAt, fileType'
});

export default db;