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
import AdminTrainers from '@/pages/admin/AdminTrainers';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminContacts from '@/pages/admin/AdminContacts';
import AdminGallery from '@/pages/admin/AdminGallery';
import AdminCoaches from '@/pages/admin/AdminCoaches';
import AdminSuccessStories from '@/pages/admin/AdminSuccessStories';
import AdminEndorsements from '@/pages/admin/AdminEndorsements';
import AdminMediaLibrary from '@/pages/admin/AdminMediaLibrary';

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
          <Route path="pros" element={<Pros />} />
          <Route path="shop" element={<Shop />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin Routes (No Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/trainers" element={<AdminTrainers />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/admin/contacts" element={<AdminContacts />} />
        <Route path="/admin/gallery" element={<AdminGallery />} />
        <Route path="/admin/coaches" element={<AdminCoaches />} />
        <Route path="/admin/success-stories" element={<AdminSuccessStories />} />
        <Route path="/admin/endorsements" element={<AdminEndorsements />} />
        <Route path="/admin/media" element={<AdminMediaLibrary />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;