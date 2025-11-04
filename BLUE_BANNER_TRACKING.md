# Blue Banner Tracking System

## Overview
This document describes the comprehensive Blue Banner tracking system implemented in the GAT application. Blue Banners are awarded for event wins, Chairman's Awards, and Impact Awards at various competition levels.

## Award Types
Blue Banners are earned for:
1. **Event Winner** - `award_type === 1`
2. **Chairman's Award** - `award_type === 0` with "Chairman" in the award name
3. **Impact Award** - `award_type === 0` with "Impact" in the award name

## Competition Levels Tracked

### 1. Regional Level (`event_type === 0`)
- `regionalWins` - Regional event wins
- `regionalChairmans` - Regional Chairman's Awards
- `regionalImpact` - Regional Impact Awards

### 2. District Level (`event_type === 1`)
- `districtWins` - District event wins
- `districtChairmans` - District Chairman's Awards
- `districtImpact` - District Impact Awards

### 3. District Championship Division Level (`event_type === 5`)
- `districtDivisionWins` - District Championship Division wins
- `districtDivisionChairmans` - District Championship Division Chairman's Awards
- `districtDivisionImpact` - District Championship Division Impact Awards

### 4. District Championship Level (`event_type === 2`)
- `districtChampionshipWins` - District Championship wins (Einstein-equivalent)
- `districtChampionshipChairmans` - District Championship Chairman's Awards
- `districtChampionshipImpact` - District Championship Impact Awards

### 5. World Championship Division Level (`event_type === 3`)
- `championshipDivisionWins` - World Championship Division wins (Archimedes, Curie, Galileo, Newton, etc.)
- `championshipDivisionChairmans` - World Championship Division Chairman's Awards
- `championshipDivisionImpact` - World Championship Division Impact Awards

### 6. World Championship Finals Level (`event_type === 4`)
- `einsteinWins` - Einstein Field wins
- `einsteinChairmans` - Einstein Field Chairman's Awards
- `einsteinImpact` - Einstein Field Impact Awards

### 7. Festival of Champions
- `festivalWins` - Festival of Champions wins (detected by event name)

## Data Structure

Each category includes:
- **Count field**: Number of Blue Banners earned (e.g., `regionalWins: 5`)
- **Years field**: Array of years when earned (e.g., `regionalWinsYears: [2018, 2019, 2020, 2021, 2023]`)

Additionally, the system maintains:
- `blueBanners` - Total count of all Blue Banners
- `blueBannersYears` - Array of all years Blue Banners were earned

## Implementation

The tracking is implemented in the `calculateBlueBanners()` function in `src/App.jsx`, which:
1. Creates a map of event keys to event objects for efficient lookup
2. Processes each award, determining its type and event level
3. Categorizes the award appropriately based on event type and characteristics
4. Returns a comprehensive object with all Blue Banner counts and years

## Usage

The Blue Banner data is attached to each team object in the team list when loading team information. Access it via:

```javascript
team.champsAppearances = {
  // ... other appearance data ...
  blueBanners: 42,
  blueBannersYears: [1999, 2000, 2001, ...],
  regionalWins: 15,
  regionalWinsYears: [1999, 2000, ...],
  districtWins: 8,
  districtWinsYears: [2014, 2015, ...],
  // ... etc.
}
```

## Test Cases

### Team 254 (Regional Team)
- Multiple regional wins
- Regional Chairman's Awards
- Championship Division wins
- Einstein wins

### Team 125 (District Team)
Example breakdown:
- 4 Regional wins
- 14 District wins
- 2 District Championship wins
- 3 Championship Division wins
- 1 Einstein win
- 15 Chairman's Awards (various levels)

## Event Type Reference

| Code | Description | Example |
|------|-------------|---------|
| 0 | Regional | Silicon Valley Regional |
| 1 | District | Pine Tree District Event |
| 2 | District Championship | New England District Championship |
| 3 | Championship Division | Galileo Division, Newton Division |
| 4 | Championship Finals | Einstein Field |
| 5 | District Championship Division | NEDC - Ballard Division |
| 99 | Offseason | Chezy Champs, IRI |

## Notes

- District Championships with divisions have `event_type === 2` and include `division_keys` array
- District Championship Divisions have `event_type === 5` and a `parent_event_key` pointing to the main championship
- Festival of Champions is detected by event name containing "festival of champions"
- Offseason events (type 99) are only counted if they're Festival of Champions

