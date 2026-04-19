import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, test, expect } from "vitest";
import App from "./App"; // This targets your App.jsx file

describe("Enhanced FP Calculator Logic Tests", () => {
  
  test("calculates UFP correctly for External Inputs (EI)", () => {
    render(<App />);

    // Select the EI inputs based on the placeholders in your code
    const eiLow = screen.getByPlaceholderText("EI low");
    const eiAvg = screen.getByPlaceholderText("EI avg");
    const eiHigh = screen.getByPlaceholderText("EI high");

    // Input values: 3 Low (3*3), 2 Avg (2*4), 1 High (1*6)
    // Math: 9 + 8 + 6 = 23 UFP
    fireEvent.change(eiLow, { target: { value: "3" } });
    fireEvent.change(eiAvg, { target: { value: "2" } });
    fireEvent.change(eiHigh, { target: { value: "1" } });

    const calcButton = screen.getByText("Calculate");
    fireEvent.click(calcButton);

    // Verify UFP display matches your screenshot (23 for the EI section)
    expect(screen.getByText(/UFP: 23/i)).toBeInTheDocument();
  });

  test("calculates VAF and final FP correctly with 3D metrics", () => {
    render(<App />);

    // 1. Set a baseline: 1 ILF Low = 7 points
    const ilfLow = screen.getByPlaceholderText("ILF low");
    fireEvent.change(ilfLow, { target: { value: "1" } });

    // 2. Set VAF Factors: F1=3 and F2=4 (Total = 7)
    // Math: VAF = 0.65 + (0.01 * 7) = 0.72
    const f1 = screen.getByPlaceholderText("F1");
    const f2 = screen.getByPlaceholderText("F2");
    fireEvent.change(f1, { target: { value: "3" } });
    fireEvent.change(f2, { target: { value: "4" } });

    // 3. Set 3D Metrics: Complexity=8 (which means 80%)
    const complexityInput = screen.getByPlaceholderText("Complexity (0-10)");
    fireEvent.change(complexityInput, { target: { value: "8" } });

    const calcButton = screen.getByText("Calculate");
    fireEvent.click(calcButton);

    // Final Math:
    // UFP = 7
    // VAF = 0.72
    // FP = 7 * 0.72 = 5.04
    // Technical (3D) = 5.04 * 0.8 = 4.03
    
    expect(screen.getByText(/VAF: 0.72/i)).toBeInTheDocument();
    expect(screen.getByText(/FP: 5.04/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical: 4.03/i)).toBeInTheDocument();
  });
});