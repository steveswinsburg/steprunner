import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, Button, Image, Row, Col, Badge } from 'react-bootstrap';
import { FaFileAlt, FaImage } from 'react-icons/fa';

function FileUploadZone({ onFileUpload, existingFiles = [] }) {
  const [previewFiles, setPreviewFiles] = useState(existingFiles);

  const onDrop = useCallback((acceptedFiles) => {
    // Accept both images and text files
    const validFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') || file.type === 'text/plain'
    );

    // Read each file as base64
    Promise.all(
      validFiles.map(file =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const fileType = file.type.startsWith('image/') ? 'image' : 'text';
            resolve({
              fileName: file.name,
              fileType: fileType,
              imageData: e.target.result.split(',')[1], // Remove data:...; base64, prefix
              mimeType: file.type,
              uploadedAt: new Date().toISOString()
            });
          };
          reader.readAsDataURL(file);
        })
      )
    ).then(results => {
      setPreviewFiles([...previewFiles, ...results]);
      onFileUpload(results); // Pass to parent
    });
  }, [onFileUpload, previewFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/plain': ['.txt', '.log']
    },
    multiple: true
  });

  const removeFile = (index) => {
    const newFiles = [...previewFiles];
    newFiles.splice(index, 1);
    setPreviewFiles(newFiles);
  };

  const downloadTextFile = (file) => {
    const blob = new Blob([atob(file.imageData)], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Card
        {...getRootProps()}
        className={`text-center p-4 border border-dashed ${isDragActive ? 'bg-light' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        <input {...getInputProps()} />
        <p className="mb-0">
          {isDragActive
            ? 'Drop files here...'
            : '📎 Add files (images or .txt logs - drag & drop or click)'}
        </p>
      </Card>

      {previewFiles.length > 0 && (
        <Row className="mt-3">
          {previewFiles.map((file, index) => (
            <Col key={index} xs={6} md={4} lg={3} className="mb-3">
              <Card>
                {file.fileType === 'image' ? (
                  <Image 
                    src={`data:${file.mimeType};base64,${file.imageData}`} 
                    thumbnail 
                    style={{ maxHeight: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="text-center p-4" 
                    style={{ backgroundColor: '#f8f9fa', minHeight: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                  >
                    <FaFileAlt size={40} className="mb-2 text-secondary" />
                    <small className="text-muted text-truncate">{file.fileName || file.name}</small>
                  </div>
                )}
                <Card.Body className="p-2 text-center">
                  {file.fileType === 'text' && (
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-1 mb-1"
                      onClick={() => downloadTextFile(file)}
                    >
                      Download
                    </Button>
                  )}
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => removeFile(index)}
                  >
                    Remove
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default FileUploadZone;
