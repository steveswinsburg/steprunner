import React from 'react';
import { ListGroup } from 'react-bootstrap';

function FeatureSidebar({ features, selectedId, onSelect }) {
  return (
    <div style={{ minWidth: '250px' }}>
      <h5 className="p-3">Features</h5>
      <ListGroup variant="flush">
        {features.map((f) => (
          <ListGroup.Item
            key={f.id}
            active={f.id === selectedId}
            action
            onClick={() => onSelect(f)}
          >
            {f.title}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default FeatureSidebar;