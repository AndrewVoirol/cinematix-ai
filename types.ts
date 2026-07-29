
export enum AspectRatio {
  SQUARE = "1:1",
  LANDSCAPE = "16:9",
  PORTRAIT = "9:16",
  CLASSIC_PHOTO = "3:4",
  CINEMATIC = "4:3"
}

export enum ImageSize {
  K1 = "1K",
  K2 = "2K",
  K4 = "4K"
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  config: {
    aspectRatio: AspectRatio;
    imageSize?: ImageSize;
    model: string;
  };
}

export interface AppState {
  prompt: string;
  images: GeneratedImage[];
  isGenerating: boolean;
  isRefining: boolean;
  error: string | null;
  selectedModel: "gemini-2.5-flash-image" | "gemini-3-pro-image-preview";
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
}
