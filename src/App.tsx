import React from 'react';
import logo from './logo.svg';
import styles from './App.module.scss';

const App: React.FC = () => {
  return (
    <div className={styles.App}>
      <header className={styles.AppHeader}>
        <img src={logo} className={styles.AppLogo} alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className={styles.AppLink}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <small>The application is running in <b>{process.env.NODE_ENV}</b> mode.</small>
      </header>
    </div>
  );
};

export default App;
