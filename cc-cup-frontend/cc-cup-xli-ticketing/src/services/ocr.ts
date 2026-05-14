import axios from 'axios';

export interface KtpData {
  nik: string;
  fullName: string;
}

/**
 * Service to handle Google Vision OCR for Indonesian KTP
 */
export const ocrService = {
  /**
   * Extract NIK and Name from raw OCR text
   */
  parseKtpText(text: string): KtpData {
    const lines = text.split('\n');
    let nik = "";
    let fullName = "";

    // NIK is usually 16 digits
    const nikMatch = text.match(/(\d{16})/);
    if (nikMatch) {
      nik = nikMatch[1];
    }

    // Nama extraction logic
    // Usually follows "Nama" or "Nama :"
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase();
      if (line.includes("NAMA") && !fullName) {
        // Try to get the name from the same line or next line
        const parts = line.split(/[:;-]/);
        if (parts.length > 1 && parts[1].trim().length > 3) {
          fullName = parts[1].trim();
        } else if (i + 1 < lines.length) {
          fullName = lines[i + 1].trim();
        }
      }
    }

    // Clean up name (remove common OCR artifacts)
    fullName = fullName.replace(/[:;]/g, '').trim();

    return { nik, fullName };
  },

  /**
   * Perform OCR using Google Vision API (REST)
   * Note: This requires an Access Token or API Key.
   * Since we are in a frontend app, this should ideally be proxied through a backend.
   */
  async performOcr(imageBase64: string, apiKey: string): Promise<KtpData> {
    try {
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          requests: [
            {
              image: {
                content: imageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
              },
              features: [
                {
                  type: "TEXT_DETECTION",
                },
              ],
            },
          ],
        }
      );

      const fullText = response.data.responses[0]?.fullTextAnnotation?.text || "";
      if (!fullText) {
        throw new Error("No text detected in image.");
      }

      return this.parseKtpText(fullText);
    } catch (error) {
      console.error("OCR Error:", error);
      throw error;
    }
  }
};
