export const FAQS_STORAGE_KEY = "rhs_faqs_v1";

export const FAQ_ICON_OPTIONS = [
  { id: "medical", label: "Medical Devices" },
  { id: "verified", label: "Certified & Safe" },
  { id: "person", label: "Training & Personnel" },
  { id: "build", label: "Technical Support" },
  { id: "description", label: "Warranty & Policy" },
  { id: "public", label: "Global / International" },
  { id: "support", label: "Customer Assistance" },
  { id: "hospital", label: "Clinical Equipment" },
];

export const DEFAULT_FAQS = [
  {
    id: "faq-1",
    question: "What types of healthcare products do you offer?",
    answer:
      "We offer a wide range of advanced medical devices and equipment including Bipolar Plasma Generators, Diode Lasers, Endoscopy Systems, Flexible Video URS and more.",
    iconKey: "medical",
  },
  {
    id: "faq-2",
    question: "Are your products certified and safe to use?",
    answer:
      "Yes, our healthcare products are manufactured according to quality and safety standards. We focus on providing reliable and safe medical equipment.",
    iconKey: "verified",
  },
  {
    id: "faq-3",
    question: "Do you provide installation and training?",
    answer:
      "Yes. Our team provides installation assistance and product training to help healthcare professionals use the equipment correctly and efficiently.",
    iconKey: "person",
  },
  {
    id: "faq-4",
    question: "What kind of after-sales support do you provide?",
    answer:
      "We provide reliable after-sales support including technical assistance, troubleshooting and maintenance guidance whenever required.",
    iconKey: "build",
  },
  {
    id: "faq-5",
    question: "Do you offer warranty on your products?",
    answer:
      "Yes, warranty coverage is available for selected products. The warranty period and terms may vary depending on the product.",
    iconKey: "description",
  },
  {
    id: "faq-6",
    question: "Do you supply products internationally?",
    answer:
      "Yes, we work with healthcare organizations and customers across different regions and can support international product requirements.",
    iconKey: "public",
  },
];

export const getAllFaqs = () => {
  try {
    const raw = localStorage.getItem(FAQS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return DEFAULT_FAQS;
  } catch (error) {
    console.error("Failed to read FAQs from localStorage:", error);
    return DEFAULT_FAQS;
  }
};

export const saveAllFaqs = (faqs) => {
  try {
    localStorage.setItem(FAQS_STORAGE_KEY, JSON.stringify(faqs));
    window.dispatchEvent(
      new CustomEvent("rhs_faqs_updated", { detail: faqs })
    );
    return true;
  } catch (error) {
    console.error("Failed to save FAQs to localStorage:", error);
    return false;
  }
};

export const addFaq = (item) => {
  const current = getAllFaqs();
  const newItem = {
    id: `faq-${Date.now()}`,
    question: item.question?.trim() || "Frequently Asked Question",
    answer: item.answer?.trim() || "Detailed explanation of the healthcare solution.",
    iconKey: item.iconKey || "medical",
  };
  const updated = [...current, newItem];
  saveAllFaqs(updated);
  return updated;
};

export const updateFaq = (id, updatedFields) => {
  const current = getAllFaqs();
  const updated = current.map((item) =>
    item.id === id ? { ...item, ...updatedFields } : item
  );
  saveAllFaqs(updated);
  return updated;
};

export const deleteFaq = (id) => {
  const current = getAllFaqs();
  if (current.length <= 1) {
    return {
      success: false,
      message: "At least one FAQ item must remain on the homepage.",
      faqs: current,
    };
  }
  const updated = current.filter((item) => item.id !== id);
  saveAllFaqs(updated);
  return {
    success: true,
    faqs: updated,
  };
};

export const resetFaqs = () => {
  try {
    localStorage.removeItem(FAQS_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("rhs_faqs_updated", { detail: DEFAULT_FAQS })
    );
    return DEFAULT_FAQS;
  } catch (error) {
    console.error("Failed to reset FAQs:", error);
    return DEFAULT_FAQS;
  }
};