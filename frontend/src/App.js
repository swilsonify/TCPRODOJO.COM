import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Training from '@/pages/Training';
import Classes from '@/pages/Classes';
import Events from '@/pages/Events';
import Pros from '@/pages/Pros';
import Shop from '@/pages/Shop';
import Contact from '@/pages/Contact';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminContacts from '@/pages/admin/AdminContacts';
import AdminCoaches from '@/pages/admin/AdminCoaches';
import AdminSuccessStories from '@/pages/admin/AdminSuccessStories';
import AdminEndorsements from '@/pages/admin/AdminEndorsements';
import AdminTips from '@/pages/admin/AdminTips';
import AdminClassSchedule from '@/pages/admin/AdminClassSchedule';
import AdminNewsletterSubscriptions from '@/pages/admin/AdminNewsletterSubscriptions';
import AdminPastEvents from '@/pages/admin/AdminPastEvents';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="training" element={<Training />} />
          <Route path="classes" element={<Classes />} />
          <Route path="events" element={<Events />} />
          <Route path="success" element={<Pros />} />
          <Route path="pros" element={<Pros />} /> {/* Keep old URL for backwards compatibility */}
          <Route path="shop" element={<Shop />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin Routes (No Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/past-events" element={<AdminPastEvents />} />
        <Route path="/admin/trainers" element={<AdminTrainers />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/admin/contacts" element={<AdminContacts />} />
        <Route path="/admin/coaches" element={<AdminCoaches />} />
        <Route path="/admin/success-stories" element={<AdminSuccessStories />} />
        <Route path="/admin/endorsements" element={<AdminEndorsements />} />
        <Route path="/admin/tips" element={<AdminTips />} />
        <Route path="/admin/classes" element={<AdminClassSchedule />} />
        <Route path="/admin/newsletter" element={<AdminNewsletterSubscriptions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;