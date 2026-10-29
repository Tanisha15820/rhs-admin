import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import {
  HomepageBanner,
  MachineContent,
  Testimonials,
  FaqSection,
  Clients,
  BlogsArticles,
  NewsletterPage,
  ContactUsPage,
  ProductEnquiriesPage,
} from "./Pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Admin Routes - Default to Login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/admin" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Distinct /dashboard Routes */}
          <Route path="/dashboard" element={<AdminDashboard />}>
            {/* Temporarily defaulted to machine-content while homepage-banner is commented out */}
            <Route index element={<Navigate to="/dashboard/machine-content" replace />} />
            {/* <Route path="homepage-banner" element={<HomepageBanner />} /> */}
            <Route path="machine-content" element={<MachineContent />} />
            <Route path="machine-queries" element={<ProductEnquiriesPage />} />
            <Route path="product-enquiries" element={<ProductEnquiriesPage />} />
            <Route path="enquiries" element={<Navigate to="/dashboard/machine-queries" replace />} />
            <Route path="testimonials" element={<Testimonials />} />
            {/* <Route path="faq" element={<FaqSection />} /> */}
            <Route path="clients" element={<Clients />} />
            <Route path="blogs" element={<BlogsArticles />} />
            <Route path="newsletter" element={<NewsletterPage />} />
            <Route path="contact-us" element={<ContactUsPage />} />
            <Route path="contact" element={<Navigate to="/dashboard/contact-us" replace />} />
          </Route>

          {/* Legacy /admin/dashboard redirect */}
          <Route path="/admin/dashboard" element={<Navigate to="/dashboard/machine-content" replace />} />

          {/* Alternate /admin/* route redirects */}
          {/* <Route path="/admin/homepage-banner" element={<Navigate to="/dashboard/homepage-banner" replace />} /> */}
          <Route path="/admin/machine-content" element={<Navigate to="/dashboard/machine-content" replace />} />
          <Route path="/admin/machine-queries" element={<Navigate to="/dashboard/machine-queries" replace />} />
          <Route path="/admin/product-enquiries" element={<Navigate to="/dashboard/machine-queries" replace />} />
          <Route path="/admin/enquiries" element={<Navigate to="/dashboard/machine-queries" replace />} />
          <Route path="/admin/testimonials" element={<Navigate to="/dashboard/testimonials" replace />} />
          {/* <Route path="/admin/faq" element={<Navigate to="/dashboard/faq" replace />} /> */}
          <Route path="/admin/clients" element={<Navigate to="/dashboard/clients" replace />} />
          <Route path="/admin/blogs" element={<Navigate to="/dashboard/blogs" replace />} />
          <Route path="/admin/newsletter" element={<Navigate to="/dashboard/newsletter" replace />} />
          <Route path="/admin/contact-us" element={<Navigate to="/dashboard/contact-us" replace />} />
          <Route path="/admin/contact" element={<Navigate to="/dashboard/contact-us" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
