import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Image, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/indexedDb';

function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const defaultAvatar = '/man-running.png';

  const sessions = useLiveQuery(async () => {
    return await db.sessions
      .orderBy('createdAt')
      .reverse()
      .limit(10)
      .toArray();
  }, []) || [];

  const handleSessionSelect = (sessionId) => {
    navigate(`/session/${sessionId}`);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <style>{`
        .sessions-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 1000;
        }
      `}</style>
      <Container fluid>
        <Navbar.Brand as={Link} to="/">StepRunner 🏃‍♂️</Navbar.Brand>
        <Nav>
          {user && (
            <NavDropdown
              title="Sessions"
              id="sessions-dropdown"
              align="start"
              renderMenuOnMount
            >
              {sessions.length === 0 ? (
                <NavDropdown.Item disabled>No sessions yet</NavDropdown.Item>
              ) : (
                sessions.map((session) => (
                  <NavDropdown.Item
                    key={session.id}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    {session.name}
                  </NavDropdown.Item>
                ))
              )}
            </NavDropdown>
          )}
        </Nav>
        <Nav className="ms-auto">
          {user && (
            <Nav.Item className="d-flex align-items-center gap-2">
              <Image
                src={user.photoURL || defaultAvatar}
                roundedCircle
                width="30"
                height="30"
                alt="profile"
                onError={(e) => { e.target.src = defaultAvatar; }}
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