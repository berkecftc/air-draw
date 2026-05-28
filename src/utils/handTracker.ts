import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type GestureType = 'pinch' | 'fist' | 'open_palm' | 'peace' | 'point' | 'unknown';

export class HandTrackerService {
  private landmarker: HandLandmarker | null = null;
  private isInitializing = false;

  /**
   * Initializes the MediaPipe HandLandmarker using CDN-hosted WASM files and model assets.
   */
  async initialize(onProgress?: (status: string) => void): Promise<HandLandmarker> {
    if (this.landmarker) return this.landmarker;
    if (this.isInitializing) {
      throw new Error('HandLandmarker is already initializing');
    }

    this.isInitializing = true;
    try {
      if (onProgress) onProgress('Loading MediaPipe WebAssembly engine...');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
      );

      if (onProgress) onProgress('Downloading hand-tracking AI model (approx 5.6MB)...');
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.landmarker = landmarker;
      this.isInitializing = false;
      if (onProgress) onProgress('Ready');
      return landmarker;
    } catch (error) {
      this.isInitializing = false;
      if (onProgress) onProgress('Failed to initialize hand tracker');
      console.error('Failed to initialize HandLandmarker:', error);
      throw error;
    }
  }

  /**
   * Detects hands inside a HTMLVideoElement.
   */
  detectVideoFrame(videoElement: HTMLVideoElement, timestampMs: number): HandLandmarkerResult | null {
    if (!this.landmarker) return null;
    return this.landmarker.detectForVideo(videoElement, timestampMs);
  }

  /**
   * Computes the Euclidean distance between two 3D points.
   */
  getDistance(p1: Point3D, p2: Point3D): number {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow(p1.z - p2.z, 2)
    );
  }

  /**
   * Determines the active gesture from 21 tracked hand landmarks.
   */
  detectGesture(landmarks: Point3D[]): GestureType {
    if (!landmarks || landmarks.length < 21) return 'unknown';

    const wrist = landmarks[0];
    
    // Landmarks for Finger Tips
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];

    // Compute distances to wrist to check folded states
    const distIndex = this.getDistance(indexTip, wrist);
    const distIndexPIP = this.getDistance(indexPIP, wrist);
    
    const distMiddle = this.getDistance(middleTip, wrist);
    const distMiddlePIP = this.getDistance(middlePIP, wrist);

    const distRing = this.getDistance(ringTip, wrist);
    const distRingPIP = this.getDistance(ringPIP, wrist);

    const distPinky = this.getDistance(pinkyTip, wrist);
    const distPinkyPIP = this.getDistance(pinkyPIP, wrist);

    // Finger extended states (tip is further from wrist than PIP joint)
    const indexExtended = distIndex > distIndexPIP;
    const middleExtended = distMiddle > distMiddlePIP;
    const ringExtended = distRing > distRingPIP;
    const pinkyExtended = distPinky > distPinkyPIP;

    // 1. Check Pinch Gesture (Thumb tip close to Index tip)
    const pinchDistance = this.getDistance(thumbTip, indexTip);
    // Adjust threshold based on depth (z coordinate)
    // When hand is close, pinch distance in normalized space appears larger.
    const averageZ = (thumbTip.z + indexTip.z) / 2;
    // z is negative closer to camera. So if averageZ is more negative, hand is closer.
    const pinchThreshold = 0.045 * (1 - averageZ * 0.5); 
    
    if (pinchDistance < pinchThreshold) {
      // Ensure other fingers aren't fully extended, or if they are, it's still a pinch
      return 'pinch';
    }

    // 2. Check Fist Gesture (All fingers folded)
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'fist';
    }

    // 3. Check Peace / V Gesture (Index and Middle extended, Ring and Pinky folded)
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      // Ensure Index and Middle tips are separated
      const fingerGap = this.getDistance(indexTip, middleTip);
      if (fingerGap > 0.04) {
        return 'peace';
      }
    }

    // 4. Check Pointing Gesture (Only Index extended)
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'point';
    }

    // 5. Check Open Palm (All fingers extended)
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      return 'open_palm';
    }

    return 'unknown';
  }

  /**
   * Helper to identify if the hand is Left or Right.
   * MediaPipe output includes handedness information.
   */
  getHandednessLabel(result: HandLandmarkerResult, handIndex: number): 'Left' | 'Right' {
    if (result.handedness && result.handedness[handIndex]) {
      // MediaPipe detects handedness mirrored sometimes, but we return its classified category
      return result.handedness[handIndex][0].displayName as 'Left' | 'Right';
    }
    return 'Right';
  }
}

export const handTracker = new HandTrackerService();
