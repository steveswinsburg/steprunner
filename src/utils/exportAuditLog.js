import db from '../db/indexedDb';

/**
 * Export the audit log for a session as text format
 * @param {number} sessionId - The ID of the session
 * @returns {string} Audit log in text format
 */
export async function exportAuditLog(sessionId) {
  // Fetch all activities for this session
  const activities = await db.activities
    .where('sessionId')
    .equals(sessionId)
    .toArray();

  // Sort by timestamp
  activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Format as text
  let text = 'Audit Log\n';
  text += '==========\n\n';
  
  if (activities.length === 0) {
    text += 'No activities recorded for this session.\n';
    return text;
  }

  activities.forEach(activity => {
    const timestamp = new Date(activity.timestamp).toLocaleString();
    text += `[${timestamp}] ${activity.user}: ${activity.message}\n`;
  });

  return text;
}
