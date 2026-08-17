const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route  POST /api/posts/generate-caption
exports.generateCaption = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const prompt = `Look at this photo and write 3 short, catchy Instagram captions for it.
Keep each one under 15 words. Include relevant emojis where natural.
Respond ONLY with a JSON array of 3 strings, nothing else, no markdown formatting, no backticks.
Example format: ["caption one", "caption two", "caption three"]`;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();

    let captions;
    try {
      captions = JSON.parse(cleaned);
    } catch (parseErr) {
      captions = cleaned
        .split("\n")
        .map((line) => line.replace(/^["\d.\-\s]+/, "").replace(/["\,]+$/, "").trim())
        .filter((line) => line.length > 0)
        .slice(0, 3);
    }

    res.status(200).json({ captions });
  } catch (error) {
    console.error("Generate caption error:", error.message);
    res.status(500).json({ message: "Failed to generate captions. Try again." });
  }
};

// Helper — generates alt text from an image URL
exports.generateAltTextFromUrl = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = response.headers.get("content-type") || "image/jpeg";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const imagePart = {
      inlineData: { data: base64Data, mimeType },
    };

    const prompt = `Describe this image in one short, plain sentence for a screen reader
(accessibility alt text). Be factual and objective — describe what's visibly in the photo,
not a caption or opinion. Max 20 words. Respond with ONLY the description, no quotes, no labels.`;

    const result = await model.generateContent([prompt, imagePart]);
    return result.response.text().trim();
  } catch (error) {
    console.error("Generate alt text error:", error.message);
    return "";
  }
};