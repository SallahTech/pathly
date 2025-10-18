import { Audio } from 'expo-av';

export class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private currentSound: Audio.Sound | null = null;
  private isPlaying = false;
  private currentPlayingUri: string | null = null;
  private playbackPosition: number = 0; // in milliseconds
  private playbackDuration: number = 0; // in milliseconds

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  async startRecording(): Promise<string | null> {
    try {
      if (this.isRecording) {
        console.log('Already recording');
        return null;
      }

      // Request permissions if not already granted
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Audio recording permission not granted');
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await this.recording.startAsync();
      this.isRecording = true;
      console.log('Voice recording started');

      return 'recording'; // Return a status indicator
    } catch (error) {
      console.error('Error starting voice recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  async stopRecording(): Promise<{ uri: string; duration: number } | null> {
    try {
      if (!this.recording || !this.isRecording) {
        console.log('No active recording to stop');
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      const duration = status.durationMillis ? status.durationMillis / 1000 : 0; // Convert to seconds
      
      this.recording = null;
      this.isRecording = false;

      console.log('Voice recording stopped, URI:', uri, 'Duration:', duration);
      return { uri: uri || '', duration };
    } catch (error) {
      console.error('Error stopping voice recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  async playRecording(uri: string): Promise<void> {
    try {
      // If the same recording is already playing, pause it
      if (this.isPlaying && this.currentPlayingUri === uri) {
        await this.pausePlayback();
        return;
      }

      // If the same recording is paused, resume it
      if (!this.isPlaying && this.currentPlayingUri === uri && this.currentSound) {
        await this.currentSound.playAsync();
        this.isPlaying = true;
        return;
      }

      // If a different recording is playing, stop it first
      if (this.isPlaying && this.currentPlayingUri !== uri) {
        await this.stopPlayback();
      }

      // If nothing is playing, start playing the new recording
      if (!this.isPlaying) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        this.currentSound = sound;
        this.currentPlayingUri = uri;
        
        // Reset position and duration for new playback
        this.playbackPosition = 0;
        this.playbackDuration = 0;
        
        console.log('Starting new playback for:', uri);
        
        await sound.playAsync();
        this.isPlaying = true;
        
        // Track playback position and duration
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded) {
            this.playbackPosition = status.positionMillis || 0;
            this.playbackDuration = status.durationMillis || 0;
            
            if (status.didJustFinish) {
              this.isPlaying = false;
              this.currentPlayingUri = null;
              this.currentSound = null;
              this.playbackPosition = 0;
              this.playbackDuration = 0;
              sound.unloadAsync();
            }
          }
        });
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      this.isPlaying = false;
      this.currentPlayingUri = null;
      this.currentSound = null;
    }
  }

  async pausePlayback(): Promise<void> {
    try {
      if (this.currentSound && this.isPlaying) {
        await this.currentSound.pauseAsync();
        this.isPlaying = false;
        // Keep the current position when pausing
        console.log('Playback paused at position:', this.playbackPosition);
      }
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  }

  async stopPlayback(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
        this.isPlaying = false;
        this.currentPlayingUri = null;
        this.playbackPosition = 0;
        this.playbackDuration = 0;
        console.log('Playback stopped');
      }
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentPlayingUri(): string | null {
    return this.currentPlayingUri;
  }

  resetPlaybackState(): void {
    this.playbackPosition = 0;
    this.playbackDuration = 0;
    console.log('Playback state reset');
  }

  getPlaybackPosition(): number {
    return this.playbackPosition;
  }

  getPlaybackDuration(): number {
    return this.playbackDuration;
  }

  async seekToPosition(positionMillis: number): Promise<void> {
    try {
      if (this.currentSound) {
        // Only seek if the position is significantly different to avoid rapid calls
        const currentPosition = this.playbackPosition;
        const difference = Math.abs(positionMillis - currentPosition);
        
        // Only seek if the difference is more than 100ms to avoid rapid seeking
        if (difference > 100) {
          await this.currentSound.setPositionAsync(positionMillis);
          this.playbackPosition = positionMillis;
        }
      }
    } catch (error) {
      // Don't log seeking interrupted errors as they're expected during rapid dragging
      if (error instanceof Error && !error.message.includes('Seeking interrupted')) {
        console.error('Error seeking to position:', error);
      }
    }
  }

  async seekToPercentage(percentage: number): Promise<void> {
    try {
      if (this.currentSound && this.playbackDuration > 0) {
        const positionMillis = (percentage / 100) * this.playbackDuration;
        await this.seekToPosition(positionMillis);
      }
    } catch (error) {
      console.error('Error seeking to percentage:', error);
    }
  }

  async deleteRecording(uri: string): Promise<void> {
    try {
      // For now, we'll just log the deletion
      // In a real app, you might want to use FileSystem to delete the file
      console.log('Deleting recording:', uri);
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  }
}

export const voiceService = new VoiceService();
