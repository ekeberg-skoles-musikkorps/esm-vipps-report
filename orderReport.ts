interface OrderReportItemEvent {
  type: "CAPTURE FEE" | "CAPTURE" | "RESERVE";
  eventDate: string;
  amount: number;
  message?: string;
}

export interface OrderReportItem {
  orderId: string;
  timestamp: string;
  salesUnitName: string;
  categoryName?: string;
  currency: string;
  senderName: string;
  phoneNumber: string;
  events: OrderReportItemEvent[];
}

export interface OrderReport {
  cursor: string;
  items: OrderReportItem[];
}
