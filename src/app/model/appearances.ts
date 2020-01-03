import { Webcast } from './FRCEvent';

export class AppearancesResponse {
    Appearances: Appearance[];
}

export class EventAppearancesResponse {
    EventAppearances: EventAppearance[];
}

export class Appearance {
    address: string;
    city: string;
    country: string;
    district: District;
    division_keys: string[];
    end_date: string;
    event_code: string;
    event_type: number;
    event_type_string: string;
    first_event_code: string;
    first_event_id: string;
    gmaps_place_id: string;
    gmaps_url: string;
    key: string;
    lat: number;
    lng: number;
    location_name: string;
    name: string;
    parent_event_key: string;
    playoff_type: string;
    playoff_type_string: string;
    postal_code: string;
    short_name: string;
    start_date: string;
    state_prov: string;
    timezone: string;
    webcasts: Webcast[];
    website: string;
    week: number;
    year: number;
}

export class District {
    abbreviation: string;
    display_name: string;
    key: string;
    year: number;
}

export class EventAppearance {
    champsAppearances: number;
    champsAppearancesyears: string[];
    einsteinAppearances: number;
    einsteinAppearancesyears: string[];
    districtChampsAppearances: number;
    districtChampsAppearancesyears: string[];
    districtEinsteinAppearances: number;
    districtEinsteinAppearancesyears: string[];
    FOCAppearances: number;
    FOCAppearancesyears: string[];
}
