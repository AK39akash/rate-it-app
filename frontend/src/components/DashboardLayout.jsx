import React, { useState } from 'react';
import { Container, Row, Col, Nav, Navbar, Offcanvas, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobile, setShowMobile] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = {
    ADMIN: [
      { label: 'Overview', path: '/admin' },
      { label: 'Manage Users', path: '/admin/users' },
      { label: 'Manage Stores', path: '/admin/stores' },
    ],
    OWNER: [
      { label: 'My Dashboard', path: '/owner' },
      { label: 'Settings', path: '/owner/settings' },
    ],
    USER: [
      { label: 'Explore Stores', path: '/user' },
      { label: 'My Ratings', path: '/user/ratings' },
      { label: 'Settings', path: '/user/settings' },
    ]
  };

  const currentMenu = menuItems[role] || [];

  const SidebarContent = () => (
    <>
      <div className="mb-4 mb-md-5">
        <h3 className="text-gradient fw-bold mb-0">RateIt</h3>
        <small className="text-muted text-uppercase" style={{ letterSpacing: '2px', fontSize: '0.7rem' }}>
          {role} Portal
        </small>
      </div>

      <Nav className="flex-column gap-2 flex-grow-1">
        {currentMenu.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            onClick={() => setShowMobile(false)}
            className={`nav-link text-decoration-none rounded-3 px-3 py-2 ${location.pathname === item.path ? 'bg-indigo-500 text-white' : 'text-muted'}`}
            style={{
              backgroundColor: location.pathname === item.path ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: location.pathname === item.path ? '#fff' : '#94a3b8',
              border: location.pathname === item.path ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              transition: 'all 0.3s ease'
            }}
          >
           {item.label}
          </Link>
        ))}
      </Nav>

      <div className="mt-auto pt-4 border-top border-secondary">
        <motion.button 
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-100 py-2 border-0 rounded-3 text-white fw-medium shadow-sm d-flex align-items-center justify-content-center gap-2"
          style={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)'
          }}
        >
          <span>Log Out</span>
        </motion.button>
      </div>
    </>
  );

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: '100vh' }}>
      
      {/* Mobile Header */}
      <div className="d-md-none d-flex align-items-center justify-content-between p-3 glass-pane rounded-0 border-bottom border-white-10 sticky-top" style={{ zIndex: 1020 }}>
        <h4 className="text-gradient fw-bold mb-0">RateIt</h4>
        <Button 
            variant="link" 
            className="text-white p-0 text-decoration-none fs-2" 
            onClick={() => setShowMobile(true)}
            style={{ lineHeight: 1 }}
        >
            ☰
        </Button>
      </div>

      {/* Desktop Sidebar (md+) */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="glass-pane d-none d-md-flex flex-column p-4 m-3"
        style={{ width: '280px', position: 'fixed', height: 'calc(100vh - 32px)', zIndex: 100 }}
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile Offcanvas */}
      <Offcanvas show={showMobile} onHide={() => setShowMobile(false)} className="bg-dark text-white" style={{ maxWidth: '80%' }}>
        <Offcanvas.Header closeButton closeVariant="white">
             {/* Header content if needed, close button is automatic */}
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-4 pt-0">
           <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content */}
      <div className="flex-grow-1 p-3 p-md-4 dashboard-main-content">
        <Container fluid>
            {/* Top Bar - Hide on mobile if redundant, or keep for user info */}
            <div className="d-flex justify-content-end mb-4">
               <div className="glass-pane px-3 px-md-4 py-2 d-flex align-items-center gap-3">
                  <div className="bg-primary rounded-circle" style={{ width: 8, height: 8 }}></div>
                  <span className="text-sm fw-medium">Live</span>
               </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {children}
            </motion.div>
        </Container>
      </div>
    </div>
  );
};

export default DashboardLayout;
