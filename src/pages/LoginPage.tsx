import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <a href="#" style={styles.navLink}>Home</a>
        <a href="#" style={styles.navLink}>Flights</a>
        <a href="#" style={styles.navLink}>Login</a>
        <a href="#" style={styles.navLink}>Contact</a>
      </nav>

      {/* Login Form */}
      <div style={styles.loginContainer}>
        <h2 style={{ textAlign: 'center', color: '#004080' }}>Login</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          alert("Logged in! (Placeholder)");
        }}>
          <input type="text" placeholder="Enter Username" required style={styles.input} />
          <input type="password" placeholder="Enter Password" required style={styles.input} />
          <button type="submit" style={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    backgroundColor: '#004080',
    padding: '14px 20px',
    display: 'flex',
    justifyContent: 'left',
    gap: '20px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '12px 16px',
    fontSize: '17px',
  },
  loginContainer: {
    width: '300px',
    margin: '100px auto',
    padding: '30px',
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    borderRadius: '10px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#004080',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  }
};

export default LoginPage;