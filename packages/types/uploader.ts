export type CreateUploader = (baseURL: string) => (path: string, data: any) => void;

export type Uploader = ReturnType<CreateUploader>;
