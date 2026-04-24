import React, { useState, useEffect } from "react";

// --- UI COMPONENTS ---
const Card = ({ children, id }) => (
  <div id={id} style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "12px", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
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
        fontSize: "14px", outline: "none", width: "60px", boxSizing: "border-box", height: "20px"
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
  const vafPrompts = [
    "Does the system require reliable backup and recovery?",
    "Are data communications required?",
    "Are there distributed processing functions?",
    "Is performance critical?",
    "Will the system run in an existing, heavily utilized operational environment?",
    "Does the system require online data entry?",
    "Does the on-line data entry require the input transaction to be built over multiple screens or operations?",
    "Is the master file updated online?",
    "Are the inputs, outputs, files, or inquiries complex?",
    "Is the internal processing complex?",
    "Is the code designed to be reusable?",
    "Are conversion and installation included in the design?",
    "Is the system designed for multiple installations in different organizations?",
    "Is the application designed to facilitate change and ease of use by the user?"
  ];
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
    if (!canCalculate) {
      setResult({ type: "Invalid" });
      return;
    }
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

  useEffect(() => calculate(), [inputs, vafFactors, enhanced, mode]);

  const openHelp = () => {
    document.getElementById("HelpDialog").showModal();
  }

  const closeHelp = () => {
    document.getElementById("HelpDialog").close();
  }

  return (
    <>
      <dialog id="HelpDialog">
        <div style={{ padding: "20px", maxWidth: "700px" }}>
          <h1>Help</h1>
          <>
          {mode == '3D' ? (
            <p>
              3D Metrics: Enter the complexity and performance metrics for the program from 0 to 10.
              <br/> The functional score is the same as the FP result.
              <br/> The technical score is the FP * (complexity / 10).
              <br/> The performance score is the FP * (performance / 10).
            </p>
          ) : (
            <>
              <p>
                Function Counts: Enter the count for each type of function. Each box represents a low, average, or high estimate.
                <br/>EI = External Inputs
                <br/>EO = External Outputs
                <br/>EQ = External Inquiries
                <br/>ILF = Internal Logic Files
                <br/>EIF = External Interface Files
                <br/>A weighted sum is taken and produces the UFP (unadjusted function points).
              </p>
              <p>
                VAF Factors: Rate each prompt from 0 to 5 based on how well it describes the project.
                <br/> The VAF (Value Adjustment Factor) is calculated as 0.65 + 0.01 * (sum of these ratings).
              </p>
              <p>
                The final FP is UFP * VAF.
              </p>
            </>
          )}
          </>
          <Button key="Close" onClick={closeHelp}>Close</Button>
        </div>
      </dialog>

      <button id="HelpButton" onClick={() => openHelp()} >Help</button>
      <div style={{ margin: "0 auto", display: "flex", flexDirection: "row", width: "50%", minWidth: "560px", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <h1 style={{ textAlign: "center" }}>Enhanced FP Calculator</h1>
        {["FP", "3D"].map(m => (
          <button
            className='modeButton'
            key={m}
            onClick={() => { setMode(m); setResult(null); }}
            style={{
              height: "40px",
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
              <Card id="FPCountsSection">
                <h2 style={{ flex: 0, fontSize: "18px", marginTop: "0" }}>Function Counts</h2>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly"}}>
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
                </div>
              </Card>

              <Card id='FPRatingsSection'>
                <h2 style={{ fontSize: "18px", marginTop: "0" }}>VAF Factors (0-5)</h2>
                {!isVAFValid && <p style={{ color: "#ff4d4d", fontSize: "13px", fontWeight: "bold" }}>Factors must be between 0 and 5</p>}
                  <div style={{display: "flex", flexDirection: "column", gap: "0px"}}>
                    {vafFactors.map((val, i) => (
                      <div key={i} className='VAFRow' style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                        <p style={{textAlign: "left", minHeight: "21.6px"}}>{vafPrompts[i]}</p>
                        <Input
                          type="number"
                          label={false}
                          value={val}
                          error={val < 0 || val > 5}
                          onChange={(e) => handleVAFChange(i, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
              </Card>
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

      {result && (
        <div id="Results" style={{ display: "flex", flexDirection: "column", alignContent: "center", alignItems: "center", padding: "20px", background: "#000", color: "#fff", borderRadius: "12px" }}>
          <h2 style={{ marginTop: "0", color: "#4ade80" }}>Results</h2>
          <div style={{ maxWidth: "100%", display: "flex", flexDirection: "row", justifyContent: "center", justifyItems: "stretch", gap: "25vw", flexWrap: "nowrap" }}>
            {showResult(result)}
          </div>
        </div>
      )}
    </>
  );
}

function showResult(result) {
  if (result.type === "FP") {
    return (
      <>
        <div style={{flex: "0 0 55px"}}><label style={{ fontSize: "12px", opacity: 0.7 }}>UFP</label><div style={{ fontSize: "20px" }}>{result.ufp}</div></div>
        <div style={{flex: "0 0 55px"}}><label style={{ fontSize: "12px", opacity: 0.7 }}>VAF</label><div style={{ fontSize: "20px" }}>{result.vaf}</div></div>
        <div style={{flex: "0 0 55px"}}><label style={{ fontSize: "12px", opacity: 0.7 }}>Final FP</label><div style={{ fontSize: "20px", fontWeight: "bold" }}>{result.fp}</div></div>
      </>
    );
  } else if (result.type === "3D") {
    return (
      <>
        <div style={{flex: "0 0 55px"}}><label style={{ fontSize: "12px", opacity: 0.7 }}>Functional</label><div style={{ fontSize: "20px" }}>{result.enhancedResult.functional}</div></div>
        <div style={{flex: "0 0 55px"}}><label style={{ fontSize: "12px", opacity: 0.7 }}>Technical</label><div style={{ fontSize: "20px" }}>{result.enhancedResult.technical}</div></div>
        <div style={{flex: "0 0 55px"}}><label style={{ fontSize: "12px", opacity: 0.7 }}>Performance</label><div style={{ fontSize: "20px" }}>{result.enhancedResult.performance}</div></div>
      </>
    );
  } else {
    return (
      <>
        <div><p>Cannot display results with invalid inputs!</p></div>
      </>
    );
  }
}