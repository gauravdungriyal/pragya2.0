import React, { useState } from 'react';
import { MapPin, Clock, Phone, Sparkles, Check, Navigation } from 'lucide-react';

interface LocationsSectionProps {
  onOpenBooking: (type?: string, title?: string) => void;
}

export const LocationsSection: React.FC<LocationsSectionProps> = ({ onOpenBooking }) => {
  const [activeLocation, setActiveLocation] = useState(0);

  const locations = [
    {
      id: 1,
      name: "The Lotus Main Sanctuary & Spa",
      address: "108 Serenity Way, Sanctuary Heights",
      city: "Downtown City Center",
      hours: "Mon - Sun: 06:00 AM - 09:30 PM",
      phone: "+1 (800) 772-4921",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1000&auto=format&fit=crop",
      amenities: [
        "2 Main Asana Practice Suites",
        "Peak Reformer Pilates Studio",
        "Contrast Hydrotherapy & Ice Plunge",
        "Infrared Detox Sauna",
        "Organic Ayurvedic Tea Lounge",
        "Manduka Eco-Mat & Towel Vault",
        "Private Member Lockers & Rain Showers"
      ]
    },
    {
      id: 2,
      name: "Oceanfront Beachfront Pavilion",
      address: "Beachside Promenade, Deck 4",
      city: "Coastal Sanctuary Shore",
      hours: "Sat - Sun: 06:30 AM - 11:00 AM",
      phone: "+1 (800) 772-4922",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
      amenities: [
        "Open-Air Oceanfront Deck",
        "Sunrise & Sunset Hatha Sessions",
        "Acoustic Sound Bath Lawn",
        "Cold-Pressed Juice Bar",
        "Direct Beach Access"
      ]
    },
    {
      id: 3,
      name: "Himalayan Retreat & Academy",
      address: "Mountain Crest Valley, Gate 2",
      city: "Himalayan Foothills Sanctuary",
      hours: "Seasonal Retreats & Trainings",
      phone: "+1 (800) 772-4923",
      image: "https://images.unsplash.com/photo-1512290900673-70024421191e?q=80&w=1000&auto=format&fit=crop",
      amenities: [
        "200h & 300h Teacher Training Halls",
        "Organic Farm-to-Table Dining",
        "Silent Meditation Forest Path",
        "Private Eco-Villas",
        "Ayurvedic Panchakarma Spa"
      ]
    }
  ];

  const loc = locations[activeLocation];

  return (
    <section id="locations" className="section" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px auto' }}>
          <span className="badge-pill badge-gold" style={{ marginBottom: '16px' }}>
            Sanctuary Locations
          </span>
          <h2 className="heading-1" style={{ color: '#272727', marginBottom: '18px' }}>
            Find Your Nearest Pragya Sanctuary
          </h2>
          <p className="subheadline">
            Step into peaceful, architectural havens designed with raw natural materials, botanical acoustics, and pure luxury amenities.
          </p>
        </div>

        {/* Location Selector Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}
        >
          {locations.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveLocation(idx)}
              style={{
                backgroundColor: activeLocation === idx ? '#944426' : '#FFFFFF',
                color: activeLocation === idx ? '#FFFFFF' : '#272727',
                border: '1px solid rgba(39,39,39,0.1)',
                borderRadius: '999px',
                padding: '12px 28px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Studio Showcase Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '32px',
            padding: '40px',
            boxShadow: 'var(--shadow-elevated)',
            border: '1px solid rgba(39,39,39,0.08)',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px'
          }}
          className="grid-md-2 locations-showcase-card"
        >
          {/* Left Details */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#944426', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                <Sparkles size={16} />
                <span>Sanctuary Location #{loc.id}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: '#272727', marginBottom: '20px', fontWeight: 500 }}>
                {loc.name}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', color: '#5A5854', fontSize: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={18} color="#944426" />
                  <span>{loc.address}, {loc.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={18} color="#944426" />
                  <span>{loc.hours}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone size={18} color="#944426" />
                  <span>{loc.phone}</span>
                </div>
              </div>

              {/* Amenities List */}
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '14px' }}>
                Sanctuary Amenities & Features:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '32px' }}>
                {loc.amenities.map((amenity) => (
                  <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#272727' }}>
                    <Check size={16} color="#9D9D48" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onOpenBooking('location', `Visit ${loc.name}`)}
                className="btn btn-secondary"
                style={{ padding: '12px 28px' }}
              >
                <span>Book Class at This Studio</span>
              </button>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(loc.name + ' ' + loc.address)}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-dark"
                style={{ padding: '12px 24px' }}
              >
                <Navigation size={16} />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Right Image & Map Preview */}
          <div className="locations-img-container" style={{ borderRadius: '24px', overflow: 'hidden', height: '420px', position: 'relative' }}>
            <img
              src={loc.image}
              alt={loc.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '16px',
                padding: '12px 20px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#272727',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-soft)'
              }}
            >
              <MapPin size={16} color="#944426" />
              <span>Interactive Studio View Active</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #locations {
            padding: 40px 0 52px 0 !important;
          }
          .locations-showcase-card {
            padding: 24px 18px !important;
            border-radius: 20px !important;
            gap: 24px !important;
          }
          .locations-showcase-card h3 {
            font-size: 24px !important;
          }
          .locations-img-container {
            height: 240px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>
    </section>
  );
};
