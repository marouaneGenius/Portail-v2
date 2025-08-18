interface AddressSuggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressDetails {
  formatted_address: string;
  street_number?: string;
  route?: string;
  locality?: string;
  postal_code?: string;
  country?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export class AddressService {
  private static readonly BASE_URL = '/api/address';

  static async searchAddresses(input: string): Promise<AddressSuggestion[]> {
    if (input.length < 3) return [];

    try {
      const response = await fetch(
        `${this.BASE_URL}/search?input=${encodeURIComponent(input)}`
      );

      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.predictions || [];
      }
      
      console.error('Address search API error:', data.status, data.error_message);
      return [];
    } catch (error) {
      console.error('Address search error:', error);
      return [];
    }
  }

  static async getAddressDetails(placeId: string): Promise<AddressDetails | null> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/details?place_id=${encodeURIComponent(placeId)}`
      );

      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        return data.result;
      }
      
      console.error('Address details API error:', data.status, data.error_message);
      return null;
    } catch (error) {
      console.error('Address details error:', error);
      return null;
    }
  }

  static parseAddress(details: AddressDetails) {
    const street = [details.street_number, details.route].filter(Boolean).join(' ');
    
    return {
      address: street || details.formatted_address,
      city: details.locality || '',
      zip_code: details.postal_code || '',
      country: details.country || 'France',
      formatted_address: details.formatted_address,
      coordinates: details.geometry?.location || null
    };
  }
}