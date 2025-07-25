
export interface LipstickProduct {
  brand: string;
  shadeName: string;
}

export interface LipstickAPIResponse {
  lipsticks: LipstickProduct[];
}
