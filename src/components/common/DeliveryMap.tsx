import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  type: 'farm' | 'consumer' | 'hub';
  details?: string;
}

interface DeliveryMapProps {
  farmPoint?: { lat: number; lng: number; name: string; locality: string };
  deliveryPoint?: { lat: number; lng: number; address: string; recipient: string };
  additionalPoints?: MapPoint[];
  height?: string;
  zoom?: number;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  farmPoint,
  deliveryPoint,
  additionalPoints = [],
  height = '360px',
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center coordinates for Mira Bhayandar
    const defaultCenter: [number, number] = [19.2845, 72.8250];

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: zoom,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    // Custom SVG Icon generators for professional appearance
    const createCustomIcon = (bgColor: string, symbol: string) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${bgColor};
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
          ">
            ${symbol}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
      });
    };

    const farmIcon = createCustomIcon('#214325', '🌱');
    const consumerIcon = createCustomIcon('#B8613A', '🏠');

    // 1. Add Farm Marker
    if (farmPoint && farmPoint.lat && farmPoint.lng) {
      const farmLatLng: [number, number] = [farmPoint.lat, farmPoint.lng];
      bounds.extend(farmLatLng);

      L.marker(farmLatLng, { icon: farmIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui; padding: 2px;">
            <span style="font-size: 11px; font-weight: bold; color: #214325; text-transform: uppercase;">Farm Origin</span>
            <h4 style="margin: 2px 0 4px 0; font-size: 14px; font-weight: 700;">${farmPoint.name}</h4>
            <p style="margin: 0; font-size: 12px; color: #555;">Locality: ${farmPoint.locality}, Mira Bhayandar</p>
          </div>
        `);
    }

    // 2. Add Delivery Marker
    if (deliveryPoint && deliveryPoint.lat && deliveryPoint.lng) {
      const consumerLatLng: [number, number] = [deliveryPoint.lat, deliveryPoint.lng];
      bounds.extend(consumerLatLng);

      L.marker(consumerLatLng, { icon: consumerIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui; padding: 2px;">
            <span style="font-size: 11px; font-weight: bold; color: #B8613A; text-transform: uppercase;">Delivery Destination</span>
            <h4 style="margin: 2px 0 4px 0; font-size: 14px; font-weight: 700;">${deliveryPoint.recipient}</h4>
            <p style="margin: 0; font-size: 12px; color: #555;">${deliveryPoint.address}</p>
          </div>
        `);
    }

    // 3. Connect with Polyline if both points exist
    if (
      farmPoint &&
      farmPoint.lat &&
      farmPoint.lng &&
      deliveryPoint &&
      deliveryPoint.lat &&
      deliveryPoint.lng
    ) {
      const routePoints: [number, number][] = [
        [farmPoint.lat, farmPoint.lng],
        // Midpoint slight bend to simulate Mira Bhayandar coastal road
        [(farmPoint.lat + deliveryPoint.lat) / 2 + 0.003, (farmPoint.lng + deliveryPoint.lng) / 2],
        [deliveryPoint.lat, deliveryPoint.lng],
      ];

      L.polyline(routePoints, {
        color: '#2A552E',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
    }

    // 4. Additional points
    additionalPoints.forEach((pt) => {
      bounds.extend([pt.lat, pt.lng]);
      const icon = pt.type === 'farm' ? farmIcon : consumerIcon;
      L.marker([pt.lat, pt.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${pt.label}</b><br/>${pt.details || ''}`);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [farmPoint, deliveryPoint, additionalPoints, zoom]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-900/10 shadow-inner bg-cream">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />
      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-sm flex items-center gap-3 z-[400]">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-farm-800"></span>
          <span>Farm Origin</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-earth-600"></span>
          <span>Delivery Stop</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Mira Bhayandar Region</span>
      </div>
    </div>
  );
};
