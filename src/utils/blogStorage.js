import blogImg1 from "../assets/images/blog_3.png";
import blogImg2 from "../assets/images/blog_2.png";
import blogImg3 from "../assets/images/blog_1.png";
import blogImg4 from "../assets/images/blog_4.png";
import laserTechImg from "../assets/images/newsletter_laser_tech.jpg";
import roboticImg from "../assets/images/newsletter_robotic_surgery.jpg";

export const BLOGS_STORAGE_KEY = "rhs_blogs_v1";

export const BLOG_IMAGE_PRESETS = [
  { id: "blog_3", label: "Plasma / General Surgery (blog_3)", src: blogImg1 },
  { id: "blog_2", label: "Diode Laser (blog_2)", src: blogImg2 },
  { id: "blog_1", label: "Checklist / Procurement (blog_1)", src: blogImg3 },
  { id: "blog_4", label: "Turnaround / OT (blog_4)", src: blogImg4 },
  { id: "laser_tech", label: "Laser Tech / Dusting (laser_tech)", src: laserTechImg },
  { id: "robotic_surgery", label: "Robotic / Flexible URS (robotic)", src: roboticImg },
];

export const BLOG_PRESET_MAP = {
  blog_3: blogImg1,
  blog_2: blogImg2,
  blog_1: blogImg3,
  blog_4: blogImg4,
  laser_tech: laserTechImg,
  robotic_surgery: roboticImg,
};

export const INITIAL_BLOGS = [
  {
    id: "blog-1",
    tag: "Surgical Innovation",
    title: "The Rise of Bipolar Plasma Technology in Modern OTs",
    date: "12 Aug 2026",
    readTime: "5 min read",
    author: {
      name: "Dr. Arvind Mehta",
      role: "Sr. Laparoscopic Surgeon",
      initials: "AM",
    },
    excerpt:
      "How bipolar plasma generators are reducing thermal spread and improving precision across general surgery procedures, and what it means for hospitals upgrading their OT setups.",
    presetKey: "blog_3",
    image: "",
    featured: true,
    published: true,
    views: "2.4k",
    subtitle:
      "A deep dive into sub-millimeter thermal margin control, rapid hemostasis, and OT instrument standardization.",
    keyTakeaways: [
      "Thermal spread is restricted to <0.8mm compared to 3-5mm with standard monopolar electrosurgery.",
      "Plasma corona layer enables simultaneous vaporized tissue resection and rapid capillary sealing.",
      "Reduces postoperative tissue edema, promoting faster patient discharge and lower pain scores.",
      "Seamless integration with modern laparoscopic and open surgery generator consoles.",
    ],
    content:
      "In contemporary operating theaters, surgical safety and post-op healing velocity are heavily influenced by the extent of collateral thermal damage. Conventional monopolar and standard bipolar units carry a non-trivial risk of lateral heat transmission into adjacent delicate anatomical structures such as nerves, ureters, and mesenteric vessels. Bipolar plasma technology addresses this dilemma by utilizing high-frequency energy passed through conductive saline media. This generates a localized, highly controlled plasma field composed of ionized particles that disintegrate organic molecular bonds at significantly lower core temperatures.",
    specs: [
      { label: "Operating Frequency", value: "350 kHz – 420 kHz" },
      { label: "Thermal Spread Radius", value: "< 0.8 mm" },
      { label: "Conductive Medium", value: "Isotonic Saline (0.9% NaCl)" },
      { label: "Compatible Procedures", value: "General, Urological & Gynecological Laparoscopy" },
    ],
  },
  {
    id: "blog-2",
    tag: "Product Guide",
    title: "Diode Laser vs Traditional Systems: What Surgeons Should Know",
    date: "28 Jul 2026",
    readTime: "6 min read",
    author: {
      name: "Dr. Priya Nair",
      role: "Head of Laser Endourology",
      initials: "PN",
    },
    excerpt:
      "A practical comparison of diode laser systems against conventional equipment, covering cost of ownership, safety margins, and day-to-day usability in the OT.",
    presetKey: "blog_2",
    image: "",
    featured: false,
    published: true,
    views: "1.8k",
    subtitle:
      "Balancing wavelength absorption, hemoperfusion safety, and capital expenditure across surgical disciplines.",
    keyTakeaways: [
      "Dual 980nm and 1470nm wavelengths offer high water and hemoglobin absorption coefficients.",
      "Compact solid-state diode construction eliminates frequent flashlamp replacements.",
      "Substantially reduced fiber degradation during high-angle laser deflection.",
      "Faster recovery curves in outpatient proctology, vascular, and ENT interventions.",
    ],
    content:
      "Diode lasers have transformed outpatient surgical procedures by optimizing absorption at both 980nm (targeting hemoglobin) and 1470nm (targeting intracellular water). This dual-action profile enables surgeons to achieve clean incision and instant coagulation without the high collateral thermal zones characteristic of older radiofrequency or Nd:YAG systems.",
    specs: [
      { label: "Primary Wavelengths", value: "980 nm / 1470 nm Dual Output" },
      { label: "Max Optical Output", value: "15W – 30W Continual / Pulsed" },
      { label: "Cooling Method", value: "Internal Solid-State Air Cooling" },
      { label: "Sterilization", value: "Autoclavable Handpieces + Bare Fibers" },
    ],
  },
  {
    id: "blog-3",
    tag: "Hospital Insights",
    title: "Building an Equipment Procurement Checklist for General Surgery",
    date: "10 Jul 2026",
    readTime: "4 min read",
    author: {
      name: "Rajeshwar Rao",
      role: "Biomedical Director, Apex Healthcare",
      initials: "RR",
    },
    excerpt:
      "From compliance to after-sales support, here is a checklist hospital administrators can use before finalizing any surgical equipment vendor.",
    presetKey: "blog_1",
    image: "",
    featured: false,
    published: true,
    views: "1.2k",
    subtitle:
      "A pragmatic framework for hospital C-suites, biomedical engineers, and OT committees.",
    keyTakeaways: [
      "Mandate guaranteed on-site response SLAs within 4 hours for emergency surgical units.",
      "Verify comprehensive optical and fiber warranty terms against accidental operator damage.",
      "Audit software upgrade pathways and DICOM / PACS connectivity compliance upfront.",
      "Assess total lifecycle cost including preventative maintenance and preventive calibration.",
    ],
    content:
      "Acquiring high-end surgical machinery is one of the most critical capital expenditures a healthcare institution undertakes. However, procurement teams frequently focus disproportionately on the initial invoice price, underestimating post-warranty service agreements, consumable costs, and vendor downtime penalties.",
    specs: [
      { label: "Recommended SLA", value: "< 4 Hours Critical Response" },
      { label: "Preventative Maintenance", value: "Quarterly Calibration Checks" },
      { label: "Loaner Machine Provision", value: "Guaranteed within 12 Hours" },
      { label: "Staff Certification", value: "Structured Hands-On OT Training" },
    ],
  },
  {
    id: "blog-4",
    tag: "Case Study",
    title: "Reducing OT Turnaround Time with Smarter Equipment Choices",
    date: "02 Jul 2026",
    readTime: "7 min read",
    author: {
      name: "Dr. Sandeep Kulkarni",
      role: "Clinical OT Director",
      initials: "SK",
    },
    excerpt:
      "A look at how one multi-speciality hospital cut average OT turnaround time by rethinking their general surgery instrument stack.",
    presetKey: "blog_4",
    image: "",
    featured: false,
    published: true,
    views: "3.1k",
    subtitle:
      "Operational blueprints from high-volume OT suites achieving peak procedural velocity.",
    keyTakeaways: [
      "Standardizing universal sterile trays reduced pre-incision setup delays by 18 minutes.",
      "Dedicated quick-dock mobile laser trolleys eliminated cross-theater cable transit bottlenecks.",
      "Synchronized biomedical handoffs increased surgical slots by 2 to 4 procedures daily.",
      "Real-time digital equipment logging minimized pre-procedure missing-component delays.",
    ],
    content:
      "While surgeon operating speed is often scrutinized, empirical time-motion studies indicate that OT turnaround delays stem primarily from sterile processing lag, delayed instrument tray verification, and cumbersome equipment repositioning. By implementing modular instrument stacks, the surgical suite transitions seamlessly.",
    specs: [
      { label: "Average Time Saved", value: "18 Minutes Per Changeover" },
      { label: "Daily Slot Increase", value: "+2 to +4 Surgical Slots" },
      { label: "Tray Error Reduction", value: "94% Drop in Missing Items" },
      { label: "Staff Morale Score", value: "+35% Improvement" },
    ],
  },
  {
    id: "blog-5",
    tag: "Surgical Innovation",
    title: "Next-Gen Thulium Fiber Laser (TFL) vs Holmium in Lithotripsy",
    date: "18 Jun 2026",
    readTime: "8 min read",
    author: {
      name: "Dr. Vikram Sethi",
      role: "Consultant Endourologist",
      initials: "VS",
    },
    excerpt:
      "Exploring sub-millimeter dusting, ultra-low retropulsion, and fiber flexibility that make Thulium Fiber Laser systems a game changer for calculus fragmentation.",
    presetKey: "laser_tech",
    image: "",
    featured: false,
    published: true,
    views: "2.9k",
    subtitle:
      "Why Thulium Fiber Laser (TFL) is replacing legacy Holmium in high-complexity endourology.",
    keyTakeaways: [
      "Wavelength of 1940nm closely aligns with the peak absorption of liquid water at 37°C.",
      "Generates ultra-fine 'dust' particles (<0.5mm), eliminating tedious stone basket retrieval.",
      "Near-zero retropulsion maintains stone position in renal calyces without chase-back.",
      "Enables ultra-thin 150μm-200μm fibers with full scope deflection and high irrigation flow.",
    ],
    content:
      "The 1940nm wavelength of Thulium Fiber Lasers matches the natural water absorption peak nearly four times more closely than the 2100nm of traditional Holmium:YAG. The result is rapid micro-bubble collapse that disintegrates urinary calculi into microscopic dust rather than jagged fragments.",
    specs: [
      { label: "Laser Wavelength", value: "1940 nm (TFL Peak Water Absorption)" },
      { label: "Repetition Rate", value: "Up to 2400 Hz High-Frequency" },
      { label: "Fiber Diameters", value: "150 μm, 200 μm, 272 μm" },
      { label: "Retropulsion Profile", value: "Minimal to Zero Displacement" },
    ],
  },
  {
    id: "blog-6",
    tag: "Product Guide",
    title: "Single-Use vs Reusable Flexible Video URS: Cost & Clinical Tradeoffs",
    date: "04 Jun 2026",
    readTime: "5 min read",
    author: {
      name: "Dr. Ananya Sen",
      role: "Urology Department Lead",
      initials: "AS",
    },
    excerpt:
      "Evaluating maintenance cycles, optical clarity breakdown, sterilization turnaround, and infection control to determine the ideal ureterorenoscope deployment.",
    presetKey: "robotic_surgery",
    image: "",
    featured: false,
    published: true,
    views: "1.5k",
    subtitle:
      "Evaluating repair vulnerability, sterilizer cycles, and cross-infection protocols.",
    keyTakeaways: [
      "Reusable scopes average 8 to 15 cases before needing costly optical or deflection repairs.",
      "Single-use digital ureterorenoscopes guarantee pristine optical clarity and zero prior damage.",
      "Eliminates ethylene oxide (EtO) / low-temp hydrogen peroxide turnaround waiting time.",
      "Hybrid hospital strategy: single-use for difficult lower pole stones, reusable for routine cases.",
    ],
    content:
      "Flexible video ureterorenoscopes are among the most fragile and heavily utilized instruments in any urology suite. Accidental laser strike inside the working channel, excessive deflection during lower-pole stone access, and harsh automated chemical reprocessing lead to frequent repair bills.",
    specs: [
      { label: "Deflection Angle", value: "275° Up / 275° Down" },
      { label: "Outer Diameter", value: "7.5 Fr / 8.5 Fr Tapered Tip" },
      { label: "Working Channel", value: "3.6 Fr for High-Flow Irrigation" },
      { label: "Camera Sensor", value: "Digital CMOS with Dual LED illumination" },
    ],
  },
];

// Helper to resolve an image URL or preset asset
export const getResolvedBlogImage = (blog) => {
  if (blog?.image && typeof blog.image === "string" && blog.image.trim() !== "") {
    return blog.image;
  }
  if (blog?.presetKey && BLOG_PRESET_MAP[blog.presetKey]) {
    return BLOG_PRESET_MAP[blog.presetKey];
  }
  return blogImg1;
};

// In-memory blog state (no localStorage persistence)
let inMemoryBlogs = [...INITIAL_BLOGS];

/**
 * Retrieve current active blogs list in-memory
 */
export const getAllBlogs = () => {
  return inMemoryBlogs.map((b) => ({ ...b }));
};

/**
 * Update current in-memory blogs
 */
export const saveAllBlogs = (blogs) => {
  inMemoryBlogs = Array.isArray(blogs) ? [...blogs] : [];
  window.dispatchEvent(
    new CustomEvent("rhs_blogs_updated", {
      detail: { blogs: inMemoryBlogs },
    })
  );
};

/**
 * Remove legacy mock blogs from browser localStorage if present
 */
export const clearLegacyBlogsStorage = () => {
  try {
    localStorage.removeItem(BLOGS_STORAGE_KEY);
    localStorage.removeItem("rhs_blogs_saved_v1");
  } catch {
    // ignore
  }
};