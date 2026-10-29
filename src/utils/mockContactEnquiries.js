/**
 * =============================================================================
 * TEMPORARY MOCK DATA FOR FRONTEND UI PREVIEW ONLY
 * =============================================================================
 * This file provides sample healthcare enquiries and call bookings for admin UI
 * demonstration. All fields strictly align with the main website Contact Us form:
 * (Title, First Name, Last Name, Job Title, Hospital/Business/University,
 * Department, Address, Country, State, City, Post/Zip Code, Mobile,
 * Medical Equipment Requirements, Preferred Call Date).
 *
 * Notice:
 * - Company contact info (info@rhscare.org, 8860086232, 8448385864) is NEVER
 *   used as client inquiry data.
 * - No fake enquiry types are invented.
 * - Backend SQL Server API integration will replace this mock data when connected.
 * =============================================================================
 */

export const INITIAL_MOCK_ENQUIRIES = [
  {
    id: "ENQ-2026-1048",
    title: "Dr.",
    firstName: "Arun",
    lastName: "Verma",
    jobTitle: "Head of Urology & Kidney Transplant",
    institution: "Max Super Speciality Hospital",
    department: "Department of Urology",
    address: "1, 2, Press Enclave Marg, Saket",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    zipCode: "110017",
    mobile: "+91 9811234567",
    email: "",
    requirements:
      "Requesting quotation and technician availability for CyberHo 100W Holmium Laser on monthly rental for laser lithotripsy and HoLEP surgical procedures.",
    callDate: "2026-11-02",
    submittedAt: "2026-10-27T10:45:00.000Z",
    status: "New",
    adminNotes: "Client requested initial quote comparison between monthly lease vs pay-per-case basis.",
  },
  {
    id: "ENQ-2026-1047",
    title: "Prof. Dr.",
    firstName: "Sneha",
    lastName: "Mukherjee",
    jobTitle: "Chief Medical Administrator",
    institution: "Fortis Memorial Research Institute",
    department: "Surgical Procurement Committee",
    address: "Sector 44, Opposite HUDA City Centre",
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    zipCode: "122002",
    mobile: "+91 9810987654",
    email: "",
    requirements:
      "We want to schedule an in-hospital hands-on demonstration for the Vibrolith Plus Lithotripter system for our surgical team next week.",
    callDate: "2026-11-03",
    submittedAt: "2026-10-27T08:15:00.000Z",
    status: "New",
    adminNotes: "Demo coordinator to arrange device logistics to Gurugram OT complex.",
  },
  {
    id: "ENQ-2026-1046",
    title: "Dr.",
    firstName: "Rajesh",
    lastName: "Kulkarni",
    jobTitle: "Senior Consultant Laparoscopic Surgeon",
    institution: "Manipal Hospital",
    department: "Minimal Access Surgery",
    address: "98, HAL Old Airport Road",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    zipCode: "560017",
    mobile: "+91 9448123980",
    email: "",
    requirements:
      "Urgent requirement for SmartXide CO2 Laser machine rental with specialized micromanipulator attachments for laryngeal and soft tissue ablation.",
    callDate: "2026-11-02",
    submittedAt: "2026-10-26T16:20:00.000Z",
    status: "In Progress",
    adminNotes: "Sent technical specifications sheet. Call scheduled to discuss technician deployment.",
  },
  {
    id: "ENQ-2026-1045",
    title: "Mr.",
    firstName: "Vikram",
    lastName: "Singhania",
    jobTitle: "Director of Biomedical Engineering",
    institution: "Medanta - The Medicity",
    department: "Biomedical & Equipment Wing",
    address: "CH Bakhtawar Singh Road, Sector 38",
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    zipCode: "122001",
    mobile: "+91 9820054321",
    email: "",
    requirements:
      "Inquiring about procurement of single-use digital flexible ureterorenoscopes (HU30 series) in bulk carton packaging with trial evaluation batch.",
    callDate: "2026-11-04",
    submittedAt: "2026-10-26T11:10:00.000Z",
    status: "Contacted",
    adminNotes: "Initial telephone discussion done. Discussion ongoing regarding bulk purchase discounts.",
  },
  {
    id: "ENQ-2026-1044",
    title: "Dr.",
    firstName: "Pooja",
    lastName: "Nair",
    jobTitle: "Associate Professor of Urology",
    institution: "All India Institute of Medical Sciences (AIIMS)",
    department: "Academic & Clinical Urology",
    address: "Ansari Nagar, Ring Road",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    zipCode: "110029",
    mobile: "+91 9717012345",
    email: "",
    requirements:
      "Requesting 3-month rental contract extension for the DK30 Watt Holmium system along with maintenance service kit.",
    callDate: "2026-11-05",
    submittedAt: "2026-10-25T14:40:00.000Z",
    status: "In Progress",
    adminNotes: "Contract extension draft prepared. Pending legal sign-off.",
  },
  {
    id: "ENQ-2026-1043",
    title: "Mr.",
    firstName: "Amitabh",
    lastName: "Deshmukh",
    jobTitle: "Purchase Manager",
    institution: "Kokilaben Dhirubhai Ambani Hospital",
    department: "Materials & Supply Chain",
    address: "Rao Saheb Achutrao Patwardhan Marg, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    zipCode: "400053",
    mobile: "+91 9819876543",
    email: "",
    requirements:
      "Annual Maintenance Contract (AMC) request for existing lithotripter consoles and optical fiber probes inspection.",
    callDate: "2026-11-03",
    submittedAt: "2026-10-25T09:30:00.000Z",
    status: "Completed",
    adminNotes: "AMC agreement completed and activated. Service engineer visited site on Oct 26.",
  },
  {
    id: "ENQ-2026-1042",
    title: "Dr.",
    firstName: "Kavita",
    lastName: "Reddy",
    jobTitle: "Consultant Urogynecologist",
    institution: "Apollo Hospitals",
    department: "Obstetrics, Gynecology & Urology",
    address: "Road No. 72, Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    zipCode: "500033",
    mobile: "+91 9989012345",
    email: "",
    requirements:
      "Looking for rental of Urodynamic System (Danflow series) with disposables package for specialized pelvic floor diagnostics clinic.",
    callDate: "2026-11-06",
    submittedAt: "2026-10-24T15:00:00.000Z",
    status: "Contacted",
    adminNotes: "Customer requested pricing schedule for 10-case package vs monthly rental.",
  },
  {
    id: "ENQ-2026-1041",
    title: "Dr.",
    firstName: "Manish",
    lastName: "Bansal",
    jobTitle: "Managing Director",
    institution: "Bansal Hospital & Stone Clinic",
    department: "Executive Management",
    address: "C-Block, Shahpura",
    city: "Bhopal",
    state: "Madhya Pradesh",
    country: "India",
    zipCode: "462016",
    mobile: "+91 9425019876",
    email: "",
    requirements:
      "Exploring mobile laser rental solutions for stone treatment. Please share equipment delivery terms and training provided to OT nursing staff.",
    callDate: "2026-11-04",
    submittedAt: "2026-10-23T11:45:00.000Z",
    status: "Completed",
    adminNotes: "Onboarding call finished. First equipment dispatch scheduled.",
  },
];

/**
 * Pre-populated date-wise booking quotas for calendar & capacity overview.
 * Maximum capacity: 50 bookings per date.
 */
export const INITIAL_MOCK_DATE_QUOTAS = [
  {
    date: "2026-11-02",
    dayLabel: "Monday, Nov 02, 2026",
    bookedCount: 18,
    maxCapacity: 50,
  },
  {
    date: "2026-11-03",
    dayLabel: "Tuesday, Nov 03, 2026",
    bookedCount: 24,
    maxCapacity: 50,
  },
  {
    date: "2026-11-04",
    dayLabel: "Wednesday, Nov 04, 2026",
    bookedCount: 42,
    maxCapacity: 50,
  },
  {
    date: "2026-11-05",
    dayLabel: "Thursday, Nov 05, 2026",
    bookedCount: 50,
    maxCapacity: 50,
  },
  {
    date: "2026-11-06",
    dayLabel: "Friday, Nov 06, 2026",
    bookedCount: 12,
    maxCapacity: 50,
  },
  {
    date: "2026-11-09",
    dayLabel: "Monday, Nov 09, 2026",
    bookedCount: 7,
    maxCapacity: 50,
  },
  {
    date: "2026-11-10",
    dayLabel: "Tuesday, Nov 10, 2026",
    bookedCount: 15,
    maxCapacity: 50,
  },
];

export const ENQUIRY_STATUS_OPTIONS = [
  { value: "New", label: "New", color: "emerald" },
  { value: "Contacted", label: "Contacted", color: "sky" },
  { value: "In Progress", label: "In Progress", color: "amber" },
  { value: "Completed", label: "Completed", color: "indigo" },
];
