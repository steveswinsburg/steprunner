import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from 'react-bootstrap';

function DragDropZone({ onFiles }) {
  const onDrop = useCallback((acceptedFiles) => {
    const featureFiles = acceptedFiles.filter(file => file.name.endsWith('.feature'));

    // Read content of each file
    Promise.all(
      featureFiles.map(file =>
        file.text().then(text => ({
          name: file.name,
          content: text
        }))
      )
    ).then(results => {
      onFiles(results); // Call the parent with parsed results
    });
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.feature']
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
          ? 'Drop the .feature files here...'
          : 'Drag and drop your .feature files here, or click to select'}
      </p>
    </Card>
  );
}

export default DragDropZone;