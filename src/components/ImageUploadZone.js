import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, Button, Image, Row, Col } from 'react-bootstrap';

function ImageUploadZone({ onImageUpload, existingImages = [] }) {
  const [previewImages, setPreviewImages] = useState(existingImages);

  const onDrop = useCallback((acceptedFiles) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );

    // Read each image file as base64
    Promise.all(
      imageFiles.map(file =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              name: file.name,
              imageData: e.target.result.split(',')[1], // Remove data:image/png;base64, prefix
              mimeType: file.type,
              uploadedAt: new Date().toISOString()
            });
          };
          reader.readAsDataURL(file);
        })
      )
    ).then(results => {
      setPreviewImages([...previewImages, ...results]);
      onImageUpload(results); // Pass to parent
    });
  }, [onImageUpload, previewImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: true
  });

  const removeImage = (index) => {
    const newImages = [...previewImages];
    newImages.splice(index, 1);
    setPreviewImages(newImages);
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
            ? 'Drop images here...'
            : '📷 Add images (drag & drop or click to select)'}
        </p>
      </Card>

      {previewImages.length > 0 && (
        <Row className="mt-3">
          {previewImages.map((img, index) => (
            <Col key={index} xs={6} md={4} lg={3} className="mb-3">
              <Card>
                <Image 
                  src={`data:${img.mimeType};base64,${img.imageData}`} 
                  thumbnail 
                  style={{ maxHeight: '150px', objectFit: 'cover' }}
                />
                <Card.Body className="p-2 text-center">
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => removeImage(index)}
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

export default ImageUploadZone;
