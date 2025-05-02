import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const { user, loginWithGoogle, loginWithGitHub, authError } = useAuth();
  const navigate = useNavigate();

  
  useEffect(() => {
    
    // redirect on login
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

                {authError?.code === 'auth/account-exists-with-different-credential' && (
                    <Alert variant="warning" className="mt-3">
                        This email is already linked to another login method. Please use that method to sign in.
                    </Alert>
                    )}

                    {authError && authError.code !== 'auth/account-exists-with-different-credential' && (
                    <Alert variant="danger" className="mt-3">
                        {authError.message}
                    </Alert>
                )}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
     );
};

export default LoginPage;