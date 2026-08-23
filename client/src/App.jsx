import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [measures, setMeasures] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/measures')
      .then(res => res.json())
      .then(data => setMeasures(data))
      .catch(err => console.error('Error fetching measures:', err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Landslide Mitigation Measures</h1>
      {measures.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {measures.map(m => (
            <li key={m.id}>
              <strong>{m.name}</strong> ({m.type}) — {m.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;