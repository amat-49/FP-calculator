import React, { useState } from "react";

// --- UI COMPONENTS ---
const Card = ({ children }) => (
  <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "12px", background: "#fff", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
    {children}
  </div>
);

const Button = ({ children, disabled, ...props }) => (
  <button 
    style={{ 
      width: "100%", padding: "14px", borderRadius: "8px", border: "none", fontWeight: "bold", fontSize: "16px",
      background: disabled ? "#e0e0e0" : "black", 
      color: disabled ? "#a0a0a0" : "white", 
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background 0.3s"
    }} 
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ error, label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    {label && <label style={{ fontSize: "12px", color: "#666", width: "60px" }}>{label}</label>}
    <input 
      style={{ 
        padding: "10px", borderRadius: "6px", border: error ? "2px solid #ff4d4d" : "1px solid #ccc",
        fontSize: "14px", outline: "none", width: "60px", boxSizing: "border-box"
      }} 
      {...props} 
    />
  </div>
);

const weights = {
  EI: { low: 3, avg: 4, high: 6 },
  EO: { low: 4, avg: 5, high: 7 },
  EQ: { low: 3, avg: 4, high: 6 },
  ILF: { low: 7, avg: 10, high: 15 },
  EIF: { low: 5, avg: 7, high: 10 }
};

export default function FPCalculator() {
  const [mode, setMode] = useState("FP");
  const [inputs, setInputs] = useState({
    EI: { low: 0, avg: 0, high: 0 },
    EO: { low: 0, avg: 0, high: 0 },
    EQ: { low: 0, avg: 0, high: 0 },
    ILF: { low: 0, avg: 0, high: 0 },
    EIF: { low: 0, avg: 0, high: 0 }
  });

  const [vafFactors, setVafFactors] = useState(Array(14).fill(0));
  const [enhanced, setEnhanced] = useState({ complexity: 5, performance: 5 });
  const [result, setResult] = useState(null);

  // VALIDATION
  const isInputsValid = Object.values(inputs).every(type => 
    Object.values(type).every(val => val >= 0 && val !== "")
  );
  const isVAFValid = vafFactors.every(val => val >= 0 && val <= 5 && val !== "");
  const is3DValid = enhanced.complexity >= 0 && enhanced.complexity <= 10 &&
                    enhanced.performance >= 0 && enhanced.performance <= 10;

  const canCalculate = mode === "FP" ? (isInputsValid && isVAFValid) : is3DValid;

  // HANDLERS
  const handleChange = (type, level, value) => {
    const num = value === "" ? "" : Number(value);
    setInputs(prev => ({ ...prev, [type]: { ...prev[type], [level]: num } }));
    if (num < 0) setResult(null);
  };

  const handleVAFChange = (index, value) => {
    const num = value === "" ? "" : Number(value);
    const updated = [...vafFactors];
    updated[index] = num;
    setVafFactors(updated);
    if (num < 0 || num > 5) setResult(null);
  };

  const calculate = () => {
    if (!canCalculate) return;
    let ufp = 0;
    for (let type in inputs) {
      for (let level in inputs[type]) {
        ufp += (inputs[type][level] || 0) * weights[type][level];
      }
    }
    const vafSum = vafFactors.reduce((a, b) => a + (b || 0), 0);
    const vaf = 0.65 + 0.01 * vafSum;
    const fp = ufp * vaf;

    if (mode === "FP") {
      setResult({ type: "FP", ufp, vaf: vaf.toFixed(2), fp: fp.toFixed(2) });
    } else {
      setResult({
        type: "3D",
        enhancedResult: {
          functional: fp.toFixed(2),
          technical: (fp * (enhanced.complexity / 10)).toFixed(2),
          performance: (fp * (enhanced.performance / 10)).toFixed(2)
        }
      });
    }
  };

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Enhanced FP Calculator</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["FP", "3D"].map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setResult(null); }}
            style={{
              flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ccc",
              background: mode === m ? "black" : "#fff",
              color: mode === m ? "white" : "black",
              cursor: "pointer", fontWeight: "600",
              width: "100px"
            }}
          >
            {m === "FP" ? "Function Points" : "3D Metrics"}
          </button>
        ))}
      </div>

      {mode === "FP" ? (
        <>
          <div id='FPInputsContainer'>
            <div id='FPCountsSection'>
              <Card>
                <h2 style={{ fontSize: "18px", marginTop: "0" }}>Function Counts</h2>
                {Object.keys(inputs).map((type) => (
                  <div className='FPInputsRow' key={type} style={{ marginBottom: "15px" }}>
                    <div style={{ marginBottom: "5px", fontWeight: "bold" }}>{type}</div>
                    {["low", "avg", "high"].map((level) => (
                      <Input
                        key={level}
                        type="number"
                        label={level.toUpperCase()}
                        value={inputs[type][level]}
                        error={inputs[type][level] < 0}
                        onChange={(e) => handleChange(type, level, e.target.value)}
                      />
                    ))}
                  </div>
                ))}
              </Card>
            </div>

            <div id='FPRatingsSection'>
              <Card>
                <h2 style={{ fontSize: "18px", marginTop: "0" }}>VAF Factors (0-5)</h2>
                {!isVAFValid && <p style={{ color: "#ff4d4d", fontSize: "13px", fontWeight: "bold" }}>Factors must be between 0 and 5</p>}
                {/* FIXED GRID: auto-fit ensures boxes wrap instead of going off screen */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "12px" }}>
                  {vafFactors.map((val, i) => (
                    <Input
                      key={i}
                      type="number"
                      label={false}
                      value={val}
                      error={val < 0 || val > 5}
                      onChange={(e) => handleVAFChange(i, e.target.value)}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <h2 style={{ fontSize: "18px", marginTop: "0" }}>3D Metrics (0-10)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
            <Input
              type="number"
              label="COMPLEXITY"
              value={enhanced.complexity}
              error={enhanced.complexity < 0 || enhanced.complexity > 10}
              onChange={(e) => setEnhanced({ ...enhanced, complexity: e.target.value === "" ? "" : Number(e.target.value) })}
            />
            <Input
              type="number"
              label="PERFORMANCE"
              value={enhanced.performance}
              error={enhanced.performance < 0 || enhanced.performance > 10}
              onChange={(e) => setEnhanced({ ...enhanced, performance: e.target.value === "" ? "" : Number(e.target.value) })}
            />
          </div>
        </Card>
      )}

      <Button onClick={calculate} disabled={!canCalculate}>
        {canCalculate ? "Calculate Results" : "Fix Errors to Calculate"}
      </Button>

      {result && (
        <div style={{ marginTop: "24px", padding: "20px", background: "#000", color: "#fff", borderRadius: "12px" }}>
          <h2 style={{ marginTop: "0", color: "#4ade80" }}>Results</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            {result.type === "FP" ? (
              <>
                <div><label style={{ fontSize: "12px", opacity: 0.7 }}>UFP</label><div style={{ fontSize: "20px" }}>{result.ufp}</div></div>
                <div><label style={{ fontSize: "12px", opacity: 0.7 }}>VAF</label><div style={{ fontSize: "20px" }}>{result.vaf}</div></div>
                <div><label style={{ fontSize: "12px", opacity: 0.7 }}>Final FP</label><div style={{ fontSize: "20px", fontWeight: "bold" }}>{result.fp}</div></div>
              </>
            ) : (
              <>
                <div><label style={{ fontSize: "12px", opacity: 0.7 }}>Functional</label><div style={{ fontSize: "20px" }}>{result.enhancedResult.functional}</div></div>
                <div><label style={{ fontSize: "12px", opacity: 0.7 }}>Technical</label><div style={{ fontSize: "20px" }}>{result.enhancedResult.technical}</div></div>
                <div><label style={{ fontSize: "12px", opacity: 0.7 }}>Performance</label><div style={{ fontSize: "20px" }}>{result.enhancedResult.performance}</div></div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}