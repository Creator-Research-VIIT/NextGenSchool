import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  certificateNumber: string;
  institutionName?: string;
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateProps>(
  ({ studentName, courseTitle, issuedAt, certificateNumber, institutionName }, ref) => {
    // A4 Landscape dimensions roughly map to 1122.5px x 793.7px
    // Using a large fixed wrapper ensures high resolution
    return (
      <div 
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '1123px',
          height: '794px',
          background: 'linear-gradient(135deg, #f3e8ff 0%, #ffffff 50%, #fbcfe8 100%)',
          padding: '40px',
          fontFamily: 'system-ui, sans-serif',
          color: '#1f2937'
        }}
        ref={ref}
      >
        <div style={{
          width: '100%',
          height: '100%',
          border: '4px solid #c084fc',
          borderRadius: '32px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.95))',
          boxShadow: 'inset 0 0 40px rgba(192, 132, 252, 0.2)'
        }}>
          {/* Logo / Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #7c3aed, #db2777)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck style={{ width: '36px', height: '36px', color: 'white' }} />
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#7c3aed', margin: 0 }}>NextGen School</h2>
          </div>

          <h1 style={{ fontSize: '64px', fontWeight: '900', color: '#1f2937', marginBottom: '24px', letterSpacing: '-1px' }}>
            Certificate of Completion
          </h1>
          
          <p style={{ fontSize: '24px', color: '#6b7280', marginBottom: '8px', fontStyle: 'italic' }}>
            This certifies that
          </p>

          <h2 style={{ fontSize: '56px', fontWeight: '900', color: '#db2777', marginBottom: '8px', textTransform: 'capitalize' }}>
            {studentName}
          </h2>

          {institutionName && (
            <>
              <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '8px', fontStyle: 'italic' }}>
                of
              </p>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#7c3aed', marginBottom: '40px', textAlign: 'center' }}>
                {institutionName}
              </h3>
            </>
          )}

          <p style={{ fontSize: '24px', color: '#6b7280', marginBottom: '24px' }}>
            has successfully completed the course requirements for
          </p>

          <h3 style={{ fontSize: '36px', fontWeight: '800', color: '#1f2937', marginBottom: '60px' }}>
            {courseTitle}
          </h3>

          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
            {/* Left side: Date & ID */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>Completion Date</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#374151', margin: 0 }}>
                  {new Date(issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>Certificate ID</p>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#7c3aed', fontFamily: 'monospace', margin: 0 }}>
                  {certificateNumber}
                </p>
              </div>
            </div>

            {/* Center Seal */}
            <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)' }}>
              <div style={{ width: '120px', height: '120px', background: '#fdf2f8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '8px solid #fce7f3' }}>
                <Award style={{ width: '64px', height: '64px', color: '#db2777' }} />
              </div>
            </div>

            {/* Right side: Signature */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '2px solid #374151', width: '250px', marginBottom: '12px', paddingBottom: '8px' }}>
                <span style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '36px', color: '#1f2937' }}>N. School Admin</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
