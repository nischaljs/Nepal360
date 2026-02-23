import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCampaignMapData, type CampaignMapItem } from '../services/map.service';
import { Button } from '../components/ui/button';

// Fix default marker icon issue with leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createCustomIcon = (category: string) => {
  const colors: Record<string, string> = {
    education: '#3b82f6',
    health: '#ef4444',
    disaster: '#f59e0b',
    community: '#8b5cf6',
    animals: '#10b981',
    arts: '#ec4899',
    business: '#6366f1',
    emergency: '#dc2626',
    general: '#059669',
  };
  const color = colors[category] || colors.general;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 14px;
        font-weight: bold;
      ">N</div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const CampaignMap = () => {
  const [campaigns, setCampaigns] = useState<CampaignMapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    document.title = 'Campaign Map | Nepal360';
    getCampaignMapData()
      .then(setCampaigns)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['all', ...new Set(campaigns.map((c) => c.category))];
  const filtered = selectedCategory === 'all'
    ? campaigns
    : campaigns.filter((c) => c.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Map</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Discover campaigns across Nepal - {filtered.length} active campaigns
              </p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[calc(100vh-220px)]">
        <MapContainer
          center={[28.3949, 84.1240]}
          zoom={7}
          className="h-full w-full z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map((campaign) => (
            <Marker
              key={campaign.id}
              position={[campaign.lat, campaign.lng]}
              icon={createCustomIcon(campaign.category)}
            >
              <Popup>
                <div className="w-64 p-1">
                  <img
                    src={campaign.coverImage}
                    alt={campaign.title}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-bold text-sm text-gray-900 mb-1">{campaign.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <MapPin className="w-3 h-3" />
                    {campaign.district}
                    <span className="ml-auto px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                      {campaign.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    by {campaign.beneficiary} &bull; {campaign.donationCount} donations
                  </p>
                  <p className="text-sm font-bold text-emerald-600 mb-2">
                    Target: NPR {Number(campaign.targetAmount).toLocaleString()}
                  </p>
                  <Link to={`/campaigns/${campaign.id}`}>
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                      View Campaign <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default CampaignMap;
