const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-emerald-600 mb-3">Nepal360</h3>
            <p className="text-gray-600 max-w-md">
              Empowering communities through transparent and trustworthy crowdfunding. 
              Together, we build a better tomorrow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/campaigns" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Campaigns
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Nepal360. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Facebook
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Twitter
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;