import { useState, useEffect } from 'react';
import './App.css';

// Reusable segmented option control — mirrors LaRiMiT's radio-button-group
// fields more closely than a plain <select>.
function SegmentedField({ id, label, help, value, onChange, options }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {help && <p className="field-help">{help}</p>}
      <div className="segmented" role="radiogroup" aria-labelledby={id}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            className={value === opt.value ? 'active' : ''}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PrioritySlider({ id, label, value, onChange }) {
  return (
    <div className="priority-row">
      <div className="priority-label-row">
        <label htmlFor={id}>{label}</label>
        <span className="priority-value">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function App() {
  const [measures, setMeasures] = useState([]);
  const [filter, setFilter] = useState('all');

  // Existing site fields
  const [siteLandslideType, setSiteLandslideType] = useState('shallow');
  const [siteBudget, setSiteBudget] = useState('low');
  const [siteUrgency, setSiteUrgency] = useState('weeks');

  // Varnes/Cruden-based site fields
  const [siteTypeOfMovement, setSiteTypeOfMovement] = useState('Slide');
  const [siteMaterial, setSiteMaterial] = useState('Earth');
  const [siteDepthOfMovement, setSiteDepthOfMovement] = useState('Shallow');
  const [siteRateOfMovement, setSiteRateOfMovement] = useState('Slow');
  const [siteGroundwater, setSiteGroundwater] = useState('Low');
  const [siteSurfaceWater, setSiteSurfaceWater] = useState('Rain');

  // Priority sliders (0-10), modeled on LaRiMiT's AHP priority step.
  // NOTE: priorityEnvironmental is collected for interface parity with
  // LaRiMiT but is NOT yet wired into scoreMeasure — the current dataset
  // has no per-measure environmental-impact field to weight against.
  // Add one (e.g. measure.environmentalImpact) to make this live.
  const [priorityEffectivity, setPriorityEffectivity] = useState(5);
  const [priorityEnvironmental, setPriorityEnvironmental] = useState(5);
  const [priorityTime, setPriorityTime] = useState(5);
  const [priorityCost, setPriorityCost] = useState(5);

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
  const TIME_ORDER = { days: 0, weeks: 1, months: 2, years: 3, unknown: 1 };

  const includesSafe = (arr, val) => Array.isArray(arr) && arr.includes(val);

  function scoreMeasure(measure) {
    // Functional suitability: how well the measure matches the site's
    // movement classification. Scaled by the Effectivity priority slider,
    // same role as LaRiMiT's FSI-weighted likelihood mitigation suitability.
    let functionalScore = 0;
    if (measure.landslideType === siteLandslideType) {
      functionalScore += 15;
    } else if (measure.landslideType === 'unknown') {
      functionalScore += 5;
    }
    if (includesSafe(measure.typeOfMovement, siteTypeOfMovement)) functionalScore += 15;
    if (includesSafe(measure.material, siteMaterial)) functionalScore += 10;
    if (includesSafe(measure.depthOfMovement, siteDepthOfMovement)) functionalScore += 10;
    if (includesSafe(measure.rateOfMovement, siteRateOfMovement)) functionalScore += 10;
    if (includesSafe(measure.groundwater, siteGroundwater)) functionalScore += 8;
    if (includesSafe(measure.surfaceWater, siteSurfaceWater)) functionalScore += 7;

    const effectivityWeight = priorityEffectivity / 5;
    let score = functionalScore * effectivityWeight;

    // Cost closeness — scaled by the Cost priority slider.
    const costDistance = Math.abs(COST_ORDER[siteBudget] - COST_ORDER[measure.costLevel]);
    const costScore = Math.max(0, 15 - costDistance * 7.5);
    score += costScore * (priorityCost / 5);

    // Time closeness — scaled by the Construction time priority slider.
    const timeDistance = Math.abs(TIME_ORDER[siteUrgency] - TIME_ORDER[measure.installationTime]);
    const timeScore = Math.max(0, 15 - timeDistance * 5);
    score += timeScore * (priorityTime / 5);

    // Small tie-breaker from base effectiveness (1–10), unscaled.
    score += measure.effectiveness;

    return Math.round(score);
  }

  const handleRecommend = (e) => {
    e.preventDefault();
    const scored = measures.map((m) => ({ ...m, score: scoreMeasure(m) }));
    scored.sort((a, b) => b.score - a.score);
    setRankedResults(scored);
    document.getElementById('results-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className="topnav">
        <div className="topnav-inner">
          <span className="brand-mark">Landslide Mitigation Measures</span>
          <div className="nav-links">
            <a href="#assessment">Assessment</a>
            <a href="#measures">Measures</a>
          </div>
        </div>
      </nav>

      <div className="page">
        <header className="header">
          <h1>Site Assessment</h1>
          <div className="header-rule" />
          <p className="subtitle">
            Describe the movement, site conditions and priorities below to generate a
            ranked list of structural and nature-based mitigation measures.
          </p>
        </header>

        <form className="site-form" id="assessment" onSubmit={handleRecommend}>
          <h2 className="section-heading">Select case parameters</h2>
          <p className="section-intro">
            Input case-specific information on the description of the movement and the
            relevant physical conditions at the site.
          </p>

          <div className="form-section">
            <p className="form-section-label">Movement classification</p>
            <div className="field-grid">
              <SegmentedField
                id="landslideType"
                label="Landslide type"
                help="Broad category of the event."
                value={siteLandslideType}
                onChange={setSiteLandslideType}
                options={[
                  { value: 'shallow', label: 'Shallow' },
                  { value: 'deep', label: 'Deep' },
                  { value: 'rockfall', label: 'Rockfall' },
                  { value: 'flow', label: 'Flow' },
                ]}
              />

              <SegmentedField
                id="typeOfMovement"
                label="Type of movement"
                help="If the mechanism is complex, select the predominant type."
                value={siteTypeOfMovement}
                onChange={setSiteTypeOfMovement}
                options={[
                  { value: 'Fall', label: 'Fall' },
                  { value: 'Topple', label: 'Topple' },
                  { value: 'Slide', label: 'Slide' },
                  { value: 'Spread', label: 'Spread' },
                  { value: 'Flow', label: 'Flow' },
                ]}
              />

              <SegmentedField
                id="material"
                label="Material"
                help="If more than one material is present, select the predominant type."
                value={siteMaterial}
                onChange={setSiteMaterial}
                options={[
                  { value: 'Earth', label: 'Earth' },
                  { value: 'Debris', label: 'Debris' },
                  { value: 'Rock', label: 'Rock' },
                ]}
              />

              <SegmentedField
                id="depthOfMovement"
                label="Depth of movement"
                help="Depth below ground surface."
                value={siteDepthOfMovement}
                onChange={setSiteDepthOfMovement}
                options={[
                  { value: 'Surficial', label: '< 0.5 m' },
                  { value: 'Shallow', label: '0.5–3 m' },
                  { value: 'Medium', label: '3–8 m' },
                  { value: 'Deep', label: '8–15 m' },
                  { value: 'Very deep', label: '> 15 m' },
                ]}
              />

              <SegmentedField
                id="rateOfMovement"
                label="Rate of movement"
                help="Expected rate at the time of works."
                value={siteRateOfMovement}
                onChange={setSiteRateOfMovement}
                options={[
                  { value: 'Moderate to fast', label: '> 5×10⁻³ mm/s' },
                  { value: 'Slow', label: '5×10⁻⁵–5×10⁻³ mm/s' },
                  { value: 'Very slow', label: '5×10⁻⁷–5×10⁻⁵ mm/s' },
                  { value: 'Extremely slow', label: '< 5×10⁻⁷ mm/s' },
                ]}
              />
            </div>
          </div>

          <div className="form-section">
            <p className="form-section-label">Hydrology</p>
            <div className="field-grid">
              <SegmentedField
                id="groundwater"
                label="Groundwater"
                value={siteGroundwater}
                onChange={setSiteGroundwater}
                options={[
                  { value: 'Artesian', label: 'Artesian' },
                  { value: 'High', label: 'High' },
                  { value: 'Low', label: 'Low' },
                  { value: 'Absent', label: 'Absent' },
                ]}
              />

              <SegmentedField
                id="surfaceWater"
                label="Surface water"
                value={siteSurfaceWater}
                onChange={setSiteSurfaceWater}
                options={[
                  { value: 'Rain', label: 'Rain' },
                  { value: 'Snowmelt', label: 'Snowmelt' },
                  { value: 'Localized', label: 'Localized' },
                  { value: 'Stream', label: 'Stream' },
                  { value: 'Torrent', label: 'Torrent' },
                  { value: 'River', label: 'River' },
                ]}
              />
            </div>
          </div>

          <div className="form-section">
            <p className="form-section-label">Project constraints</p>
            <div className="field-grid">
              <SegmentedField
                id="budget"
                label="Budget"
                value={siteBudget}
                onChange={setSiteBudget}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
              />

              <SegmentedField
                id="urgency"
                label="Installation timeline"
                value={siteUrgency}
                onChange={setSiteUrgency}
                options={[
                  { value: 'days', label: 'Days' },
                  { value: 'weeks', label: 'Weeks' },
                  { value: 'months', label: 'Months' },
                  { value: 'years', label: 'Years (no rush)' },
                ]}
              />
            </div>
          </div>

          <div className="form-section">
            <p className="form-section-label">Select priorities</p>
            <p className="section-intro">
              Rate the relative importance of each factor from 0 (not relevant) to
              10 (extremely relevant). This reweights how measures are ranked.
            </p>

            <PrioritySlider
              id="priorityEffectivity"
              label="Importance of mitigation effectivity"
              value={priorityEffectivity}
              onChange={setPriorityEffectivity}
            />
            <PrioritySlider
              id="priorityEnvironmental"
              label="Importance of environmental considerations"
              value={priorityEnvironmental}
              onChange={setPriorityEnvironmental}
            />
            <PrioritySlider
              id="priorityTime"
              label="Importance of construction time"
              value={priorityTime}
              onChange={setPriorityTime}
            />
            <PrioritySlider
              id="priorityCost"
              label="Importance of cost"
              value={priorityCost}
              onChange={setPriorityCost}
            />
          </div>

          <button type="submit">Get recommendations</button>
        </form>

        <div id="results-anchor" />

        {rankedResults.length > 0 && (
          <div className="ranked-results">
            <h2>Recommended measures</h2>
            <div className="card-grid">
              {rankedResults.map((m) => (
                <div className="card" key={m.id}>
                  <span className={`badge ${m.type}`}>{m.type}</span>
                  <h3>{m.name}</h3>
                  <p>{m.description}</p>
                  <p className="score-badge">Match score {m.score} / 100</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="measures-catalog" id="measures">
          <div className="filter-bar">
            <label htmlFor="type-filter">Filter by type</label>
            <select id="type-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All types</option>
              <option value="structural">Structural</option>
              <option value="nature-based">Nature-based</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {measures.length === 0 ? (
            <p className="loading">Loading…</p>
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

        <footer className="site-footer">
          <p>
            This tool is a technical aid for the preliminary selection of landslide
            risk mitigation measures. It is not intended to replace detailed,
            site-specific technical investigations; its use is complementary and
            preliminary to design-oriented analysis. Use of this tool is at the
            user's own risk.
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;
