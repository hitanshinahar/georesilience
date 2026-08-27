"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RiskZone } from '@/types';

// Fix Leaflet's default icon path issues in Next.js
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// A component to automatically zoom to the selected zone
function MapCenterer({ selectedZone }: { selectedZone: RiskZone | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedZone) {
      map.flyTo([selectedZone.latitude, selectedZone.longitude], 14, {
        animate: true,
        duration: 1.5
      });
    } else {
      // Gangtok center
      map.flyTo([27.3314, 88.6138], 12, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedZone, map]);

  return null;
}

interface MapClientProps {
  zones: RiskZone[];
  selectedZone: RiskZone | null;
  onSelectZone: (zone: RiskZone) => void;
}

export default function MapClient({ zones, selectedZone, onSelectZone }: MapClientProps) {
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MODERATE': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border/50 relative z-0">
      <MapContainer 
        center={[27.3314, 88.6138]} // Gangtok coords
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className="bg-zinc-900"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapCenterer selectedZone={selectedZone} />

        {zones.map((zone) => (
          <CircleMarker
            key={zone.id}
            center={[zone.latitude, zone.longitude]}
            radius={selectedZone?.id === zone.id ? 16 : 12}
            pathOptions={{
              color: getRiskColor(zone.riskLevel),
              fillColor: getRiskColor(zone.riskLevel),
              fillOpacity: selectedZone?.id === zone.id ? 0.6 : 0.4,
              weight: selectedZone?.id === zone.id ? 3 : 1
            }}
            eventHandlers={{
              click: () => onSelectZone(zone),
            }}
          >
            <Popup className="bg-background/95 border border-border">
              <div className="text-foreground p-1">
                <div className="font-bold mb-1">{zone.name}</div>
                <div className="text-xs">Risk: {zone.riskScore}%</div>
                <div className="text-xs text-muted-foreground mt-1 cursor-pointer underline" onClick={() => onSelectZone(zone)}>
                  View Intelligence
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
