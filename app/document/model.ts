export type Document = {
  id: number;
  name: string;
  processed: boolean;
};

export type DocumentSection = {
  documentID: number;
  position: number;
};
