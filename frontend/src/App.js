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
import Media from '@/pages/Media';
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
import AdminMedia from '@/pages/admin/AdminMedia';
import AdminSiteSettings from '@/pages/admin/AdminSiteSettings';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminFAQ from '@/pages/admin/AdminFAQ';

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
          <Route path="pros" element={<Pros />} />
          <Route path="shop" element={<Shop />} />
          <Route path="contact" element={<Contact />} />
          <Route path="media" element={<Media />} />
        </Route>

        {/* Admin Routes (No Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
