import { useState } from "react";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";

// MUI Category Icons
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PersonIcon from "@mui/icons-material/Person";
import BuildIcon from "@mui/icons-material/Build";
import DescriptionIcon from "@mui/icons-material/Description";
import PublicIcon from "@mui/icons-material/Public";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

// Storage helpers
import {
  getAllFaqs,
  addFaq,
  updateFaq,
  deleteFaq,
  resetFaqs,
  FAQ_ICON_OPTIONS,
} from "../../utils/faqStorage";

// Icon mapping for quick rendering
const FAQ_ICON_MAP = {
  medical: <MedicalServicesIcon fontSize="small" />,
  verified: <VerifiedUserIcon fontSize="small" />,
  person: <PersonIcon fontSize="small" />,
  build: <BuildIcon fontSize="small" />,
  description: <DescriptionIcon fontSize="small" />,
  public: <PublicIcon fontSize="small" />,
  support: <ContactSupportIcon fontSize="small" />,
  hospital: <LocalHospitalIcon fontSize="small" />,
};

/**
 * FaqsTab Component
 * Simple, beginner-friendly component to manage FAQ questions and answers.
 * Supports: Expandable accordion preview, Adding questions, Editing, and Deleting.
 */
function FaqsTab({ faqs, setFaqs, showNotify }) {
  // Currently opened accordion item ID in the preview
  const [previewOpenId, setPreviewOpenId] = useState(null);

  // Modal states
  const [editingFaq, setEditingFaq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // -------------------------------------------------------------
  // 1. OPEN MODAL FOR NEW FAQ
  // -------------------------------------------------------------
  const openNewFaqModal = () => {
    setEditingFaq({
      id: "new",
      question: "What types of healthcare products do you offer?",
      answer:
        "We offer a wide range of advanced medical devices and equipment including Bipolar Plasma Generators, Diode Lasers, Endoscopy Systems, Flexible Video URS and more.",
      iconKey: "medical",
    });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 2. OPEN MODAL FOR EDITING
  // -------------------------------------------------------------
  const openEditFaqModal = (item) => {
    setEditingFaq({ ...item });
    setIsModalOpen(true);
  };

  // -------------------------------------------------------------
  // 3. SAVE FAQ (ADD OR UPDATE)
  // -------------------------------------------------------------
  const handleSaveFaq = (e) => {
    e.preventDefault();
    if (!editingFaq) return;

    if (editingFaq.id === "new") {
      const updatedList = addFaq(editingFaq);
      setFaqs(updatedList);
      showNotify("New FAQ question added successfully!");
    } else {
      const updatedList = updateFaq(editingFaq.id, editingFaq);
      setFaqs(updatedList);
      showNotify("FAQ question updated successfully!");
    }

    setIsModalOpen(false);
    setEditingFaq(null);
  };

  // -------------------------------------------------------------
  // 4. DELETE FAQ
  // -------------------------------------------------------------
  const handleDeleteFaq = (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this FAQ question?"
    );
    if (!isConfirmed) return;

    const result = deleteFaq(id);
    if (result.success) {
      setFaqs(result.faqs);
      if (editingFaq?.id === id) setEditingFaq(null);
      showNotify("FAQ question deleted successfully.");
    } else {
      showNotify(result.message, "error");
    }
  };

  // -------------------------------------------------------------
  // 5. RESET FAQS TO DEFAULTS
  // -------------------------------------------------------------
  const handleResetFaqs = () => {
    const isConfirmed = window.confirm(
      "Reset all FAQ questions to factory default list?"
    );
    if (!isConfirmed) return;

    const defaults = resetFaqs();
    setFaqs(defaults);
    setEditingFaq(null);
    showNotify("FAQ questions reset to original defaults.");
  };

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpOutlineOutlinedIcon className="text-primary" />
            Homepage FAQ Questions & Answers ({faqs.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the questions and answers shown in the interactive FAQ accordion on the live homepage.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetFaqs}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          >
            <RestartAltOutlinedIcon style={{ fontSize: 18 }} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={openNewFaqModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
          >
            <AddCircleOutlineIcon style={{ fontSize: 18 }} />
            <span>Add FAQ Question</span>
          </button>
        </div>
      </div>

      {/* Accordion Items List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = previewOpenId === faq.id;
          const topicOption = FAQ_ICON_OPTIONS.find((o) => o.id === faq.iconKey);

          return (
            <div
              key={faq.id || index}
              className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? "border-primary/40 bg-white shadow-md shadow-primary/5 ring-1 ring-primary/20"
                  : "border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs"
              }`}
            >
              {/* Question Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
                <div
                  onClick={() => setPreviewOpenId(isOpen ? null : faq.id)}
                  className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0 cursor-pointer select-none"
                >
                  {/* Topic Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                      isOpen
                        ? "bg-primary text-white shadow-xs"
                        : "bg-[#EDF7FF] text-primary"
                    }`}
                  >
                    {FAQ_ICON_MAP[faq.iconKey] || (
                      <MedicalServicesIcon fontSize="small" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        #{index + 1}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary-dark">
                        {topicOption ? topicOption.label : "Medical FAQ"}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {faq.question}
                    </h4>
                  </div>
                </div>

                {/* Actions: Toggle Preview, Edit, Delete */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setPreviewOpenId(isOpen ? null : faq.id)}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    title={isOpen ? "Collapse answer" : "Expand answer preview"}
                  >
                    <span>{isOpen ? "Hide" : "Preview"}</span>
                    <ExpandMoreIcon
                      style={{ fontSize: 16 }}
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditFaqModal(faq)}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition shadow-2xs cursor-pointer"
                    title="Edit Question & Answer"
                  >
                    <EditNoteOutlinedIcon style={{ fontSize: 16 }} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    disabled={faqs.length <= 1}
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="rounded-xl border border-rose-200 bg-rose-50/50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={
                      faqs.length <= 1
                        ? "At least one FAQ item must remain"
                        : "Delete FAQ"
                    }
                  >
                    <DeleteOutlinedIcon style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>

              {/* Collapsible Answer Body */}
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:pl-18 animate-fade-in">
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                    {faq.answer}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Live on Homepage Accordion</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT FAQ QUESTION                            */}
      {/* ========================================================= */}
      {isModalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingFaq.id === "new"
                    ? "Add New FAQ Question"
                    : "Edit FAQ Question & Answer"}
                </h3>
                <p className="text-xs text-slate-500">
                  Will update the accordion in the FAQ section on the live homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingFaq(null);
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="mt-6 space-y-4">
              {/* Question Category / Icon */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Question Category & Icon
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FAQ_ICON_OPTIONS.map((opt) => {
                    const isSelected = editingFaq.iconKey === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setEditingFaq((prev) => ({
                            ...prev,
                            iconKey: opt.id,
                          }))
                        }
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary-dark ring-2 ring-primary/20"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-primary shrink-0">
                          {FAQ_ICON_MAP[opt.id] || (
                            <MedicalServicesIcon fontSize="small" />
                          )}
                        </span>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Question Text
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.question || ""}
                  onChange={(e) =>
                    setEditingFaq((prev) => ({
                      ...prev,
                      question: e.target.value,
                    }))
                  }
                  placeholder="e.g. What types of healthcare products do you offer?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Answer Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Answer
                </label>
                <textarea
                  rows={5}
                  required
                  value={editingFaq.answer || ""}
                  onChange={(e) =>
                    setEditingFaq((prev) => ({
                      ...prev,
                      answer: e.target.value,
                    }))
                  }
                  placeholder="Provide a comprehensive answer to inform potential clients..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-slate-900 focus:border-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Form Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingFaq(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg transition cursor-pointer"
                >
                  Save FAQ Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FaqsTab;
