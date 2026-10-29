/**
 * =============================================================================
 * TEMPORARY MOCK DATA FOR PRODUCT ENQUIRIES FRONTEND PREVIEW
 * =============================================================================
 * This file provides sample healthcare product enquiries for the Admin UI.
 * Every single field strictly aligns with the main website Product Enquiry form
 * located in `rhs/src/Pages/ProductEnquiry.jsx`:
 *
 * Form & Submission Fields:
 * - hospital: Hospital / Clinic / Company name
 * - name: Customer full name
 * - email: Customer email address
 * - contact: Customer contact phone / mobile number
 * - address: Physical street address
 * - country: Country (e.g. INDIA, UK, USA, Canada)
 * - state: State / Province
 * - city: City
 * - pinCode: Postal Pin Code
 * - details: Specific medical equipment requirements / notes
 * - products: Array of items selected in enquiry cart [{ id, name, quantity, image }]
 *
 * Notice:
 * - This mock dataset is used for development & preview until the backend
 *   database and API endpoints are wired up to persist website submissions.
 * - Company internal contact numbers are never used as customer data.
 * =============================================================================
 */

export const ENQUIRY_STATUS_OPTIONS = [
  "New",
  "Contacted",
  "In Progress",
  "Completed",
];

export const INITIAL_PRODUCT_ENQUIRIES = [
  {
    id: "PRD-ENQ-2026-001",
    name: "Dr. Vikramaditya Rathore",
    hospital: "Medanta - The Medicity Hospital",
    email: "dr.vrathore@medanta.org",
    contact: "+91 98112 34567",
    address: "CH Bakhtawar Singh Road, Sector 38",
    city: "Gurugram",
    state: "Haryana",
    country: "INDIA",
    pinCode: "122001",
    details:
      "We require an official quotation for Diode Laser and ND: YAG Laser machines including 1-year comprehensive warranty, on-site installation, and surgical technician training for our dermatology and plastic surgery wing.",
    products: [
      {
        id: 1,
        name: "Diode Laser",
        quantity: 2,
        image: "",
      },
      {
        id: 2,
        name: "ND: YAG Laser",
        quantity: 1,
        image: "",
      },
    ],
    submittedAt: "2026-10-27T16:45:00.000Z",
    status: "New",
    adminNotes:
      "Priority inquiry from Medanta Gurugram. Client requested demo quotation before Friday committee review.",
  },
  {
    id: "PRD-ENQ-2026-002",
    name: "Dr. Ananya Sen",
    hospital: "Apollo Multispeciality Hospitals",
    email: "procurement@apollogroup.in",
    contact: "+91 98301 22334",
    address: "58 Canal Circular Road",
    city: "Kolkata",
    state: "West Bengal",
    country: "INDIA",
    pinCode: "700054",
    details:
      "Requesting availability details and price quotation for CO2 Fractional Laser for skin resurfacing and scar treatment procedures.",
    products: [
      {
        id: 3,
        name: "CO2 Laser",
        quantity: 1,
        image: "",
      },
    ],
    submittedAt: "2026-10-27T12:20:00.000Z",
    status: "New",
    adminNotes:
      "Called customer via WhatsApp; forwarded product brochure and pricing sheet via email.",
  },
  {
    id: "PRD-ENQ-2026-003",
    name: "Dr. Rajesh K. Nambiar",
    hospital: "Manipal Hospital",
    email: "rajesh.nambiar@manipalhospitals.com",
    contact: "+91 98450 78912",
    address: "98 HAL Old Airport Road, Kodihalli",
    city: "Bengaluru",
    state: "Karnataka",
    country: "INDIA",
    pinCode: "560017",
    details:
      "Our urology department requires 1 unit of Holmium Laser CyberHo for laser lithotripsy and soft tissue enucleation. Please share rental pricing as well as outright procurement terms.",
    products: [
      {
        id: 4,
        name: "CyberHo Holmium Laser",
        quantity: 1,
        image: "",
      },
      {
        id: 5,
        name: "Vibrolith Plus Lithotripter",
        quantity: 1,
        image: "",
      },
    ],
    submittedAt: "2026-10-26T18:10:00.000Z",
    status: "Contacted",
    adminNotes:
      "Discussed with Dr. Nambiar on WhatsApp. Scheduled a call for tomorrow with the biomedical engineering head.",
  },
  {
    id: "PRD-ENQ-2026-004",
    name: "Dr. Meenakshi Sundaram",
    hospital: "Gleneagles Global Health City",
    email: "dr.meenakshi@gleneagles.co.in",
    contact: "+91 94441 55678",
    address: "439 Cheran Nagar, Perumbakkam",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "INDIA",
    pinCode: "600100",
    details:
      "Interested in procurement of Q-Switched Nd:YAG Laser for pigment removal and tattoo clearing. Need delivery timeline and AMC terms.",
    products: [
      {
        id: 6,
        name: "Q-Switched Nd:YAG Laser",
        quantity: 1,
        image: "",
      },
    ],
    submittedAt: "2026-10-25T14:30:00.000Z",
    status: "In Progress",
    adminNotes:
      "Formal quotation sent. Awaiting hospital purchase order approval.",
  },
  {
    id: "PRD-ENQ-2026-005",
    name: "Suresh P. Chawla",
    hospital: "Chawla Skin & Aesthetic Center",
    email: "suresh@chawlaskincare.com",
    contact: "+91 98200 44556",
    address: "14 Linking Road, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    country: "INDIA",
    pinCode: "400050",
    details:
      "Urgent enquiry for Diode Laser (Triple Wavelength 755/808/1064nm). Please confirm delivery within 10 days.",
    products: [
      {
        id: 1,
        name: "Diode Laser",
        quantity: 1,
        image: "",
      },
    ],
    submittedAt: "2026-10-24T09:15:00.000Z",
    status: "Completed",
    adminNotes:
      "Sale completed and machine delivered on-site. Installation sign-off received.",
  },
  {
    id: "PRD-ENQ-2026-006",
    name: "Dr. Hardik Patel",
    hospital: "Zydus Hospitals & Healthcare Research",
    email: "dr.patel@zydushospitals.com",
    contact: "+91 98980 11223",
    address: "Zydus Hospital Road, SG Highway, Thaltej",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "INDIA",
    pinCode: "380054",
    details:
      "Looking for demonstration and quotation for 2 units of Lithotripsy workstations and holmium fiber consumables.",
    products: [
      {
        id: 5,
        name: "Vibrolith Plus Lithotripter",
        quantity: 2,
        image: "",
      },
    ],
    submittedAt: "2026-10-23T11:40:00.000Z",
    status: "Contacted",
    adminNotes:
      "Initial quotation shared. Customer will confirm demo date by next Monday.",
  },
];
