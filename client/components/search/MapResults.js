'use client';

import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';

// Fix for Leaflet marker icons in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const activeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
}

export default function MapResults({ shops, center, userLocation }) {
    const defaultCenter = center || [-23.5505, -46.6333]; // São Paulo fallback
    const [mapCenter, setMapCenter] = useState(defaultCenter);

    useEffect(() => {
        if (center) setMapCenter(center);
    }, [center]);

    return (
        <div className="h-full w-full relative z-10">
            <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%', background: '#0A0A0A' }}
                zoomControl={false}
            >
                <ChangeView center={mapCenter} zoom={13} />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={activeIcon}>
                        <Popup className="custom-popup">
                            <span className="font-bold text-black">Você está aqui</span>
                        </Popup>
                    </Marker>
                )}

                {shops.filter(s => s.latitude && s.longitude).map((shop) => (
                    <Marker
                        key={shop.id}
                        position={[shop.latitude, shop.longitude]}
                        icon={icon}
                    >
                        <Popup className="custom-popup">
                            <div className="w-48 p-1">
                                <Link href={`/${shop.slug}`} className="group">
                                    <div className="relative h-24 w-full mb-2 rounded-lg overflow-hidden">
                                        {shop.logoUrl ? (
                                            <Image src={shop.logoUrl} alt={shop.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-primary flex items-center justify-center text-black font-bold">💈</div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-black leading-tight mb-1 group-hover:text-primary transition-colors">{shop.name}</h4>
                                    <div className="flex items-center gap-1 mb-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-bold text-black/70">{shop.averageRating || 'New'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-black/50">
                                        <MapPin className="w-3 h-3" />
                                        <span className="line-clamp-1">{shop.address}</span>
                                    </div>
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <style jsx global>{`
                .leaflet-container {
                    background: #0A0A0A !important;
                }
                .custom-popup .leaflet-popup-content-wrapper {
                    background: white;
                    border-radius: 12px;
                    padding: 0;
                    overflow: hidden;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                }
                .leaflet-popup-tip-container {
                    display: none;
                }
            `}</style>
        </div>
    );
}
