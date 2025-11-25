import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from 'react-bootstrap';

function DragDropZone({ onFiles }) {
  const onDrop = useCallback((acceptedFiles) => {
    // Accept both .feature and .json files
    const validFiles = acceptedFiles.filter(file => 
      file.name.endsWith('.feature') || file.name.endsWith('.json')
    );

    // Read content of each file
    Promise.all(
      validFiles.map(file =>
        file.text().then(text => ({
          name: file.name,
          content: text,
          type: file.name.endsWith('.json') ? 'cucumber-report' : 'feature-file'
        }))
      )
    ).then(results => {
      onFiles(results); // Call the parent with parsed results
    });
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.feature'],
      'application/json': ['.json']
    },
    multiple: true
  });

  return (
    <Card
      {...getRootProps()}
      className={`text-center p-5 mt-4 border border-dashed ${isDragActive ? 'bg-light' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      <input {...getInputProps()} />
      <p className="lead">
        {isDragActive
          ? 'Drop the files here...'
          : 'Drag and drop your .feature files or cucumber-report.json here, or click to select'}
      </p>
    </Card>
  );
}

export default DragDropZone;