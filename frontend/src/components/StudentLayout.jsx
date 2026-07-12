import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import StudentSidebar from './StudentSidebar';

const StudentLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', backgroundColor: 'var(--bg-main)' }}>
        <StudentSidebar />
        <main style={{ flex: 1, padding: '40px', overflowX: 'hidden' }}>
          <div className="container" style={{ margin: 0, maxWidth: '100%' }}>
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default StudentLayout;
