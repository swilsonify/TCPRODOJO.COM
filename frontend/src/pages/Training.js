import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const Training = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const wrestlingPrograms = [
    {
      title: 'Advanced',
      subtitle: 'Curriculum',
      price: '$250/month',
      pricingOptions: [
        { label: 'ANNUAL FEE', price: '$2,000' },
        { label: '6 MONTHS', price: '$1,150' },
        { label: '3 MONTHS', price: '$575' }
      ],
      curriculum: [
        'Match structure, timing and positioning, ring psychology, tag dynamics, high spots, chain wrestling and reversals and finishes.'
      ],
      additionalInfo: 'Join the TC team with real wrestling in the field opportunities.',
      note: 'Coach placement required'
    },
    {
      title: 'Beginner',
      subtitle: 'ALL AGES',
      price: '$250/month',
      dropIn: 'DROP IN FEE - $50',
      trial: 'TWO WEEK TRIAL - $100',
      additionalInfo: 'Unlimited access to all classes at the DOJO. %15 Discount on merch.',
      curriculum: [
        'Safe break falls, footwork, lockups, holds, submissions, take downs, and body throws.',
        'Basic training, cardio and core strength, stretches and practice routines.'
      ],
      note: 'Sign up here →',
      popular: true
    },
    {
      title: 'Pro Pathway',
      subtitle: 'Promotional Kit Development',
      price: 'Invite Only',
      curriculum: [
        'Mic skills, character development, media training for interviews TV/social.',
        'Working a televised match, Industry tryouts, bookings, touring prep and agent showcases through our network.'
      ],
      note: 'Invite Only'
    }
  ];

  const privateClasses = {
    title: 'PRIVATE CLASSES',
    subtitle: 'PRO WRESTLING & BOXING',
    pricingOptions: [
      { label: 'ONE SESSION', price: '$100' },
      { label: '2 SESSIONS', price: '$150' },
      { label: '4 SESSIONS', price: '$250' }
    ],
    additionalInfo: '3 Month, 6 Month, & 12 Month Private Training rates available upon request.'
  };

  return (
    <div className="pt-28 pb-20 px-4" data-testid="training-page">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <img 
              src="/images/your-excuses-v2.webp" 
              alt="Your Excuses Are Your Own" 
              className="max-w-4xl mx-auto w-full px-4"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">TRAINING PROGRAMS</h1>
          <div className="gradient-border mx-auto w-24 mb-8"></div>
          
          {/* Step into the Ring */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-blue-400 mb-6">Step into the Ring!</h2>
            <div className="text-gray-300 text-xl space-y-2">
              <p>We welcome students of ALL levels.</p>
              <p>Qualified instructors in a safe learning environment.</p>
              <p>Whether you want to go PRO, get in shape or just experience the thrill of wrestling training, we've got a program for you.</p>
            </div>
          </div>

          {/* Why Train With Us */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-blue-400 mb-6">Why Train With Us?</h2>
            <div className="text-gray-300 text-lg space-y-1">
              <p>Emphasis on the fundamentals of professional wrestling, all fitness levels welcome.</p>
              <p>Flexible class schedules.</p>
              <p>Build confidence, strength, and showmanship.</p>
              <p>Expert coaching from professional wrestlers.</p>
              <p>Safe, professional training facility.</p>
            </div>
          </div>
        </div>

        {/* PRO WRESTLING CLASSES */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white torture-text text-center mb-12">PRO WRESTLING CLASSES</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
            {wrestlingPrograms.map((program, index) => (
              <div
                key={index}
                className={`bg-black border rounded-lg p-8 hover-lift relative ${
                  program.popular ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-blue-500/20'
                }`}
                data-testid={`wrestling-program-${index}`}
              >
                {program.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-white mb-1">{program.title}</h3>
                  <div className="text-blue-400 text-sm font-semibold mb-4">{program.subtitle}</div>
                  <div className="text-4xl font-bold text-white mb-4">{program.price}</div>
                  
                  {program.pricingOptions && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {program.pricingOptions.map((option, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-white font-bold text-lg">{option.price}</div>
                          <div className="text-gray-400 text-xs">{option.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {program.dropIn && (
                    <div className="text-gray-300 text-sm mb-2">{program.dropIn} / {program.trial}</div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="text-blue-400 font-semibold mb-3">Curriculum:</div>
                  <div className="space-y-2">
                    {program.curriculum.map((item, idx) => (
                      <p key={idx} className="text-gray-300 text-sm">{item}</p>
                    ))}
                  </div>
                </div>

                {program.additionalInfo && (
                  <p className="text-gray-300 text-sm mb-4">{program.additionalInfo}</p>
                )}

                <div className="text-center mt-6">
                  <Link
                    to="/contact"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
                    data-testid={`enroll-wrestling-${index}-button`}
                  >
                    {program.note || 'SIGN UP NOW'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRIVATE CLASSES */}
        <div className="mb-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-900/40 to-blue-950/60 border-2 border-blue-500 rounded-lg p-10 shadow-2xl shadow-blue-500/30 relative overflow-hidden">
            {/* Premium Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg">
                ⭐ PREMIUM TRAINING
              </span>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">{privateClasses.title}</h2>
                <div className="text-blue-400 text-lg font-semibold mb-8">{privateClasses.subtitle}</div>
                
                <div className="inline-block bg-black/40 border border-blue-500/30 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-3 gap-6">
                    {privateClasses.pricingOptions.map((option, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-blue-400 font-bold text-3xl mb-2">{option.price}</div>
                        <div className="text-gray-300 text-sm font-semibold">{option.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-6 mb-6">
                  <div className="text-gray-200 space-y-3">
                    <p className="text-lg">✓ One-on-one personalized coaching</p>
                    <p className="text-lg">✓ Flexible scheduling to fit your needs</p>
                    <p className="text-lg">✓ Accelerated skill development</p>
                    <p className="text-lg">✓ Custom training plans</p>
                  </div>
                </div>
                
                <div className="text-gray-300 text-sm mb-6">
                  <p className="font-semibold text-blue-300 mb-2">{privateClasses.additionalInfo}</p>
                  <p className="text-blue-400">Contact: druonyx@tcprodojo.com</p>
                </div>
              </div>

              <div className="text-center">
                <Link
                  to="/contact"
                  className="inline-block px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50"
                  data-testid="enroll-private-button"
                >
                  BOOK YOUR PRIVATE SESSION →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;