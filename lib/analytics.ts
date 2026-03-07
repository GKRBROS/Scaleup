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
  // Funnel Steps
  flowStart: () => trackEvent({ action: "flow_step_1_visit", category: "funnel" }),
  heroRegisterClick: () => trackEvent({ action: "flow_step_2_hero_click", category: "funnel" }),
  registrationOpen: () => trackEvent({ action: "flow_step_3_reg_open", category: "funnel" }),
  registrationSuccess: (method: string) => 
    trackEvent({ action: "flow_step_4_reg_success", category: "funnel", label: method }),
  goToAvatarClick: () => trackEvent({ action: "flow_step_5_go_to_avatar", category: "funnel" }),
  boringExit: () => trackEvent({ action: "flow_step_5_exit_boring", category: "funnel" }),
  avatarModalOpen: () => trackEvent({ action: "flow_step_6_avatar_open", category: "funnel" }),
  imageGenStart: (type: string) => 
    trackEvent({ action: "flow_step_7_gen_start", category: "funnel", label: type }),
  imageGenSuccess: (type: string) => 
    trackEvent({ action: "flow_step_8_gen_success", category: "funnel", label: type }),
  
  // Interactions
  imageGenError: (error: string) => 
    trackEvent({ action: "image_gen_error", category: "error", label: error }),
  imageGenDownload: (type?: string) => 
    trackEvent({ action: "image_gen_download", category: "generation", label: type }),
  ticketDownload: () => 
    trackEvent({ action: "ticket_download", category: "engagement" }),
  apiCall: (endpoint: string, status: string) => 
    trackEvent({ action: "api_call", category: "backend", label: `${endpoint} - ${status}` }),
};
