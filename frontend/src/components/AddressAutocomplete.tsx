import { useState, useEffect, useRef } from 'react';
import { AddressService } from '../services/addressService';

interface AddressSuggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressAutocompleteProps {
  name: string;
  value: string;
  onChange: (e: any) => void;
  onAddressSelect?: (addressData: {
    address: string;
    city: string;
    zip_code: string;
    country: string;
    formatted_address: string;
  }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function AddressAutocomplete({
  name,
  value,
  onChange,
  onAddressSelect,
  placeholder = "Tapez votre adresse...",
  className = "",
  required = false
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchAddresses = async () => {
      console.log('AddressAutocomplete: searching for:', value, 'length:', value?.length);
      if (value && value.length >= 3) {
        setLoading(true);
        try {
          console.log('AddressAutocomplete: calling AddressService.searchAddresses');
          const results = await AddressService.searchAddresses(value);
          console.log('AddressAutocomplete: got results:', results);
          setSuggestions(results);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Address search failed:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(searchAddresses, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSuggestionClick = async (suggestion: AddressSuggestion) => {
    setLoading(true);
    try {
      const details = await AddressService.getAddressDetails(suggestion.place_id);
      if (details) {
        const parsedAddress = AddressService.parseAddress(details);
        
        // Mettre à jour le champ d'entrée
        const syntheticEvent = {
          target: {
            name,
            value: parsedAddress.address,
            type: 'text'
          }
        };
        onChange(syntheticEvent);

        // Callback avec toutes les données d'adresse
        if (onAddressSelect) {
          onAddressSelect({
            address: parsedAddress.address,
            city: parsedAddress.city,
            zip_code: parsedAddress.zip_code,
            country: parsedAddress.country,
            formatted_address: parsedAddress.formatted_address
          });
        }
      }
    } catch (error) {
      console.error('Failed to get address details:', error);
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  const handleBlur = () => {
    // Délai pour permettre le clic sur les suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => value.length >= 3 && setShowSuggestions(suggestions.length > 0)}
        placeholder={placeholder}
        className={`w-full rounded border border-[#FFB800] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFB800] bg-[#FFFFFF] text-[#333333] ${className}`}
        required={required}
        autoComplete="off"
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFB800]"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-[#FFB800] rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-[#FFF8E1] ${
                index === selectedIndex ? 'bg-[#FFF8E1]' : ''
              }`}
            >
              <div className="font-medium text-[#333333]">
                {suggestion.structured_formatting.main_text}
              </div>
              <div className="text-sm text-gray-500">
                {suggestion.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && !loading && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#FFB800] rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-sm">
            Aucune adresse trouvée
          </div>
        </div>
      )}
    </div>
  );
}