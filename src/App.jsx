import { useState } from 'react';
import { AppContext, initialMembers } from './store';
import HomeScreen from './screens/HomeScreen';
import LinkScreen from './screens/LinkScreen';
import './index.css';

export default function App() {
  const [members, setMembers] = useState(initialMembers);
  const [screen, setScreen] = useState('home');

  return (
    <AppContext.Provider value={{ members, setMembers }}>
      <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', overflow: 'hidden' }}>
        {screen === 'home' && (
          <HomeScreen onNavigate={setScreen} />
        )}
        {screen === 'link' && (
          <div className="screen-enter">
            <LinkScreen onBack={() => setScreen('home')} />
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
