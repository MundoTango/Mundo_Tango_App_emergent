// Minimal test page to verify routing works
export default function TestSimple() {
  return (
    <div style={{
      padding: '50px',
      background: 'linear-gradient(to bottom right, #5EEAD4, #155E75)',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Arial'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>✅ Mundo Tango Routing Works!</h1>
      <p style={{ fontSize: '24px', marginBottom: '10px' }}>If you see this, the app is rendering correctly.</p>
      <p style={{ fontSize: '18px' }}>Navigate to:</p>
      <ul style={{ fontSize: '18px', marginTop: '10px' }}>
        <li><a href="/discover" style={{ color: 'white' }}>/discover</a></li>
        <li><a href="/about" style={{ color: 'white' }}>/about</a></li>
        <li><a href="/join" style={{ color: 'white' }}>/join</a></li>
      </ul>
    </div>
  );
}
