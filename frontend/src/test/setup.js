import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Clear API URL environment variable for tests to use relative paths
delete import.meta.env.VITE_API_URL;

afterEach(() => {
  cleanup();
  localStorage.clear();
});
