import { Audio } from 'expo-av';

export class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

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
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
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

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording || !this.isRecording) {
        console.log('No active recording to stop');
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;

      console.log('Voice recording stopped, URI:', uri);
      return uri;
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
      const { sound } = await Audio.createAsync({ uri });
      await sound.playAsync();
      
      // Clean up after playback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing recording:', error);
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
