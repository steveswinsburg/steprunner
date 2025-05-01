import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';


const LoginPage = () => {
  const { user, loginWithGoogle, loginWithGitHub } = useAuth();
  const navigate = useNavigate();

  // Redirect on login
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <Row>
        <Col>
          <Card className="shadow-lg p-4" style={{ minWidth: '300px', maxWidth: '400px' }}>
            <Card.Body className="text-center">
              <Card.Title className="mb-4 fs-3">Welcome to StepRunner</Card.Title>
              <p className="text-muted mb-4">Sign in to get started</p>
              <div className="d-grid gap-3">
                <Button variant="danger" onClick={loginWithGoogle}>
                  <FaGoogle className="me-2" /> Login with Google
                </Button>
                <Button variant="dark" onClick={loginWithGitHub}>
                  <FaGithub className="me-2" /> Login with GitHub
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;