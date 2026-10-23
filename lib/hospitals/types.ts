/** Row returned by the public directory endpoints (apps/hospitals/views_public_directory.py). */
export type ApiHospital = {
  id: number;
  hospital_name: string;
  location_coordinates: string;
  location: string;
  hospital_category: string;
  discipline_systems_of_medicine: string;
  address_original_first_line: string;
  state: string;
  district: string;
  subdistrict: string;
  pincode: string;
  telephone: string;
  mobile_number: string;
  emergency_num: string;
  ambulance_phone_no: string;
  bloodbank_phone_no: string;
  website: string;
  specialties: string;
  facilities: string;
  /** Null unless `location_coordinates` parses and lies inside India. */
  latitude: number | null;
  longitude: number | null;
  /** Text search only: how strongly the place text matched. */
  match: "exact" | "partial" | "related" | null;
  /** Nearby search only. */
  distance_km: number | null;
};

export type ApiPage = {
  success: true;
  count: number;
  next: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results: ApiHospital[];
};

export type Suggestion = {
  type: "district" | "area" | "place" | "pincode" | "hospital";
  label: string;
  query: string;
  detail: string;
};

export type Filters = {
  category: string;
  discipline: string;
  specialty: string;
  facility: string;
};

export const EMPTY_FILTERS: Filters = { category: "", discipline: "", specialty: "", facility: "" };

export type FilterOptions = { categories: string[]; disciplines: string[] };

export type Place = { lat: number; lng: number; name: string };

/** What the UI works with: the API row plus values derived once. */
export type Hospital = ApiHospital & {
  address: string;
  phones: PhoneNumber[];
  emergency: PhoneNumber[];
  websiteUrl: string | null;
  websiteLabel: string | null;
  approximate: boolean;
};

export type PhoneNumber = { label: string; href: string };
