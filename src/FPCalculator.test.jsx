import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { test, expect } from "vitest";
import App from "./App"; 

/**
 * TEST 1: Verifies the default calculation logic.
 * We find the first numeric input (EI Low) and change it to 1.
 * Expected: UFP = 3, VAF = 0.65, Final FP = 1.95
 */
test("calculates UFP and Final FP correctly", async () => {
  render(<App />);

  // 1. Select the first numeric input (EI Low)
  // Since labels aren't linked, we find inputs by their default value "0"
  const allInputs = screen.getAllByRole("spinbutton");
  const eiLowInput = allInputs[0]; 

  // 2. Change value to 1
  fireEvent.change(eiLowInput, { target: { value: "1" } });

  // 3. Wait for the useEffect calculation to render the result
  await waitFor(() => {
    expect(screen.getByText("1.95")).toBeInTheDocument();
  });

  // Verify other parts of the calculation
  expect(screen.getByText("3")).toBeInTheDocument();    // UFP (1 * 3)
  expect(screen.getByText("0.65")).toBeInTheDocument(); // VAF (Default)
});

/**
 * TEST 2: Verifies mode switching.
 * Checks if clicking '3D Metrics' updates the UI headers.
 */
test("switches to 3D Metrics mode and shows correct inputs", async () => {
  render(<App />);

  // 1. Click the 3D Metrics button
  const button3D = screen.getByText("3D Metrics");
  fireEvent.click(button3D);

  // 2. Look for the Header (H2) that says 3D Metrics
  // This is unique and won't clash with the Help dialog
  expect(screen.getByText("3D Metrics (0-10)")).toBeInTheDocument();

  // 3. Verify that the Complexity input exists by looking for the label
  // We use getAllByText[0] to avoid the "multiple elements" error
  const complexityLabels = screen.getAllByText(/COMPLEXITY/i);
  expect(complexityLabels[0]).toBeInTheDocument();

  // 4. Verify that Function Counts is gone
  expect(screen.queryByText("Function Counts")).not.toBeInTheDocument();
});