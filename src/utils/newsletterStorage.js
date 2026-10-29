import defaultLaserImg from "../assets/images/newsletter_laser_tech.jpg";
import defaultRoboticImg from "../assets/images/newsletter_robotic_surgery.jpg";

export const NEWSLETTER_STORAGE_KEY = "rhs_admin_newsletters_v1";

export const NEWSLETTER_CATEGORIES = [
  "Surgical Lasers on Rent",
  "Robotic & Endoscopy Towers",
  "Diagnostic & Urodynamic Systems",
  "ENT Surgical Equipment Rentals",
  "Hospital Equipment Rental Strategy",
];

export const DEFAULT_NEWSLETTERS = [
  {
    id: "edition-oct-2026",
    vol: "Vol. 14 • Issue 10",
    date: "October 2026",
    category: "Surgical Lasers on Rent",
    title: "High-Power Holmium & Thulium Fiber Lasers on Rental: Zero-CAPEX Fleet Solutions for Hospital OTs",
    subtitle: "A comprehensive operational review on acquiring high-precision stone dusting and soft-tissue lasers through flexible hospital rental models.",
    readTime: "6 min read",
    pages: "12 Pages PDF",
    image: defaultLaserImg,
    summary:
      "Modern hospital operating suites no longer need to tie up capital in expensive laser hardware. Reinforce Healthcare Services provides turnkey 1940nm Thulium Fiber Lasers and 100W Holmium:YAG systems on comprehensive per-procedure and monthly rentals, complete with certified biomedical support, optical consumables, and guaranteed 99.5% uptime.",
    description:
      "Modern hospital operating suites no longer need to tie up capital in expensive laser hardware. Reinforce Healthcare Services provides turnkey 1940nm Thulium Fiber Lasers and 100W Holmium:YAG systems on comprehensive per-procedure and monthly rentals, complete with certified biomedical support, optical consumables, and guaranteed 99.5% uptime.",
    highlights: [
      "Zero-CAPEX rental models configured specifically for hospital urology and surgery departments.",
      "1940nm Superpulsed TFL and 100W Holmium systems delivered ready-to-operate with complete OT backup.",
      "Dedicated biomedical engineer assistance, periodic laser calibration, and fiber supplies included.",
      "Flexible rental structures: pay-per-procedure, monthly leasing, or long-term hospital institutional contracts.",
    ],
    fullContent: {
      editorNote:
        "As medical facilities face increasing pressure to upgrade their surgical technology while maintaining operational liquidity, equipment leasing has emerged as the smart institutional strategy. In this October bulletin, the Reinforce Healthcare Services biomedical team details how hospitals scale operative capacity without upfront machinery capital costs.",
      sections: [
        {
          heading: "1. The Operational Shift: High-End Lasers on Demand",
          body: "Purchasing a high-power surgical laser represents a substantial capital outlay with ongoing depreciation and obsolescence risks. RHS eliminates these hurdles by delivering state-of-the-art Thulium Fiber Laser (TFL) and Holmium platforms on demand directly to hospital operating theatres, pre-calibrated and ready for clinical scheduling.",
        },
        {
          heading: "2. Comprehensive Maintenance & 99.5% Uptime Assurance",
          body: "Equipment downtime leads to cancelled surgical lists and lost institutional revenue. Under RHS hospital rental agreements, our biomedical engineering network handles all preventive maintenance, optics alignment, emergency standby unit dispatch, and laser tube servicing at zero additional cost to the medical facility.",
        },
        {
          heading: "3. Scope Longevity & Consumables Management",
          body: "Our rental packages include high-quality, calibrated optical fibers (150 µm to 550 µm) specifically matched to minimize channel friction and protect delicate flexible video scopes, maximizing equipment longevity and procedure efficiency for hospital surgical teams.",
        },
      ],
      keyQuote:
        "“Renting high-power surgical lasers from Reinforce Healthcare Services allowed our hospital to launch advanced lithotripsy services immediately with zero equipment purchase cost.” — Medical Superintendent, Apex Super Specialty Hospital",
    },
    status: "Active",
    isSpotlight: true,
    featured: true,
  },
  {
    id: "edition-sep-2026",
    vol: "Vol. 13 • Issue 09",
    date: "September 2026",
    category: "Robotic & Endoscopy Towers",
    title: "Roboflex Avicenna & Video Endoscopy Towers on Demand: The B2B Hospital Rental Advantage",
    subtitle: "Equipping hospital operating suites with robotic tele-manipulator consoles and high-definition scope suites with zero equipment depreciation risk.",
    readTime: "8 min read",
    pages: "10 Pages PDF",
    image: defaultRoboticImg,
    summary:
      "Advanced robotic consoles and flexible video endoscopy towers require significant capital allocation and continuous technical support. RHS equips partner medical facilities with turnkey robotic tele-manipulator consoles and high-definition scope suites on flexible, fully serviced rental contracts.",
    description:
      "Advanced robotic consoles and flexible video endoscopy towers require significant capital allocation and continuous technical support. RHS equips partner medical facilities with turnkey robotic tele-manipulator consoles and high-definition scope suites on flexible, fully serviced rental contracts.",
    highlights: [
      "Turnkey delivery and setup of robotic tele-manipulator consoles directly inside your hospital OT.",
      "Complete breakdown insurance, regular optical scope maintenance, and rapid swap replacement included.",
      "Significant cost savings compared to outright capital procurement, preserving hospital liquidity.",
      "Comprehensive on-site training for hospital OT staff and assisting biomedical teams.",
    ],
    fullContent: {
      editorNote:
        "Equipping an operating room with advanced robotic consoles and digital video towers is essential for tertiary hospital competitiveness. RHS rental agreements allow healthcare facilities to offer world-class robotic and endoscopic capabilities without capital debt.",
      sections: [
        {
          heading: "1. Overcoming High Capital Barriers in Surgical Robotics",
          body: "Acquiring robotic tele-manipulator systems typically involves extensive capital allocation and uncertain utilization timelines. By renting the Roboflex Avicenna through RHS, hospital administrators convert a high-risk capital purchase into an agile, procedure-linked operating expenditure.",
        },
        {
          heading: "2. Complete Scope & Console Lifecycle Management",
          body: "Flexible endoscopes and robotic consoles require meticulous handling, sterile storage, and delicate calibration. RHS assumes the complete lifecycle responsibility, providing fully tested scopes, routine calibration checks, and immediate replacements should any technical issue arise.",
        },
      ],
      keyQuote:
        "“Renting our robotic console through RHS gave our surgical department the competitive edge of modern technology with zero balance-sheet strain.” — Chief of Surgery, Metro Healthcare Network",
    },
    status: "Active",
    isSpotlight: false,
    featured: false,
  },
  {
    id: "edition-aug-2026",
    vol: "Vol. 12 • Issue 08",
    date: "August 2026",
    category: "Diagnostic & Urodynamic Systems",
    title: "Diagnostic Urodynamics & 3D Bladder Scanners on Rent: Full Turnkey Equipment Packages",
    subtitle: "Expand your hospital diagnostic department with wireless Danflow uroflowmetry systems and ultrasound scanners on flexible rental terms.",
    readTime: "5 min read",
    pages: "8 Pages PDF",
    image: defaultLaserImg,
    summary:
      "Hospitals and specialized clinics can now establish advanced urodynamic testing facilities without capital outlay. RHS supplies wireless Danflow digital flowmetry suites, multi-channel urodynamics workstations, and 3D ultrasound scanners on transparent, hassle-free rental terms.",
    description:
      "Hospitals and specialized clinics can now establish advanced urodynamic testing facilities without capital outlay. RHS supplies wireless Danflow digital flowmetry suites, multi-channel urodynamics workstations, and 3D ultrasound scanners on transparent, hassle-free rental terms.",
    highlights: [
      "Complete workstation rental including wireless telemetry transducers, software, and calibrated testing chairs.",
      "No annual maintenance contract (CAMC) burden—all calibrations, parts, and sensor replacements covered by RHS.",
      "Immediate equipment dispatch for temporary capacity surges, new diagnostic wings, or trial evaluations.",
      "Plug-and-play installation backed by RHS biomedical engineer setup and ongoing quality assurance.",
    ],
    fullContent: {
      editorNote:
        "Diagnostic departments require precision instrumentation that stays continuously calibrated and functional. In our August briefing, we demonstrate how hospital administrators streamline diagnostic equipment procurement through comprehensive rental agreements.",
      sections: [
        {
          heading: "1. Turnkey Diagnostic Suites for Medical Centers",
          body: "Setting up a urodynamic lab typically requires purchasing separate weight transducers, computerized consoles, EMG telemetry modules, and dedicated examination couches. RHS bundles the entire hardware and software ecosystem into a single, cost-effective monthly rental package.",
        },
      ],
      keyQuote:
        "“Adding a full urodynamics station on rent through RHS allowed our hospital to start specialized testing immediately without waiting for annual budget approvals.” — Head of Hospital Operations",
    },
    status: "Active",
    isSpotlight: false,
    featured: false,
  },
  {
    id: "edition-jul-2026",
    vol: "Vol. 11 • Issue 07",
    date: "July 2026",
    category: "ENT Surgical Equipment Rentals",
    title: "ENT & Surgical Oncology CO2 Lasers on Rental: Micro-Precision with Zero Ownership Risk",
    subtitle: "Offering tertiary care hospitals and surgical centers immediate access to SmartXide CO2 surgical lasers on flexible rental schedules.",
    readTime: "7 min read",
    pages: "14 Pages PDF",
    image: defaultRoboticImg,
    summary:
      "Delivering high-precision soft-tissue ablation in ENT and surgical oncology requires sophisticated CO2 lasers that can be cost-prohibitive to purchase outright. RHS delivers fully calibrated CO2 surgical laser systems with robotic scanning micromanipulators to hospital OTs on flexible rental schedules matching surgical calendars.",
    description:
      "Delivering high-precision soft-tissue ablation in ENT and surgical oncology requires sophisticated CO2 lasers that can be cost-prohibitive to purchase outright. RHS delivers fully calibrated CO2 surgical laser systems with robotic scanning micromanipulators to hospital OTs on flexible rental schedules matching surgical calendars.",
    highlights: [
      "Precision 10.6µm CO2 lasers equipped with robotic scanning micromanipulators delivered to your facility.",
      "Zero maintenance overhead: optical alignments, laser tube testing, and calibration managed 100% by RHS.",
      "Per-procedure and monthly rental plans designed to maximize hospital OT utilization and ROI.",
    ],
    fullContent: {
      editorNote:
        "High-tier surgical lasers often sit underutilized in mid-sized hospitals when purchased outright, leading to poor capital returns. In this briefing, we examine how flexible hospital equipment rentals solve capacity needs while preserving capital.",
      sections: [
        {
          heading: "1. Demand-Matched Equipment Scheduling",
          body: "Hospitals experiencing intermittent specialized surgical volume can rent SmartXide CO2 systems exactly when cases are scheduled. This aligns equipment expenditure directly with hospital procedural billing, ensuring guaranteed positive operational margins.",
        },
      ],
      keyQuote:
        "“Our surgical center rents the CO2 laser system from RHS for our scheduled operative days. It provides top-tier technology without the burden of equipment ownership.” — Medical Director, Surgical Specialty Centre",
    },
    status: "Inactive",
    isSpotlight: false,
    featured: false,
  },
];

export const getAllNewsletters = () => {
  try {
    const raw = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasAnySpotlight = parsed.some((item) => item.isSpotlight || item.featured);
        return parsed.map((item, idx) => {
          const isSpot =
            item.isSpotlight !== undefined
              ? Boolean(item.isSpotlight)
              : item.featured !== undefined
              ? Boolean(item.featured)
              : !hasAnySpotlight && idx === 0;

          return {
            ...item,
            vol: item.vol || `Vol. 14 • Issue 0${Math.max(1, 10 - idx)}`,
            category: item.category || "Surgical Lasers on Rent",
            subtitle: item.subtitle || "",
            readTime: item.readTime || "6 min read",
            pages: item.pages || "12 Pages PDF",
            description: item.description || item.summary || "",
            summary: item.summary || item.description || "",
            highlights: Array.isArray(item.highlights) ? item.highlights : [],
            fullContent: item.fullContent || {
              editorNote: item.editorNote || "",
              sections: item.sections || [],
              keyQuote: item.keyQuote || "",
            },
            isSpotlight: isSpot,
            featured: isSpot,
          };
        });
      }
    }
    // Seed default if empty
    localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(DEFAULT_NEWSLETTERS));
    return DEFAULT_NEWSLETTERS;
  } catch (error) {
    console.error("Failed to read newsletters from localStorage:", error);
    return DEFAULT_NEWSLETTERS;
  }
};

export const saveAllNewsletters = (newsletters) => {
  try {
    localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(newsletters));
    window.dispatchEvent(
      new CustomEvent("rhs_newsletters_updated", { detail: newsletters })
    );
    return true;
  } catch (error) {
    console.error("Failed to save newsletters to localStorage:", error);
    return false;
  }
};

export const addNewsletter = (item) => {
  const current = getAllNewsletters();
  const isSpotlight = Boolean(item.isSpotlight ?? item.featured ?? false);

  // Normalize highlights array from textarea string or array
  let highlightsArray = [];
  if (Array.isArray(item.highlights)) {
    highlightsArray = item.highlights;
  } else if (typeof item.highlightsText === "string") {
    highlightsArray = item.highlightsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (typeof item.highlights === "string") {
    highlightsArray = item.highlights
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Normalize article sections
  let sectionsArray = [];
  if (Array.isArray(item.sections) && item.sections.length > 0) {
    sectionsArray = item.sections;
  } else if (typeof item.sectionsText === "string" && item.sectionsText.trim()) {
    sectionsArray = [
      {
        heading: "1. Operational & Clinical Overview",
        body: item.sectionsText.trim(),
      },
    ];
  } else if (item.fullContent?.sections) {
    sectionsArray = item.fullContent.sections;
  }

  const newItem = {
    id: `edition-${Date.now()}`,
    vol:
      item.vol?.trim() ||
      `Vol. ${current.length + 10} • Issue 0${(new Date().getMonth() + 1)}`,
    title: item.title?.trim() || "Untitled Newsletter Edition",
    subtitle: item.subtitle?.trim() || "",
    category: item.category?.trim() || "Surgical Lasers on Rent",
    readTime: item.readTime?.trim() || "6 min read",
    pages: item.pages?.trim() || "12 Pages PDF",
    image: item.image || "",
    summary: item.summary?.trim() || item.description?.trim() || "",
    description: item.description?.trim() || item.summary?.trim() || "",
    highlights: highlightsArray,
    fullContent: {
      editorNote:
        item.editorNote?.trim() || item.fullContent?.editorNote?.trim() || "",
      sections: sectionsArray,
      keyQuote:
        item.keyQuote?.trim() || item.fullContent?.keyQuote?.trim() || "",
    },
    date:
      item.date?.trim() ||
      new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    status: item.status === "Inactive" ? "Inactive" : "Active",
    isSpotlight: isSpotlight,
    featured: isSpotlight,
  };

  let updated;
  if (isSpotlight) {
    updated = [
      newItem,
      ...current.map((n) => ({ ...n, isSpotlight: false, featured: false })),
    ];
  } else {
    updated = [newItem, ...current];
  }

  saveAllNewsletters(updated);
  return newItem;
};

export const updateNewsletter = (id, fields) => {
  const current = getAllNewsletters();
  const willBeSpotlight =
    fields.isSpotlight !== undefined
      ? Boolean(fields.isSpotlight)
      : fields.featured !== undefined
      ? Boolean(fields.featured)
      : undefined;

  let highlightsArray = undefined;
  if (fields.highlights !== undefined && Array.isArray(fields.highlights)) {
    highlightsArray = fields.highlights;
  } else if (fields.highlightsText !== undefined) {
    highlightsArray = fields.highlightsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const updated = current.map((item) => {
    if (item.id === id) {
      const merged = { ...item, ...fields };

      if (highlightsArray !== undefined) {
        merged.highlights = highlightsArray;
      }
      if (fields.description || fields.summary) {
        merged.description = fields.description || fields.summary;
        merged.summary = fields.description || fields.summary;
      }

      // Update fullContent
      const existingFull = item.fullContent || {};
      merged.fullContent = {
        editorNote:
          fields.editorNote !== undefined
            ? fields.editorNote
            : existingFull.editorNote || "",
        sections:
          fields.sections !== undefined
            ? fields.sections
            : fields.sectionsText !== undefined
            ? [{ heading: "1. Operational & Clinical Overview", body: fields.sectionsText }]
            : existingFull.sections || [],
        keyQuote:
          fields.keyQuote !== undefined
            ? fields.keyQuote
            : existingFull.keyQuote || "",
      };

      if (willBeSpotlight !== undefined) {
        merged.isSpotlight = willBeSpotlight;
        merged.featured = willBeSpotlight;
      }
      return merged;
    }

    if (willBeSpotlight === true) {
      return { ...item, isSpotlight: false, featured: false };
    }
    return item;
  });

  saveAllNewsletters(updated);
  return updated.find((item) => item.id === id);
};

export const setSpotlightEdition = (id) => {
  const current = getAllNewsletters();
  const updated = current.map((item) => ({
    ...item,
    isSpotlight: item.id === id,
    featured: item.id === id,
  }));
  saveAllNewsletters(updated);
  return updated;
};

export const deleteNewsletter = (id) => {
  const current = getAllNewsletters();
  const updated = current.filter((item) => item.id !== id);
  if (current.find((item) => item.id === id)?.isSpotlight && updated.length > 0) {
    const activeIdx = updated.findIndex((n) => n.status === "Active");
    const targetIdx = activeIdx >= 0 ? activeIdx : 0;
    updated[targetIdx] = {
      ...updated[targetIdx],
      isSpotlight: true,
      featured: true,
    };
  }
  saveAllNewsletters(updated);
  return { success: true };
};
