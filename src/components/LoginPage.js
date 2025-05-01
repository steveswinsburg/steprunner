import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/LoginPage.css';

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
    <>
      <div className="aurora-bg"></div>

      <Container className="pt-5">
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card className="shadow-lg p-4 mt-5">
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
    </>
     );
};

export default LoginPage;