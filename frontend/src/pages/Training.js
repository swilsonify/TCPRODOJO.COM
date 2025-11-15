import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Training = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    window.scrollTo(0, 0);
    loadTips();
  }, []);

  const loadTips = async () => {
    try {
      const response = await axios.get(`${API}/api/tips`);
      setTips(response.data);
    } catch (error) {
      console.error('Error loading tips:', error);
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Curriculum Section */}
        <div className="bg-black border border-blue-500/20 rounded-lg p-10 mb-12">
          <h2 className="text-4xl font-bold text-white torture-text mb-8 text-center">Training Curriculum:</h2>
          
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

        {/* CTA Box with How It Works */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 border-2 border-blue-500 rounded-lg p-10 text-center mb-20">
          <h2 className="text-4xl font-bold text-white torture-text mb-6">HOW IT WORKS</h2>
          <p className="text-gray-300 text-xl leading-relaxed mb-6">
            Send a message to our team, they will reach out to answer your questions and discuss your goals.
          </p>
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

        {/* TIPS & TECHNIQUES SECTION */}
        <div className="mb-20">
          <h2 className="text-5xl font-bold text-white torture-text text-center mb-4">TIPS & TECHNIQUES</h2>
          <div className="gradient-border mx-auto w-24 mb-12"></div>

          {loading ? (
            <div className="text-center text-gray-400">Loading tips...</div>
          ) : tips.length === 0 ? (
            <div className="text-center text-gray-400">No tips available yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tips.map((tip, index) => (
                <div
                  key={tip.id || index}
                  className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg overflow-hidden hover-lift"
                  data-testid={`tip-${index}`}
                >
                  {/* Video - Square Frame */}
                  <div className="aspect-square bg-gradient-to-br from-blue-900 to-black flex items-center justify-center">
                    {tip.videoUrl ? (
                      <iframe
                        className="w-full h-full"
                        src={tip.videoUrl}
                        title={tip.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="text-center p-8">
                        <svg className="w-16 h-16 mx-auto mb-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        <span className="text-gray-500 text-sm">Video Coming Soon</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{tip.title}</h3>
                    {tip.description && (
                      <p className="text-gray-400 text-sm">{tip.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Training;