/**
 * Verified Destination Names (STRICT GEOLOCATION)
 * These strings are optimized for Google Maps Geocoding to find the exact pin.
 */
const VERIFIED_DESTINATIONS: Record<string, string> = {
  // Auditorium / Simfoni
  "Auditorium": "Tan Hua Choon Auditorium, Xiamen University Malaysia",
  "Simfoni": "Tan Hua Choon Auditorium, Xiamen University Malaysia",
  "Tan Hua Choon Auditorium": "Tan Hua Choon Auditorium, Xiamen University Malaysia",

  // LY Court
  "LY Court": "LY Basketball Court, Xiamen University Malaysia",
  "Road to Adiwarna": "LY Basketball Court, Xiamen University Malaysia",
  
  // B1 Area Specifics
  "B1 Area": "2.832441,101.706593",
  "Indoor Bazaar": "2.832441,101.706593",
  "Basketball Court": "2.832536,101.7066468",
  "Basketball 5v5": "2.832536,101.7066468",
  "Futsal Court": "2.8315012,101.7066642",
  "Futsal Area": "2.8315012,101.7066642",
  
  // General
  "Student Activity Centre": "Student Activity Centre, Xiamen University Malaysia"
};

/**
 * XMUM Campus Navigator Utility
 * 
 * Construction logic:
 * 1. Use the Directions API with Current Location (origin= omitted).
 * 2. Force 'dir_action=navigate' to trigger the GPS navigation mode.
 * 
 * @param destinationName - The target location name (e.g., "A3 Library")
 * @param returnOnly - If true, returns the URL as a string without opening it
 * @returns The constructed URL (only if returnOnly is true)
 */
export const navigateToDestination = (
  destinationName?: string,
  returnOnly: boolean = false
): string | void => {
  const CAMPUS_SUFFIX = "Xiamen University Malaysia";
  const FALLBACK_NAME = "Xiamen University Malaysia Main Entrance";
  
  const baseName = destinationName?.trim() || FALLBACK_NAME;

  // 1. Get the most accurate destination string
  const fullDestination = VERIFIED_DESTINATIONS[baseName] || 
    (baseName.includes("Xiamen") ? baseName : `${baseName} ${CAMPUS_SUFFIX}`);

  // 2. Construct the Directions API URL
  // Omitting 'origin' defaults to User's Current Location
  const baseUrl = "https://www.google.com/maps/dir/?api=1";
  const encodedDest = encodeURIComponent(fullDestination);
  
  // travelmode=walking is often best for campus, but we'll leave it flexible
  // dir_action=navigate triggers the turn-by-turn mode
  let finalUrl = `${baseUrl}&destination=${encodedDest}&dir_action=navigate`;

  // 3. Construct a search-wrapped URL for maximum compatibility on some devices if requested
  // However, for direct navigation, the dir/?api=1 is standard.
  // We wrap it in a search query only as a fallback for the UI display if needed.
  
  // The user specifically asked for "One-Click Navigation" from current location.
  
  if (returnOnly) {
    return finalUrl;
  }

  window.open(finalUrl, "_blank", "noopener,noreferrer");
};
