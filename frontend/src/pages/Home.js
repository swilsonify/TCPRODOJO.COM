import { Link } from 'react-router-dom';
import { Dumbbell, Users, Trophy, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    window.scrollTo(0, 0);
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const response = await axios.get(`${API}/api/testimonials`);
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      // Fallback to empty array if API fails
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Dumbbell,
      title: 'Professional Training',
      description: 'Learn from experienced pros who have competed at the highest levels of professional wrestling.'
    },
    {
      icon: Trophy,
      title: 'Championship Results',
      description: 'Our graduates have gone on to compete in major promotions worldwide since 2004.'
    },
    {
      icon: Calendar,
      title: 'Flexible Schedule',
      description: 'Multiple class times throughout the week to fit your training into your busy life.'
    }
  ];

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-pattern pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          {/* Complete Logo */}
          <div className="mb-8 animate-fade-in-up">
            <img 
              src="/images/homepage-logo.jpg" 
              alt="Torture Chamber Pro Wrestling Dojo" 
              className="max-w-2xl mx-auto w-full px-4"
              style={{
                mixBlendMode: 'lighten',
                opacity: 0.92
              }}
            />
          </div>

          <div className="max-w-5xl mx-auto mb-12 animate-fade-in-up stagger-2">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">BUILT FOR CHAMPIONS.</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-blue-400 mb-8">Montreal's International Pro Wrestling School</h3>
            <p className="text-gray-300 text-lg leading-relaxed mb-12">
              Founded by coach, promoter and professional wrestler Dru Onyx, Torture Chamber Pro Wrestling Dojo delivers 
              a complete journey - from fundamentals to televised performance. Our top grads tour globally and work across radio, TV and film. 
              In 2025, we celebrate our 21st anniversary and we're recruiting the next wave of professional wrestlers.
            </p>

            {/* YouTube Video Embed */}
            <div className="mb-12">
              <div className="relative w-full border-4 border-blue-500 rounded-lg shadow-2xl" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/H7MbxBp7zvA?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&loop=1&playlist=H7MbxBp7zvA"
                  title="Torture Chamber Pro Wrestling Dojo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training at TC Pro Dojo Section */}
      <section className="py-20 px-4 bg-black/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">TRAINING AT TC PRO DOJO</h2>
            <div className="gradient-border mx-auto w-24 mb-12"></div>
          </div>

          {/* Two Column Info Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step into the Ring */}
            <div className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-8">
              <h3 className="text-3xl font-bold text-blue-400 mb-6 text-center">Step into the Ring!</h3>
              <div className="text-gray-300 text-lg leading-relaxed space-y-4 text-center">
                <p>We welcome students of ALL levels.</p>
                <p>Qualified instructors in a safe learning environment.</p>
                <p>Whether you want to go PRO, get in shape or just experience the thrill of wrestling training, we've got a program for you.</p>
              </div>
            </div>

            {/* Why Train With Us */}
            <div className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-8">
              <h3 className="text-3xl font-bold text-blue-400 mb-6 text-center">Why Train With Us?</h3>
              <div className="text-gray-300 text-lg leading-relaxed space-y-2 text-center">
                <p>Emphasis on the fundamentals of professional wrestling, all fitness levels welcome.</p>
                <p>Flexible class schedules.</p>
                <p>Build confidence, strength, and showmanship.</p>
                <p>Expert coaching from professional wrestlers.</p>
                <p>Safe, professional training facility.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white torture-text mb-4">TESTIMONIALS</h2>
            <div className="gradient-border mx-auto w-24 mb-6"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Hear from our students - from beginners to professionals, everyone has a story.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center text-gray-400">Loading testimonials...</div>
            ) : testimonials.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400">No testimonials available yet.</div>
            ) : (
              testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id || index}
                  className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg overflow-hidden hover-lift"
                  data-testid={`testimonial-${index}`}
                >
                  {/* Square Photo */}
                  {testimonial.photoUrl && (
                    <div className="w-80 h-80 mx-auto mt-6">
                      <img 
                        src={testimonial.photoUrl} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover rounded-lg aspect-square"
                      />
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="text-blue-500 text-5xl mb-4">"</div>
                    <p className="text-gray-300 mb-6 italic">{testimonial.text}</p>
                    <div>
                      <div className="text-white font-bold">{testimonial.name}</div>
                      <div className="text-blue-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-blue-950">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white torture-text mb-6">READY TO BECOME A CHAMPION?</h2>
          <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
            Join the next generation of professional wrestlers. Your journey starts here.
          </p>
          <Link
            to="/training"
            className="inline-block px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xl transition-all hover-lift"
            data-testid="cta-contact-button"
          >
            START YOUR JOURNEY
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;