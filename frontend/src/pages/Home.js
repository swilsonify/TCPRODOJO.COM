import { Link } from 'react-router-dom';
import { Dumbbell, Users, Trophy, Calendar } from 'lucide-react';
import { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: Dumbbell,
      title: 'Professional Training',
      description: 'Learn from experienced pros who have competed at the highest levels of professional wrestling.'
    },
    {
      icon: Users,
      title: 'Small Class Sizes',
      description: 'Personal attention in every session. We keep our classes small to ensure quality instruction.'
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

  const testimonials = [
    {
      name: 'Mike "The Hammer" Rodriguez',
      role: 'Professional Wrestler',
      text: 'Training at Torture Chamber transformed my career. The dedication and expertise of the coaches is unmatched. I went from amateur to pro in just two years.'
    },
    {
      name: 'Sarah Chen',
      role: 'Fitness Enthusiast',
      text: 'I joined to get in shape and ended up finding a passion I never knew I had. The community here is supportive and welcoming to all skill levels.'
    },
    {
      name: 'James Williams',
      role: 'Beginner Student',
      text: 'Never thought I could do this at my age, but the coaches made me feel comfortable from day one. Best decision I ever made for my confidence and fitness.'
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
              Founded by coach, promoter and professional wrestler Rodney Kellman (aka Dru Onyx / Soa Amin), Torture Chamber Pro Wrestling Dojo delivers 
              a complete journey - from fundamentals to televised performance. Our top grads tour globally and work across radio, TV and film. 
              In 2025, we celebrate our 21st anniversary and we're recruiting the next wave of professional wrestlers.
            </p>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center hover-lift">
                <div className="text-gray-600 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Training Action</span>
                </div>
              </div>
              <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center hover-lift">
                <div className="text-gray-600 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Ring Work</span>
                </div>
              </div>
              <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center hover-lift">
                <div className="text-gray-600 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Champions</span>
                </div>
              </div>
              <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center hover-lift">
                <div className="text-gray-600 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Performance</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-3">
            <Link
              to="/classes"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-all hover-lift"
              data-testid="view-classes-button"
            >
              VIEW CLASS SCHEDULE
            </Link>
            <Link
              to="/training"
              className="px-8 py-4 bg-transparent border-2 border-blue-500 hover:bg-blue-500 text-white font-bold rounded-lg text-lg transition-all hover-lift"
              data-testid="get-started-button"
            >
              GET STARTED
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-black/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white torture-text mb-4">WHY TRAIN WITH US</h2>
            <div className="gradient-border mx-auto w-24 mb-6"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We've been building champions for over two decades. Here's what sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-black border border-blue-500/20 rounded-lg p-6 hover-lift"
                data-testid={`feature-${index}`}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
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
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-8 hover-lift"
                data-testid={`testimonial-${index}`}
              >
                <div className="text-blue-500 text-5xl mb-4">"</div>
                <p className="text-gray-300 mb-6 italic">{testimonial.text}</p>
                <div>
                  <div className="text-white font-bold">{testimonial.name}</div>
                  <div className="text-blue-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
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