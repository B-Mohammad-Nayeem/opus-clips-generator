export interface WordCaption {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  speaker: string;
  confidence: number;
  emoji?: string;
  isKeyWord?: boolean;
}

export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9';
export type ReframingMode = 'auto-track' | 'split-screen' | 'manual-center';
export type CaptionPreset = 'Alex Hormozi' | 'Beast Style' | 'Cyber Neon' | 'Minimal Pill' | 'Classic Gold';
export type CaptionPosition = 'bottom' | 'center' | 'top';
export type CaptionAnimation = 'pop' | 'bounce' | 'karaoke' | 'fade';

export interface CaptionStyle {
  presetName: CaptionPreset;
  fontFamily: string;
  fontSize: number; // in px or rem equivalent
  activeWordColor: string;
  textColor: string;
  strokeColor: string;
  backgroundColor?: string;
  textPosition: CaptionPosition;
  animationType: CaptionAnimation;
  showEmojis: boolean;
  maxWordsPerLine: number;
}

export interface BrandAssets {
  logoUrl?: string;
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  logoOpacity: number;
  logoSize: number; // percentage
  watermarkText?: string;
}

export interface FaceCoordinates {
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  zoom: number;     // 1.0 to 2.5
}

export interface ClipReframing {
  targetAspect: AspectRatio;
  mode: ReframingMode;
  faceCoordinates: FaceCoordinates;
  showFaceBoundingBox?: boolean;
}

export interface Clip {
  id: string;
  videoId: string;
  title: string;
  summary: string;
  durationOption: '15s' | '30s' | '45s' | '60s' | '90s' | 'custom';
  startTimestamp: number; // in seconds
  endTimestamp: number;   // in seconds
  duration: number;       // in seconds
  viralScore: number;     // 0 to 100
  hookScore: number;      // 0 to 100
  engagementScore: number;// 0 to 100
  category: 'Controversial' | 'Hook' | 'Story' | 'Insight' | 'Laughter' | 'Action';
  selectionReasoning: string;
  keywords: string[];
  transcriptWords: WordCaption[];
  reframing: ClipReframing;
  captionStyle: CaptionStyle;
  brandAssets: BrandAssets;
  hashtags: string[];
  suggestedBroll?: string[];
  thumbnailUrl?: string;
}

export interface ProcessingStep {
  id: string;
  label: string;
  description: string;
  iconName: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number; // 0 to 100
  logDetails?: string;
}

export interface VideoProject {
  id: string;
  title: string;
  fileName: string;
  fileSizeFormatted: string;
  duration: number; // seconds
  videoUrl: string;
  thumbnailUrl: string;
  uploadDate: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  uploadProgress: number; // 0 to 100
  processingProgress: number; // 0 to 100
  currentProcessingStep?: string;
  stats: {
    wordCount: number;
    speakerCount: number;
    sceneCount: number;
    pauseCount: number;
    generatedClipsCount: number;
    avgViralScore: number;
  };
  clips: Clip[];
}

export interface ExportJob {
  id: string;
  clipId: string;
  clipTitle: string;
  videoTitle: string;
  format: 'mp4' | 'webm';
  resolution: '1080p' | '4k' | '720p';
  fps: 30 | 60;
  fileSizeFormatted: string;
  createdAt: string;
  status: 'rendering' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
}
