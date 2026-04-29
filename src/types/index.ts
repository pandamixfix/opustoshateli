export interface Track {
  id: number;
  title: string;
  artist: string;
  src: string;      // Путь к файлу (например, /music/track1.mp3)
  coverUrl: string; // Обложка трека
}