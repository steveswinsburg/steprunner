import db from '../db/indexedDb';

/**
 * Export the audit log for a session as text format
 * @param {number} sessionId - The ID of the session
 * @returns {string} Audit log in text format
 */
export async function exportAuditLog(sessionId) {
  try {
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
      // Use ISO format for consistent, locale-independent timestamps
      const timestamp = new Date(activity.timestamp).toISOString();
      text += `[${timestamp}] ${activity.user}: ${activity.message}\n`;
    });

    return text;
  } catch (error) {
    console.error('Error exporting audit log:', error);
    return 'Audit Log\n==========\n\nError: Failed to retrieve audit log data.\n';
  }
}
