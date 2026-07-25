import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, Dimensions, Image as RNImage, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import * as ImageManipulator from 'expo-image-manipulator';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CROP_SIZE = SCREEN_WIDTH * 0.8; 

export default function CustomImageCropper({
  visible,
  imageUri,
  onCancel,
  onCrop,
}: {
  visible: boolean;
  imageUri: string | null;
  onCancel: () => void;
  onCrop: (uri: string) => void;
}) {
  const [imgSize, setImgSize] = useState({ w: 1, h: 1 });
  const [isProcessing, setIsProcessing] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    if (imageUri) {
      RNImage.getSize(imageUri, (w, h) => {
        setImgSize({ w, h });
      });
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      setIsProcessing(false);
    }
  }, [imageUri]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, savedScale.value * e.scale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleCrop = async () => {
    if (!imageUri) return;
    setIsProcessing(true);

    try {
      // Calculate displayed dimensions based on aspect ratio
      const imgRatio = imgSize.w / imgSize.h;
      let displayedW = CROP_SIZE;
      let displayedH = CROP_SIZE;

      if (imgRatio > 1) {
        // Landscape
        displayedH = CROP_SIZE / imgRatio;
      } else {
        // Portrait
        displayedW = CROP_SIZE * imgRatio;
      }

      // Convert pan/zoom translations into image-space coordinates
      const currentScale = scale.value;
      
      const actualDisplayedW = displayedW * currentScale;
      const actualDisplayedH = displayedH * currentScale;

      // Image top-left in screen center relative coordinates:
      const imgScreenX = translateX.value - (actualDisplayedW / 2);
      const imgScreenY = translateY.value - (actualDisplayedH / 2);
      
      // Mask top-left in screen center relative coordinates:
      const maskScreenX = -(CROP_SIZE / 2);
      const maskScreenY = -(CROP_SIZE / 2);

      // Offset in screen pixels:
      const cropXScreen = maskScreenX - imgScreenX;
      const cropYScreen = maskScreenY - imgScreenY;

      // Scale factor from screen size to actual image pixels
      const pixelScale = imgSize.w / actualDisplayedW;

      let originX = cropXScreen * pixelScale;
      let originY = cropYScreen * pixelScale;
      let finalCropSize = CROP_SIZE * pixelScale;

      // Clamp values so we don't crop outside image bounds
      originX = Math.max(0, Math.min(originX, imgSize.w - finalCropSize));
      originY = Math.max(0, Math.min(originY, imgSize.h - finalCropSize));
      
      // In case the crop is larger than the image (shouldn't happen with proper zoom bounds)
      finalCropSize = Math.min(finalCropSize, imgSize.w - originX, imgSize.h - originY);

      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: Math.floor(originX),
              originY: Math.floor(originY),
              width: Math.floor(finalCropSize),
              height: Math.floor(finalCropSize),
            },
          },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setIsProcessing(false);
      onCrop(manipResult.uri);
    } catch (err) {
      console.error('Crop error:', err);
      setIsProcessing(false);
      onCancel(); // fallback
    }
  };

  if (!visible || !imageUri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.overlay}>
          <Text style={styles.title}>Move and Scale</Text>
          
          <View style={styles.cropArea}>
            <GestureDetector gesture={composed}>
              <Animated.View style={[styles.imageContainer, animatedStyle]}>
                <RNImage 
                  source={{ uri: imageUri }} 
                  style={styles.image} 
                  resizeMode="contain" 
                />
              </Animated.View>
            </GestureDetector>
            
            {/* Dark overlay mask with transparent circle in center */}
            <View style={styles.maskContainer} pointerEvents="none">
              <View style={styles.maskTop} />
              <View style={styles.maskMiddleRow}>
                <View style={styles.maskSide} />
                <View style={styles.maskHole} />
                <View style={styles.maskSide} />
              </View>
              <View style={styles.maskBottom} />
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.btn} onPress={handleCrop} disabled={isProcessing}>
              {isProcessing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const maskBg = 'rgba(0,0,0,0.7)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    position: 'absolute',
    top: 60,
    zIndex: 10,
  },
  cropArea: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: CROP_SIZE,
    height: CROP_SIZE,
  },
  maskContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  maskTop: {
    flex: 1,
    backgroundColor: maskBg,
  },
  maskMiddleRow: {
    flexDirection: 'row',
    height: CROP_SIZE,
  },
  maskSide: {
    flex: 1,
    backgroundColor: maskBg,
  },
  maskHole: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    borderRadius: CROP_SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  maskBottom: {
    flex: 1,
    backgroundColor: maskBg,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  btn: {
    backgroundColor: '#7EB93C',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#333',
  },
  cancelText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
