import { Link } from "react-router-dom";
import { Shield, TrendingUp, Users, Heart, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12">
        <Link to="/" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 mb-8">
          <ArrowLeft size={20} /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Nepal360</h1>
        
        <section className="mb-16">
          <div className="bg-emerald-50 rounded-3xl p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Nepal360 is dedicated to connecting compassionate hearts with verified causes across Nepal.
              We believe in the power of community to create meaningful change, which is why we've built
              a platform that ensures transparency, trust, and impact in every donation.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Nepal360 Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Create or Discover</h3>
              <p className="text-gray-600">
                Organizers can create verified campaigns, while donors can browse causes that resonate with them.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. Contribute</h3>
              <p className="text-gray-600">
                Make a difference through monetary donations or by pledging essential items.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Track Impact</h3>
              <p className="text-gray-600">
                Follow the journey of your contribution and see the real-world impact you're making.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Trust & Safety</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
              <Shield className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">100% Verified Campaigns</h3>
                <p className="text-gray-600">
                  Every campaign undergoes a strict verification process to ensure authenticity.
                  Our team reviews each submission before it goes live.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
              <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">KYC-Approved Beneficiaries</h3>
                <p className="text-gray-600">
                  All campaign organizers must complete KYC verification, ensuring that funds
                  reach legitimate and verified beneficiaries.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
              <TrendingUp className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Full Transparency</h3>
                <p className="text-gray-600">
                  Track every rupee with our detailed reporting system. Campaign updates
                  and proof documents are available for all donors.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
              <Users className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Community Driven</h3>
                <p className="text-gray-600">
                  Our platform is built on trust and community. Join thousands of
                  Nepalese making a difference together.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 bg-gray-900 rounded-3xl p-8 lg:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Nepal360 Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <p className="text-4xl font-bold text-emerald-400 mb-2">500+</p>
              <p className="text-gray-400">Verified Campaigns</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-400 mb-2">10,000+</p>
              <p className="text-gray-400">Active Donors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-400 mb-2">NPR 5Cr+</p>
              <p className="text-gray-400">Funds Raised</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-400 mb-2">50+</p>
              <p className="text-gray-400">Districts Reached</p>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of changemakers and help create lasting impact across Nepal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/campaigns">
              <Button size="lg" className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                Explore Campaigns
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="h-12 px-8 border-gray-300 text-gray-700 rounded-xl font-bold">
                Join Nepal360
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
