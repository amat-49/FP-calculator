import React, { useState } from "react";

const Card = ({ children }) => (
  <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "12px" }}>
    {children}
  </div>
);

const CardContent = ({ children }) => <div>{children}</div>;

const Button = ({ children, ...props }) => (
  <button style={{ padding: "10px", background: "black", color: "white" }} {...props}>
    {children}
  </button>
);

const Input = (props) => (
  <input style={{ padding: "8px", border: "1px solid #ccc" }} {...props} />
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

  const [enhanced, setEnhanced] = useState({
    complexity: 5,
    performance: 5
  });

  const [result, setResult] = useState(null);

  const handleChange = (type, level, value) => {
    setInputs({
      ...inputs,
      [type]: { ...inputs[type], [level]: Number(value) }
    });
  };

  const handleVAFChange = (index, value) => {
    const updated = [...vafFactors];
    updated[index] = Number(value);
    setVafFactors(updated);
  };

  const calculate = () => {
    let ufp = 0;

    for (let type in inputs) {
      for (let level in inputs[type]) {
        ufp += inputs[type][level] * weights[type][level];
      }
    }

    const vafSum = vafFactors.reduce((a, b) => a + b, 0);
    const vaf = 0.65 + 0.01 * vafSum;
    const fp = ufp * vaf;

    if (mode === "FP") {
      setResult({
        type: "FP",
        ufp,
        vaf: vaf.toFixed(2),
        fp: fp.toFixed(2)
      });
    } else {
      const enhancedResult = {
        functional: fp.toFixed(2),
        technical: (fp * (enhanced.complexity / 10)).toFixed(2),
        performance: (fp * (enhanced.performance / 10)).toFixed(2)
      };

      setResult({
        type: "3D",
        enhancedResult
      });
    }
  };

  const renderInputs = (type) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "8px" }}>
      {["low", "avg", "high"].map((level) => (
        <Input
          key={level}
          type="number"
          placeholder={`${type} ${level}`}
          onChange={(e) => handleChange(type, level, e.target.value)}
        />
      ))}
    </div>
  );

  return (
    <div style={{ padding: "20px", display: "grid", gap: "20px" }}>
      <h1>Enhanced FP Calculator</h1>

      {/* 🔘 MODE SWITCH */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => setMode("FP")}
          style={{
            padding: "10px",
            background: mode === "FP" ? "black" : "gray",
            color: "white"
          }}
        >
          Function Points
        </button>

        <button
          onClick={() => setMode("3D")}
          style={{
            padding: "10px",
            background: mode === "3D" ? "black" : "gray",
            color: "white"
          }}
        >
          3D Metrics
        </button>
      </div>

      {/* 📊 FP INPUTS */}
      {mode === "FP" && (
        <>
          <Card>
            <CardContent>
              <h2>Function Counts</h2>
              {Object.keys(inputs).map((type) => (
                <div key={type}>
                  <p>{type}</p>
                  {renderInputs(type)}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2>VAF Factors (0-5)</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {vafFactors.map((_, i) => (
                  <Input
                    key={i}
                    type="number"
                    placeholder={`F${i + 1}`}
                    onChange={(e) => handleVAFChange(i, e.target.value)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 📊 3D INPUTS */}
      {mode === "3D" && (
        <Card>
          <CardContent>
            <h2>3D Metrics</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <Input
                type="number"
                placeholder="Complexity (0-10)"
                onChange={(e) =>
                  setEnhanced({ ...enhanced, complexity: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Performance (0-10)"
                onChange={(e) =>
                  setEnhanced({ ...enhanced, performance: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={calculate}>Calculate</Button>

      {/* 📈 RESULTS */}
      {result && result.type === "FP" && (
        <Card>
          <CardContent>
            <h2>FP Results</h2>
            <p>UFP: {result.ufp}</p>
            <p>VAF: {result.vaf}</p>
            <p>FP: {result.fp}</p>
          </CardContent>
        </Card>
      )}

      {result && result.type === "3D" && (
        <Card>
          <CardContent>
            <h2>3D Results</h2>
            <p>Functional: {result.enhancedResult.functional}</p>
            <p>Technical: {result.enhancedResult.technical}</p>
            <p>Performance: {result.enhancedResult.performance}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}