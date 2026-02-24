export const GA_TRACKING_ID = "G-PNFLS5WH87";

// Log page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Log specific events
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Helper for common events
export const analytics = {
  registrationOpen: () => trackEvent({ action: "registration_open", category: "engagement" }),
  registrationSuccess: (method: string) => 
    trackEvent({ action: "registration_success", category: "engagement", label: method }),
  imageGenStart: (type: string) => 
    trackEvent({ action: "image_gen_start", category: "generation", label: type }),
  imageGenSuccess: (type: string) => 
    trackEvent({ action: "image_gen_success", category: "generation", label: type }),
  imageGenError: (error: string) => 
    trackEvent({ action: "image_gen_error", category: "error", label: error }),
  imageGenDownload: (type?: string) => 
    trackEvent({ action: "image_gen_download", category: "generation", label: type }),
  ticketDownload: () => 
    trackEvent({ action: "ticket_download", category: "engagement" }),
  apiCall: (endpoint: string, status: string) => 
    trackEvent({ action: "api_call", category: "backend", label: `${endpoint} - ${status}` }),
};
