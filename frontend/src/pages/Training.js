import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Training = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-28 pb-20 px-4" data-testid="training-page">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <img 
              src="/images/your-excuses-v2.webp" 
              alt="Your Excuses Are Your Own" 
              className="max-w-4xl mx-auto w-full px-4"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">TRAINING AT TC PRO DOJO</h1>
          <div className="gradient-border mx-auto w-24 mb-12"></div>
        </div>

        {/* Two Column Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Step into the Ring */}
          <div className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">Step into the Ring!</h2>
            <div className="text-gray-300 text-lg leading-relaxed space-y-4">
              <p>We welcome students of ALL levels.</p>
              <p>Qualified instructors in a safe learning environment.</p>
              <p>Whether you want to go PRO, get in shape or just experience the thrill of wrestling training, we've got a program for you.</p>
            </div>
          </div>

          {/* Why Train With Us */}
          <div className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">Why Train With Us?</h2>
            <div className="text-gray-300 text-lg leading-relaxed space-y-2">
              <p>Emphasis on the fundamentals of professional wrestling, all fitness levels welcome.</p>
              <p>Flexible class schedules.</p>
              <p>Build confidence, strength, and showmanship.</p>
              <p>Expert coaching from professional wrestlers.</p>
              <p>Safe, professional training facility.</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-black border border-blue-500/20 rounded-lg p-10 mb-12">
          <h2 className="text-4xl font-bold text-white torture-text mb-6 text-center">HOW IT WORKS</h2>
          <p className="text-gray-300 text-xl leading-relaxed text-center">
            Send a message to our team, they will reach out to answer your questions and discuss your goals.
          </p>
        </div>

        {/* Curriculum Section */}
        <div className="bg-black border border-blue-500/20 rounded-lg p-10 mb-12">
          <h2 className="text-4xl font-bold text-white torture-text mb-8 text-center">Curriculum</h2>
          
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Safe break falls, footwork, lockups, holds, submissions, take downs, and body throws. 
              Basic training, cardio and core strength, stretches and practice routines.
            </p>
            
            <p>
              Match structure, timing and positioning, ring psychology, tag dynamics, high spots, 
              chain wrestling and reversals and finishes.
            </p>
            
            <p>
              Mic skills, character development, media training for interviews TV/social. 
              Working a televised match, Industry tryouts, bookings, touring prep and agent showcases through our network.
            </p>
          </div>
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 border-2 border-blue-500 rounded-lg p-10 text-center">
          <p className="text-gray-300 text-xl mb-6">
            All levels are welcome, everyone starts somewhere!
          </p>
          <Link
            to="/contact"
            className="inline-block px-16 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-2xl rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50"
            data-testid="training-cta-button"
          >
            Let's go!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Training;