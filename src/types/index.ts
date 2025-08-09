export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
};

export interface ScheduleEntry {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  type: "stream" | "offline";
  memberOnly?: boolean;
  tags: {
    collab?: boolean;
    announcement?: boolean;
    special?: boolean;
  };
  offlineText?: string;
};

export interface DaySchedule {
  [key: string]: ScheduleEntry[]
};

export interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
};

export interface BackgroundTransform {
  scale: number;
  positionX: number;
  positionY: number;
};

export interface TimezoneConfig {
  id: string;
  label: string;
  abbreviation: string;
  enabled: boolean;
};

export interface SocialMediaHandle {
  id: string
  platform: string
  handle: string
  enabled: boolean
};

export interface ScheduleData {
  startDate: string;
  endDate: string;
  timezone: string;
  timezones: TimezoneConfig[];
  artistName: string;
  showArtist: boolean;
  socialMediaHandles: SocialMediaHandle[];
  scheduleTitle: string;
  schedule: DaySchedule;
  backgroundImage: string | null;
  imageTransform: ImageTransform;
  backgroundTransform: BackgroundTransform;
  transparentBackground: boolean;
  schedulePosition: "right" | "left";
};

export interface ScheduleEditorProps {
  scheduleData: ScheduleData;
  setScheduleData: (data: ScheduleData | ((prev: ScheduleData) => ScheduleData)) => void;
  onImageUpload: (file: File) => void;
};

export interface SchedulePreviewProps {
  scheduleData: ScheduleData;
  onImageTransformChange?: (transform: ImageTransform) => void;
  onBackgroundTransformChange?: (transform: BackgroundTransform) => void;
  isExporting?: boolean;
};

export interface ExportModalProps {
  scheduleData: ScheduleData;
  isOpen: boolean;
  onClose: () => void;
};