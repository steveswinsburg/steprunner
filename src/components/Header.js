import React from 'react';
import { Navbar, Container, Nav, Image, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Header({ user, onLogout }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">StepRunner</Navbar.Brand>
        <Nav className="ms-auto">
          {user && (
            <Nav.Item className="d-flex align-items-center gap-2">
              <Image
                src={user.photoURL}
                roundedCircle
                width="30"
                height="30"
                alt="profile"
              />
              <span style={{ color: '#fff' }}>{user.displayName || user.email}</span>
              <Button variant="outline-light" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </Nav.Item>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;