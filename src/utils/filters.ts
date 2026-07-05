import * as fabric from "fabric";

// Custom Fabric Filter for advanced granular image adjustments (Exposure, Temp, Tint, Vibrance, clarity, etc.)
export class AdjustmentFilter extends fabric.filters.BaseFilter<any> {
  static type = "Adjustment";

  exposure = 0;
  temperature = 0;
  tint = 0;
  gamma = 1;
  vibrance = 0;
  sharpness = 0;
  highlights = 0;
  shadows = 0;
  whites = 0;
  blacks = 0;
  clarity = 0;

  constructor(options?: any) {
    super(options);
    if (options) {
      Object.assign(this, options);
    }
  }

  applyTo2d({ imageData }: { imageData: ImageData }) {
    const { data, width, height } = imageData;
    const expFactor = Math.pow(2, this.exposure);
    const temp = this.temperature;
    const tintVal = this.tint;
    const gammaVal = this.gamma;
    const vib = this.vibrance;
    const high = this.highlights;
    const shad = this.shadows;
    const whiteVal = this.whites;
    const blackVal = this.blacks;
    const clar = this.clarity;
    const sharp = this.sharpness;

    // Fast copy for sharpness convolution if needed
    let originalData: Uint8ClampedArray | null = null;
    if (sharp > 0) {
      originalData = new Uint8ClampedArray(data);
    }

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 1. Exposure
      if (this.exposure !== 0) {
        r *= expFactor;
        g *= expFactor;
        b *= expFactor;
      }

      // 2. Temperature & Tint
      if (temp !== 0) {
        r += temp * 25;
        b -= temp * 25;
      }
      if (tintVal !== 0) {
        g += tintVal * 20;
        r -= tintVal * 10;
        b -= tintVal * 10;
      }

      // 3. Gamma
      if (gammaVal !== 1 && gammaVal > 0) {
        r = 255 * Math.pow(r / 255, 1 / gammaVal);
        g = 255 * Math.pow(g / 255, 1 / gammaVal);
        b = 255 * Math.pow(b / 255, 1 / gammaVal);
      }

      // 4. Vibrance
      if (vib !== 0) {
        const max = Math.max(r, g, b);
        const avg = (r + g + b) / 3;
        const amt = vib * (1.0 - (max - avg) / 255) * 1.5;
        r += (max - r) * amt;
        g += (max - g) * amt;
        b += (max - b) * amt;
      }

      // Compute luminance for Highlights/Shadows/Whites/Blacks/Clarity
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // 5. Highlights & Shadows
      if (high !== 0 && lum > 0.5) {
        const factor = (lum - 0.5) * 2 * high;
        r += (255 - r) * factor;
        g += (255 - g) * factor;
        b += (255 - b) * factor;
      }
      if (shad !== 0 && lum < 0.5) {
        const factor = (0.5 - lum) * 2 * shad;
        r += r * factor;
        g += g * factor;
        b += b * factor;
      }

      // 6. Whites & Blacks
      if (whiteVal !== 0 && lum > 0.75) {
        const factor = (lum - 0.75) * 4 * whiteVal;
        r += (255 - r) * factor;
        g += (255 - g) * factor;
        b += (255 - b) * factor;
      }
      if (blackVal !== 0 && lum < 0.25) {
        const factor = (0.25 - lum) * 4 * blackVal;
        r += r * factor;
        g += g * factor;
        b += b * factor;
      }

      // 7. Clarity (midtone contrast)
      if (clar !== 0) {
        const midFactor = Math.sin(lum * Math.PI) * clar * 0.4;
        r += (r - 127) * midFactor;
        g += (g - 127) * midFactor;
        b += (b - 127) * midFactor;
      }

      // Clamp values
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    // 8. Sharpness (Fast unsharp-mask using original data)
    if (sharp > 0 && originalData) {
      const sharpAmt = sharp * 1.5;
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;

          // Check difference with neighbors (left, right, top, bottom)
          const leftIdx = idx - 4;
          const rightIdx = idx + 4;
          const topIdx = idx - width * 4;
          const bottomIdx = idx + width * 4;

          for (let c = 0; c < 3; c++) {
            const current = data[idx + c];
            const original = originalData[idx + c];
            const neighborsAvg = (
              originalData[leftIdx + c] +
              originalData[rightIdx + c] +
              originalData[topIdx + c] +
              originalData[bottomIdx + c]
            ) / 4;

            // Boost the difference between original pixel and neighbors
            const sharpVal = current + (original - neighborsAvg) * sharpAmt;
            data[idx + c] = Math.min(255, Math.max(0, sharpVal));
          }
        }
      }
    }
  }

  toObject() {
    return {
      type: "Adjustment",
      exposure: this.exposure,
      temperature: this.temperature,
      tint: this.tint,
      gamma: this.gamma,
      vibrance: this.vibrance,
      sharpness: this.sharpness,
      highlights: this.highlights,
      shadows: this.shadows,
      whites: this.whites,
      blacks: this.blacks,
      clarity: this.clarity,
    };
  }
}

// VHS effect filter
export class VHSEffectFilter extends fabric.filters.BaseFilter<any> {
  static type = "VHSEffect";

  applyTo2d({ imageData }: { imageData: ImageData }) {
    const { data, width, height } = imageData;

    // Scanline & RGB channel shifts
    for (let y = 0; y < height; y++) {
      const isScanline = y % 4 === 0;
      const noise = (Math.random() - 0.5) * 15; // horizontal static noise

      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Apply scanline effect
        if (isScanline) {
          data[idx] *= 0.82;
          data[idx + 1] *= 0.82;
          data[idx + 2] *= 0.88;
        }

        // Apply color balance adjustments (slight magenta tint for retro vibe)
        data[idx] = Math.min(255, Math.max(0, data[idx] + noise + 10));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise - 5));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise + 15));
      }
    }

    // Horizontal channel shift (color misalignment)
    const shift = 4; // pixels
    const tempCopy = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = shift; x < width - shift; x++) {
        const destIdx = (y * width + x) * 4;
        const sourceRedIdx = (y * width + (x - shift)) * 4;
        const sourceBlueIdx = (y * width + (x + shift)) * 4;

        // Shift red channel and blue channel
        data[destIdx] = tempCopy[sourceRedIdx]; // R
        data[destIdx + 2] = tempCopy[sourceBlueIdx]; // B
      }
    }
  }

  toObject() {
    return { type: "VHSEffect" };
  }
}

// Halftone dots effect filter
export class HalftoneEffectFilter extends fabric.filters.BaseFilter<any> {
  static type = "HalftoneEffect";

  applyTo2d({ imageData }: { imageData: ImageData }) {
    const { data, width, height } = imageData;
    const tempCopy = new Uint8ClampedArray(data);
    const size = 6; // size of the grid blocks

    // Zero out data first
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }

    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        // Compute average luminance in this block
        let sumLum = 0;
        let count = 0;
        let avgR = 0;
        let avgG = 0;
        let avgB = 0;

        for (let dy = 0; dy < size && y + dy < height; dy++) {
          for (let dx = 0; dx < size && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const r = tempCopy[idx];
            const g = tempCopy[idx + 1];
            const b = tempCopy[idx + 2];
            sumLum += (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            avgR += r;
            avgG += g;
            avgB += b;
            count++;
          }
        }

        if (count === 0) continue;
        const meanLum = sumLum / count;
        avgR /= count;
        avgG /= count;
        avgB /= count;

        // Draw a circle of radius depending on dark-ness (lower luminance = larger dot)
        const maxRadius = (size / 2) * 1.2;
        const dotRadius = maxRadius * (1.0 - meanLum);

        if (dotRadius > 0.5) {
          const centerX = x + size / 2;
          const centerY = y + size / 2;

          for (let dy = -size; dy < size * 2; dy++) {
            for (let dx = -size; dx < size * 2; dx++) {
              const py = Math.floor(centerY + dy);
              const px = Math.floor(centerX + dx);

              if (px >= 0 && px < width && py >= 0 && py < height) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= dotRadius) {
                  const idx = (py * width + px) * 4;
                  // Set halftone color based on original average color
                  data[idx] = avgR * 0.8;
                  data[idx + 1] = avgG * 0.8;
                  data[idx + 2] = avgB * 0.8;
                }
              }
            }
          }
        }
      }
    }
  }

  toObject() {
    return { type: "HalftoneEffect" };
  }
}

// RGB Shift Effect filter
export class RGBShiftEffectFilter extends fabric.filters.BaseFilter<any> {
  static type = "RGBShiftEffect";
  shift = 8;

  constructor(options?: any) {
    super(options);
    if (options && options.shift !== undefined) {
      this.shift = options.shift;
    }
  }

  applyTo2d({ imageData }: { imageData: ImageData }) {
    const { data, width, height } = imageData;
    const shift = Math.floor(this.shift);
    if (shift === 0) return;

    const tempCopy = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const destIdx = (y * width + x) * 4;

        // Red offset left
        const rx = Math.max(0, x - shift);
        const rIdx = (y * width + rx) * 4;

        // Blue offset right
        const bx = Math.min(width - 1, x + shift);
        const bIdx = (y * width + bx) * 4;

        data[destIdx] = tempCopy[rIdx]; // Red channel
        data[destIdx + 2] = tempCopy[bIdx]; // Blue channel
      }
    }
  }

  toObject() {
    return {
      type: "RGBShiftEffect",
      shift: this.shift
    };
  }
}

// Motion Blur Effect filter (Fast horizontal box blur)
export class MotionBlurEffectFilter extends fabric.filters.BaseFilter<any> {
  static type = "MotionBlurEffect";
  blurAmount = 10; // offset pixels

  constructor(options?: any) {
    super(options);
    if (options && options.blurAmount !== undefined) {
      this.blurAmount = options.blurAmount;
    }
  }

  applyTo2d({ imageData }: { imageData: ImageData }) {
    const { data, width, height } = imageData;
    const amount = Math.min(30, Math.max(1, Math.floor(this.blurAmount)));
    const tempCopy = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let count = 0;

        for (let d = -amount; d <= amount; d++) {
          const px = x + d;
          if (px >= 0 && px < width) {
            const idx = (y * width + px) * 4;
            sumR += tempCopy[idx];
            sumG += tempCopy[idx + 1];
            sumB += tempCopy[idx + 2];
            count++;
          }
        }

        const destIdx = (y * width + x) * 4;
        data[destIdx] = sumR / count;
        data[destIdx + 1] = sumG / count;
        data[destIdx + 2] = sumB / count;
      }
    }
  }

  toObject() {
    return {
      type: "MotionBlurEffect",
      blurAmount: this.blurAmount
    };
  }
}

// Bloom effect filter (boost high exposure and blur overlay)
export class BloomEffectFilter extends fabric.filters.BaseFilter<any> {
  static type = "BloomEffect";

  applyTo2d({ imageData }: { imageData: ImageData }) {
    const { data, width, height } = imageData;
    const tempCopy = new Uint8ClampedArray(data);

    // 1. Create blurred high-pass version
    const highPass = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Extract bright highlights
      if (lum > 0.6) {
        highPass[i] = r;
        highPass[i + 1] = g;
        highPass[i + 2] = b;
      } else {
        highPass[i] = 0;
        highPass[i + 1] = 0;
        highPass[i + 2] = 0;
      }
      highPass[i + 3] = 255;
    }

    // Simple horizontal blur on high-pass
    const blurRad = 4;
    const blurredHighPass = new Uint8ClampedArray(highPass.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let count = 0;

        for (let d = -blurRad; d <= blurRad; d++) {
          const px = x + d;
          if (px >= 0 && px < width) {
            const idx = (y * width + px) * 4;
            sumR += highPass[idx];
            sumG += highPass[idx + 1];
            sumB += highPass[idx + 2];
            count++;
          }
        }

        const destIdx = (y * width + x) * 4;
        blurredHighPass[destIdx] = sumR / count;
        blurredHighPass[destIdx + 1] = sumG / count;
        blurredHighPass[destIdx + 2] = sumB / count;
      }
    }

    // Blend highpass back onto original with "Screen" blend mode
    for (let i = 0; i < data.length; i += 4) {
      const r1 = tempCopy[i];
      const g1 = tempCopy[i + 1];
      const b1 = tempCopy[i + 2];

      const r2 = blurredHighPass[i] * 1.5; // bloom intensity
      const g2 = blurredHighPass[i + 1] * 1.5;
      const b2 = blurredHighPass[i + 2] * 1.5;

      // Screen formula: 255 - (255 - a) * (255 - b) / 255
      data[i] = 255 - ((255 - r1) * (255 - r2)) / 255;
      data[i + 1] = 255 - ((255 - g1) * (255 - g2)) / 255;
      data[i + 2] = 255 - ((255 - b1) * (255 - b2)) / 255;
    }
  }

  toObject() {
    return { type: "BloomEffect" };
  }
}

// Register all custom filters
(fabric.filters as any).Adjustment = AdjustmentFilter;
(fabric.filters as any).VHSEffect = VHSEffectFilter;
(fabric.filters as any).HalftoneEffect = HalftoneEffectFilter;
(fabric.filters as any).RGBShiftEffect = RGBShiftEffectFilter;
(fabric.filters as any).MotionBlurEffect = MotionBlurEffectFilter;
(fabric.filters as any).BloomEffect = BloomEffectFilter;
