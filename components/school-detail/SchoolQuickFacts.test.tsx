import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SchoolQuickFacts } from "./SchoolQuickFacts";

const mockSchool = {
  kodSekolah: "TEST01",
  namaSekolah: "Test School",
  jenis: "SK",
  peringkat: "Rendah",
  lokasi: "Bandar",
  gred: "A",
  enrolmenPrasekolah: 20,
  enrolmenKhas: 5,
} as any;

const t = (key: string) => key;

describe("SchoolQuickFacts", () => {
  it("renders section heading", () => {
    render(<SchoolQuickFacts school={mockSchool} t={t} />);
    expect(screen.getByRole("heading", { name: "quickFacts" })).toBeInTheDocument();
  });

  it("renders type, level, location, grade", () => {
    render(<SchoolQuickFacts school={mockSchool} t={t} />);
    expect(screen.getByText(/type:/i)).toBeInTheDocument();
    expect(screen.getByText(/SK/)).toBeInTheDocument();
    expect(screen.getByText(/Rendah/)).toBeInTheDocument();
    expect(screen.getByText(/Bandar/)).toBeInTheDocument();
    expect(screen.getByText(/A/)).toBeInTheDocument();
  });

  it("renders pre-school and special enrolment when present", () => {
    render(<SchoolQuickFacts school={mockSchool} t={t} />);
    expect(screen.getByText(/20/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });
});
