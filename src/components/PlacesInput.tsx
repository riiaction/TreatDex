import React, { useEffect, useRef } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { useJsApiLoader } from "@react-google-maps/api";

interface PlacesInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<htmlinputelement>) => void;
  onSelectPlace: (details: { name: string; address: string; url: string; lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
}

const libraries: "places"[] = ["places"];

export function PlacesInput({ value, onChange, onSelectPlace, placeholder, className }: PlacesInputProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: (import.meta as any).env.VITE_MAPS_VIEW || process.env.MapsView || "",
    libraries,
  });

  const {
    ready,
    value: placeValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // You can limit results or define options here
    },
    debounce: 300,
    initOnMount: isLoaded, // only initialize hook when script is loaded
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (isLoaded && !initialized.current) {
      if (window.google) {
        // usePlacesAutocomplete doesn't re-init on isLoaded change directly
        // So we trigger an empty search to force init
        setValue(value, false);
        initialized.current = true;
      }
    }
  }, [isLoaded, setValue, value]);

  // Sync prop value (e.g., initial or external change) with internal state
  const previousValue = useRef(value);
  useEffect(() => {
    if (value !== previousValue.current) {
      setValue(value, false);
      previousValue.current = value;
    }
  }, [value, setValue]);

  const handleInput = (e: React.ChangeEvent<htmlinputelement>) => {
    onChange(e); // Notify parent (to update reward.name)
    setValue(e.target.value);
  };

  const handleSelect = ({ description, place_id, structured_formatting }: any) => {
    setValue(structured_formatting.main_text, false);
    clearSuggestions();

    const name = structured_formatting.main_text;

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
        const url = place.url || `https://maps.google.com/?q=${encodeURIComponent(place.name || name)}`;
        
        onSelectPlace({ name: place.name || name, address, url, lat, lng });
      } else {
        // Fallback to Geocoding if Places Details fails
        getGeocode({ placeId: place_id })
          .then((results) => {
            const { lat, lng } = getLatLng(results[0]);
            const address = results[0].formatted_address;
            const placeUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
            
            onSelectPlace({ name, address, url: placeUrl, lat, lng });
          })
          .catch((error) => {
            console.error("Error fetching geocode: ", error);
            onSelectPlace({ name, address: description, url: `https://maps.google.com/?q=${encodeURIComponent(description)}`, lat: 0, lng: 0 });
          });
      }
    });
  };

  return (
    <div classname="relative flex-1">
      <input type="text" value="{placeValue}" onchange="{handleInput}" disabled="{!ready}" classname="{className}" placeholder="{placeholder}"/>
      {status === "OK" && (
        <ul classname="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <li key="{place_id}" onclick="{()" ==""> handleSelect(suggestion)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium"
              >
                <div classname="text-gray-900">{main_text}</div>
                <div classname="text-xs text-gray-500">{secondary_text}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
