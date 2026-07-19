import { describe, expect, it } from "vitest";
import { validateF1Registration } from "@/lib/f1Registration";

const validInput = {
  email: "ana@example.com",
  firstName: "Ana",
  lastName: "Ruiz",
  preferredName: "",
  studentId: "A12345678",
  age: "20",
  career: "Ingeniería",
  semester: "4º",
  phone: "5512345678",
  instagram: "",
  nationality: "Mexicana",
  passportStatus: "Sí",
  visaStatus: "No aplica",
  whatsappGroupConsent: "Sí",
  privacyConsent: true,
};

describe("validateF1Registration (TC-001)", () => {
  it("accepts a valid submission and coerces types", () => {
    const result = validateF1Registration(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.age).toBe(20);
      expect(result.data.whatsappGroupConsent).toBe(true);
      expect(result.data.privacyConsent).toBe(true);
    }
  });
});

describe("validateF1Registration — missing required fields (TC-002)", () => {
  it.each(["email", "firstName", "lastName", "studentId", "phone"])(
    "rejects a submission missing %s",
    (field) => {
      const result = validateF1Registration({ ...validInput, [field]: "" });
      expect(result.success).toBe(false);
    },
  );

  it("rejects a submission missing consent", () => {
    const result = validateF1Registration({ ...validInput, privacyConsent: false });
    expect(result.success).toBe(false);
  });
});

describe("validateF1Registration — invalid formats (TC-003)", () => {
  it("rejects a student_id not matching A########", () => {
    const result = validateF1Registration({ ...validInput, studentId: "12345678" });
    expect(result.success).toBe(false);
  });

  it("rejects an age below 18", () => {
    const result = validateF1Registration({ ...validInput, age: "17" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = validateF1Registration({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone not matching 55########", () => {
    const result = validateF1Registration({ ...validInput, phone: "1234567890" });
    expect(result.success).toBe(false);
  });

  it("rejects a semester outside the allowed options", () => {
    const result = validateF1Registration({ ...validInput, semester: "10º" });
    expect(result.success).toBe(false);
  });
});
