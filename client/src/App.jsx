import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [measures, setMeasures] = useState([]);
  const [filter, setFilter] = useState('all');

  const [siteLandslideType, setSiteLandslideType] = useState('shallow');
  const [siteBudget, setSiteBudget] = useState('low');
  const [siteUrgency, setSiteUrgency] = useState('weeks');
  const [rankedResults, setRankedResults] = useState([]);

  useEffect(() => {
    const url = filter === 'all'
      ? 'http://localhost:3000/api/measures'
      : `http://localhost:3000/api/measures/${filter}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setMeasures(data))
      .catch(err => console.error('Error fetching measures:', err));
  }, [filter]);

  const COST_ORDER = { low: 0, medium: 1, high: 2, unknown: 1 };
  const TIME_ORDER = { days: 0, weeks: 1, months: 2, unknown: 1 };

  function scoreMeasure(measure) {
    let score = 0;

    // Landslide type — heaviest weight, this is the core constraint
    if (measure.landslideType === siteLandslideType) {
      score += 40;
    } else if (measure.landslideType === 'unknown') {
      score += 15; // applies broadly, partial credit
    }

    // Budget closeness
    const costDistance = Math.abs(COST_ORDER[siteBudget] - COST_ORDER[measure.costLevel]);
    score += Math.max(0, 30 - costDistance * 15);

    // Urgency closeness
    const timeDistance = Math.abs(TIME_ORDER[siteUrgency] - TIME_ORDER[measure.installationTime]);
    score += Math.max(0, 30 - timeDistance * 15);

    // Small tie-breaker from base effectiveness (1–10)
    score += measure.effectiveness;

    return score;
  }

  const handleRecommend = () => {
    const scored = measures.map((m) => ({ ...m, score: scoreMeasure(m) }));
    scored.sort((a, b) => b.score - a.score);
    setRankedResults(scored);
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Landslide Mitigation Measures</h1>
        <p className="subtitle">Browse structural and nature-based solutions</p>
      </header>

      <div className="site-form">
        <h2>Describe Your Site</h2>
        <div className="form-row">
          <label>Landslide Type</label>
          <select value={siteLandslideType} onChange={(e) => setSiteLandslideType(e.target.value)}>
            <option value="shallow">Shallow</option>
            <option value="deep">Deep</option>
            <option value="rockfall">Rockfall</option>
          </select>
        </div>
        <div className="form-row">
          <label>Budget</label>
          <select value={siteBudget} onChange={(e) => setSiteBudget(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-row">
          <label>How soon do you need it installed?</label>
          <select value={siteUrgency} onChange={(e) => setSiteUrgency(e.target.value)}>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months (no rush)</option>
          </select>
        </div>
        <button onClick={handleRecommend}>Get Recommendations</button>
      </div>

      {rankedResults.length > 0 && (
        <div className="ranked-results">
          <h2>Recommended Measures</h2>
          <div className="card-grid">
            {rankedResults.map((m) => (
              <div className="card" key={m.id}>
                <span className={`badge ${m.type}`}>{m.type}</span>
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <p className="score-badge">Match score: {m.score}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="filter-bar">
        <label htmlFor="type-filter">Filter by type</label>
        <select id="type-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="structural">Structural</option>
          <option value="nature-based">Nature-Based</option>
        </select>
      </div>

      {measures.length === 0 ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="card-grid">
          {measures.map(m => (
            <div className="card" key={m.id}>
              <span className={`badge ${m.type}`}>{m.type}</span>
              <h3>{m.name}</h3>
              <p>{m.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;