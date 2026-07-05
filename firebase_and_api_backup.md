# Firebase & API Configuration Backup

This file is a consolidated backup of the original database blueprints, rules, collection configurations, and advanced image generation engine fallback APIs of this project. If you wish to restore the full multi-engine generation system, you can refer to the schemas, endpoints, and credentials preserved here.

---

## 1. Database Blueprints & Entities (Firestore)

### Entities Schema

#### `User`
* **Description**: Tracks user account profiles, allocated credits, and timestamps.
* **Fields**:
  * `email` (string): User email address.
  * `credits` (integer): Remaining image generation/editing credits.
  * `createdAt` (string): ISO timestamp of user registration.

#### `FaceHash`
* **Description**: Biometric face descriptor used for multi-account prevention and anti-spam controls.
* **Fields**:
  * `faceCode` (array of numbers): 128-dimensional float coordinates vector representing facial features.
  * `email` (string): Associated user account email.
  * `createdAt` (string): ISO timestamp when the face descriptor was processed.

#### `UserChat`
* **Description**: Tracks conversational histories, AI assistant chat logs, and generated image collections.
* **Fields**:
  * `messages` (array of objects): Sequence of dialogue bubbles with roles (`user`, `assistant`) and visual generation outputs.
  * `updatedAt` (string): ISO timestamp of the latest exchange.

#### `UserImage`
* **Description**: Tracks generated picture artifacts and public portfolio listings.
* **Fields**:
  * `userId` (string): UID of the creative owner.
  * `imageUrl` (string): Base64 encoded JPEG data or external storage link.
  * `prompt` (string): Text query used to generate the image.
  * `createdAt` (string): Creation timestamp.

### Firestore Security Collections Mapping
* `/users/{userId}`: Governed by standard write policies verifying `request.auth.uid == userId`.
* `/face_hashes/{docId}`: Secure biometric records checked to prevent credit bypasses.
* `/user_chats/{userId}`: Conversation histories loaded dynamically.
* `/user_images/{imageId}`: Custom profile portfolios of generated artworks.

---

## 2. Text-to-Image Generation APIs & Backup Implementations

### Engine A: Hugging Face Inference API
* **Endpoint**: `https://api-inference.huggingface.co/models/{model}`
* **Default Models**:
  * Text-to-Image: `stabilityai/stable-diffusion-xl-base-1.0`
  * Inpainting: `stabilityai/stable-diffusion-2-inpainting`
* **Authorization Token**: `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`

### Engine B: Pollinations AI (Fully Free / Unlimited)
* **Endpoint**: `https://image.pollinations.ai/p/{prompt}`
* **Parameters**: `?width=1024&height=1024&model=flux`
* **Usage**: Ideal backup for styled illustration and creative artwork outputs without requiring keys or billing.

### Engine C: DeepInfra FLUX.1 (High Speed Premium)
* **Endpoint**: `https://api.deepinfra.com/v1/openai/images/generations`
* **Model**: `black-forest-labs/FLUX.1-schnell`
* **Authorization Token**: `8LcNMO6EZ9JGboB0BXquuBRTd3KYuuOb`

### Segmind SD 1.5 & Img2Img Pipelines
* **Image editing & Inpainting endpoint**: `https://api.segmind.com/v1/sd15-img2img`
* Used base64 inputs to perform hybrid, non-destructive editing of user images locally.

---

## 3. High-Quality Vector SVG Fallback Engine (Local)
For fully-offline situations or total API depletion, the following system was used to generate deterministic, stylized vector artwork on the fly by hashing the user's input:

```typescript
export const FALLBACK_SVG_GENERATOR = {
  generate(promptText: string): string {
    const themes = [
      { bg: "#0D0E15", accent1: "#8B5CF6", accent2: "#3B82F6", accent3: "#10B981" },
      { bg: "#030712", accent1: "#FF007F", accent2: "#7928CA", accent3: "#10B981" },
      { bg: "#0F172A", accent1: "#06B6D4", accent2: "#3B82F6", accent3: "#8B5CF6" },
      { bg: "#1C1917", accent1: "#F59E0B", accent2: "#EF4444", accent3: "#D946EF" }
    ];
    
    const seed = String(promptText || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const selectedTheme = themes[seed % themes.length];
    
    let patternSvg = "";
    for (let i = 0; i < 20; i++) {
      const size = 60 + ((seed + i * 43) % 280);
      const x = (seed + i * 117) % 800;
      const y = (seed + i * 83) % 800;
      if (i % 3 === 0) {
        patternSvg += `<circle cx="${x}" cy="${y}" r="${size}" stroke="${selectedTheme.accent1}" fill="none" opacity="0.1" />`;
      } else {
        patternSvg += `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="8" stroke="${selectedTheme.accent2}" fill="none" opacity="0.1" />`;
      }
    }
    
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <rect width="100%" height="100%" fill="${selectedTheme.bg}" />
        ${patternSvg}
        <text x="400" y="400" text-anchor="middle" fill="#FFF" font-size="18">${promptText}</text>
      </svg>
    `;
    return Buffer.from(svgString.trim()).toString("base64");
  }
};
```
