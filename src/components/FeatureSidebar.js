import { ListGroup } from 'react-bootstrap';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/indexedDb';

function FeatureSidebar({ features, selectedId, onSelect }) {

  const activities = useLiveQuery(async () => {
    if (!features?.[0]?.sessionId) return [];
    return await db.activities
      .where('sessionId')
      .equals(features[0].sessionId)
      .reverse()
      .sortBy('timestamp');
  }, [features]) || [];

  return (
    <>
     <div className="flex-shrink-0 overflow-hidden mb-5" style={{ width: '295px' }}>
        <h5 className="p-3">Features</h5>
        <ListGroup variant="flush">
          {features.map((f) => (
            <ListGroup.Item
              key={f.id}
              active={f.id === selectedId}
              action
              onClick={() => onSelect(f)}
              className="text-truncate"
            >
              
             {f.title}

            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
      
      <div className="overflow-auto mb-3" style={{ maxHeight: '500px', width: '295px' }}>
        <h5 className="p-3">Activity</h5>
        <ul className="list-unstyled small mb-0">
          {activities.map((log, idx) => (
            <li key={idx}>
              <div><strong>{log.user}</strong>&nbsp;<span>{log.message}</span></div>
              <div>{log.message}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              <hr className="my-2" />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default FeatureSidebar;