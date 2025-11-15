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
          <div className="gradient-border mx-auto w-24 mb-8"></div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg p-10 mb-12">
          <h2 className="text-4xl font-bold text-blue-400 mb-6 text-center">How it works.</h2>
          <p className="text-gray-300 text-xl leading-relaxed text-center">
            Send a message to our team, they will reach out to answer your questions and discuss your goals. 
            All levels are welcome, everyone starts somewhere!
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

        {/* CTA Button */}
        <div className="text-center">
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