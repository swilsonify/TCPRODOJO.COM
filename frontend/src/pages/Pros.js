import { useEffect, useState } from 'react';
import axios from 'axios';
import { Award, Users as UsersIcon, Trophy } from 'lucide-react';

const Pros = () => {
  const [successStories, setSuccessStories] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storiesRes, endorsementsRes, coachesRes] = await Promise.all([
        axios.get(`${API}/api/success-stories`),
        axios.get(`${API}/api/endorsements`),
        axios.get(`${API}/api/coaches`)
      ]);
      
      setSuccessStories(storiesRes.data);
      setEndorsements(endorsementsRes.data);
      setCoaches(coachesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4" data-testid="pros-page">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">SUCCESS</h1>
          <div className="gradient-border mx-auto w-24 mb-6"></div>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Meet the champions we've built and the world-class coaches who train them.
          </p>
        </div>

        {/* SUCCESS STORIES SECTION */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-400 mb-4">SUCCESS STORIES</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our students compete on the biggest stages around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {successStories.map((graduate, index) => (
              <div
                key={index}
                className="bg-black border border-blue-500/20 rounded-lg p-6 hover-lift"
                data-testid={`graduate-${index}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="text-blue-500" size={32} />
                  <span className="text-xs text-gray-500">Class of {graduate.yearGraduated}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{graduate.name}</h3>
                <div className="text-blue-400 text-sm font-semibold mb-1">{graduate.promotion}</div>
                <div className="text-gray-400 text-sm mb-3">{graduate.achievement}</div>
                
                <p className="text-gray-300 text-sm">{graduate.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TC ENDORSEMENTS SECTION */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-400 mb-4">TC ENDORSEMENTS</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Hear from industry professionals about Torture Chamber Pro Wrestling Dojo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {endorsements.map((endorsement, index) => (
              <div
                key={index}
                className="bg-black border border-blue-500/20 rounded-lg overflow-hidden hover-lift"
                data-testid={`endorsement-${index}`}
              >
                {/* Video Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-blue-900 to-black flex items-center justify-center">
                  {endorsement.videoUrl ? (
                    <iframe
                      className="w-full h-full border-4 border-blue-500 rounded-lg"
                      src={endorsement.videoUrl}
                      title={endorsement.title}
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
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{endorsement.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COACHES SECTION */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-400 mb-4">OUR COACHES</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Learn from experienced professionals who have competed at the highest levels and are dedicated to developing the next generation.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {coaches.map((trainer, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg overflow-hidden hover-lift flex flex-col md:flex-row"
                data-testid={`trainer-${index}`}
              >
                {/* Image Placeholder */}
                <div className="w-full md:w-1/3 bg-gradient-to-br from-blue-900 to-black flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-blue-500/20 border-4 border-blue-500 flex items-center justify-center mb-4">
                      <UsersIcon size={64} className="text-blue-500" />
                    </div>
                    <div className="text-blue-400 font-semibold">{trainer.experience}</div>
                    <div className="text-gray-400 text-sm">Experience</div>
                  </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-2/3 p-8">
                  <div className="mb-4">
                    <h2 className="text-3xl font-bold text-white mb-2">{trainer.name}</h2>
                    {trainer.aka && (
                      <div className="text-blue-400 text-sm mb-1">aka {trainer.aka}</div>
                    )}
                    <div className="text-blue-400 font-semibold mb-1">{trainer.title}</div>
                    <div className="text-gray-400 text-sm">
                      <span className="font-semibold">Specialty:</span> {trainer.specialty}
                    </div>
                  </div>

                  <p className="text-gray-300 mb-6">{trainer.bio}</p>

                  <div>
                    <div className="flex items-center space-x-2 text-blue-400 font-semibold mb-3">
                      <Award size={20} />
                      <span>Key Achievements</span>
                    </div>
                    <ul className="space-y-2">
                      {trainer.achievements.map((achievement, aIndex) => (
                        <li key={aIndex} className="text-gray-400 flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Them?</h2>
          <p className="text-blue-100 mb-6">
            Train with the best coaches and join our legacy of professional wrestlers. Your journey starts here.
          </p>
          <a
            href="/training"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded hover:bg-gray-100 transition-colors"
            data-testid="cta-training-button"
          >
            START TRAINING TODAY
          </a>
        </div>
      </div>
    </div>
  );
};

export default Pros;