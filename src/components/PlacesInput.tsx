import React, { useEffect, useRef } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

interface PlacesInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectPlace: (details: { name: string; address: string; url: string; lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
}

// Define libraries outside component to prevent unnecessary re-renders
const libraries: Libraries = ["places"];

export function PlacesInput({ value, onChange, onSelectPlace, placeholder, className }: PlacesInputProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: (import.meta as any).env.VITE_MAPS_VIEW || (process.env as any).MapsView || "",
    libraries,
  });

  const {
    ready,
    value: placeValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
    initOnMount: isLoaded,
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (isLoaded && !initialized.current) {
      if (window.google) {
        setValue(value, false);
        initialized.current = true;
      }
    }
  }, [isLoaded, setValue, value]);

  const previousValue = useRef(value);
  useEffect(() => {
    if (value !== previousValue.current) {
      setValue(value, false);
      previousValue.current = value;
    }
  }, [value, setValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e); 
    setValue(e.target.value);
  };

  const handleSelect = (suggestion: any) => {
    const { description, place_id, structured_formatting } = suggestion;
    setValue(structured_formatting.main_text, false);
    clearSuggestions();

    const name = structured_formatting.main_text;

    // Create a dummy div for PlacesService as it requires a map or element
    const mapDiv = document.createElement('div');
    const map = new window.google.maps.Map(mapDiv);
    const service = new window.google.maps.places.PlacesService(map);

    service.getDetails({
      placeId: place_id,
      fields: ['url', 'geometry', 'formatted_address', 'name']
    }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const lat = place.geometry?.location?.lat() || 0;
        const lng = place.geometry?.location?.lng() || 0;
        const address = place.formatted_address || description;
        const url = place.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || name)}`;
        
        onSelectPlace({ name: place.name || name, address, url, lat, lng });
      } else {
        getGeocode({ placeId: place_id })
          .then((results) => {
            const { lat, lng } = getLatLng(results[0]);
            const address = results[0].formatted_address;
            const placeUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            
            onSelectPlace({ name, address, url: placeUrl, lat, lng });
          })
          .catch((error) => {
            console.error("Error fetching geocode: ", error);
            onSelectPlace({ 
              name, 
              address: description, 
              url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(description)}`, 
              lat: 0, 
              lng: 0 
            });
          });
      }
    });
  };

  return (
    <div className="relative flex-1">
      <input 
        type="text" 
        value={placeValue} 
        onChange={handleInput} 
        disabled={!ready} 
        className={className} 
        placeholder={placeholder}
      />
      
      {status === "OK" && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <li 
                key={place_id} 
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium"
              >
                <div className="text-gray-900">{main_text}</div>
                <div className="text-xs text-gray-500">{secondary_text}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
