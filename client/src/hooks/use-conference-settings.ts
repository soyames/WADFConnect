import { useQuery } from "@tanstack/react-query";

export interface ConferenceSettings {
  id: string;
  eventName: string;
  eventDate: string | null;
  eventLocation: string | null;
  eventVenue: string | null;
  eventDescription: string | null;
  isDateConfirmed: boolean;
  isLocationConfirmed: boolean;
  updatedAt: string;
}

export function useConferenceSettings() {
  const { data: settings, isLoading } = useQuery<ConferenceSettings>({
    queryKey: ["/api/conference-settings"],
    queryFn: async () => {
      const res = await fetch("/api/conference-settings");
      if (!res.ok) throw new Error("Failed to fetch conference settings");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Helper to get formatted date/location string
  const getDateLocationString = () => {
    if (!settings) return "Date & Location: To Be Confirmed Soon";

    const dateStr = settings.isDateConfirmed && settings.eventDate 
      ? settings.eventDate 
      : "To Be Confirmed Soon";
    
    const locationStr = settings.isLocationConfirmed && settings.eventLocation 
      ? settings.eventLocation 
      : "To Be Confirmed Soon";

    if (dateStr === "To Be Confirmed Soon" && locationStr === "To Be Confirmed Soon") {
      return "Date & Location: To Be Confirmed Soon";
    }

    if (dateStr === "To Be Confirmed Soon") {
      return `Date TBC • ${locationStr}`;
    }

    if (locationStr === "To Be Confirmed Soon") {
      return `${dateStr} • Location TBC`;
    }

    return `${dateStr} • ${locationStr}`;
  };

  const getVenueString = () => {
    if (!settings) return "Conference Venue (Location TBC)";
    
    if (settings.isLocationConfirmed && settings.eventVenue && settings.eventLocation) {
      return `${settings.eventVenue}, ${settings.eventLocation}`;
    }
    
    if (settings.isLocationConfirmed && settings.eventLocation) {
      return settings.eventLocation;
    }

    return "Conference Venue (Location TBC)";
  };

  return {
    settings,
    isLoading,
    eventName: settings?.eventName || "West Africa Design Forum 2026",
    eventDate: settings?.isDateConfirmed && settings?.eventDate ? settings.eventDate : "To Be Confirmed Soon",
    eventLocation: settings?.isLocationConfirmed && settings?.eventLocation ? settings.eventLocation : "To Be Confirmed Soon",
    eventVenue: getVenueString(),
    eventDescription: settings?.eventDescription || "",
    isDateConfirmed: settings?.isDateConfirmed || false,
    isLocationConfirmed: settings?.isLocationConfirmed || false,
    dateLocationString: getDateLocationString(),
  };
}
