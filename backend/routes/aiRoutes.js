import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { authenticateToken } from '../auth.js';
import { getMoments } from '../db.js';

const router = Router();

router.post('/reflect', authenticateToken, async (req, res) => {
  try {
    const { space_id } = req.body;

    // Fetch user or space moments
    const momentsData = getMoments({
      space_id: space_id || undefined,
      user_id: !space_id ? req.user.id : undefined,
      per_page: 25
    });

    const moments = momentsData?.data || [];
    if (moments.length === 0) {
      return res.json({
        title: "Your LifeLoop Journal",
        summary: "No moments logged yet! Share a memory, photo, or mood in your space to unlock AI reflections.",
        mood_vibe: "Calm & Ready",
        reflection_quote: "Every journey begins with a single moment.",
        highlights: ["Log your first photo or song", "Create a space with friends", "Leave a time capsule note"],
        encouragement: "Start adding memories to see your AI memory tree flourish!"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback reflection if key is not configured
      const moods = moments.map(m => m.mood);
      const uniqueMoods = [...new Set(moods)].join(', ');
      return res.json({
        title: "LifeLoop Memory Reflection",
        summary: `You have logged ${moments.length} memory loops. Your overall atmosphere spans: ${uniqueMoods}.`,
        mood_vibe: moods[0] || 'Reflective',
        reflection_quote: "Hold on to the moments that make your heart smile.",
        highlights: moments.slice(0, 3).map(m => `"${m.title}" (${m.mood})`),
        encouragement: "Keep capturing your daily loops!"
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const memorySummaries = moments.map((m, i) => 
      `${i + 1}. Title: "${m.title}" | Mood: ${m.mood} | Category: ${m.category} | Date: ${m.date} | Description: ${m.description || 'N/A'}`
    ).join('\n');

    const prompt = `You are LifeLoop AI, a warm, thoughtful, friendly companion in a private digital scrapbook app. 
Analyze these user moments and generate a warm, meaningful memory reflection digest.

Moments:
${memorySummaries}

Respond ONLY in JSON format matching this structure:
{
  "title": "A short poetic title for this memory reflection",
  "summary": "A 2-3 sentence heartwarming reflection summarizing the vibe, shared emotional journey, and highlights of these moments",
  "mood_vibe": "Primary emotional atmosphere (e.g., Nostalgic & Warm, Joyful Chaos, Grateful)",
  "reflection_quote": "A single inspiring quote or gentle takeaway about connection and memories",
  "highlights": ["Key highlight 1", "Key highlight 2", "Key highlight 3"],
  "encouragement": "A short, friendly note encouraging the user or group to keep logging life's small loops"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '';
    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (e) {
      parsedJson = {
        title: "LifeLoop Memory Journey",
        summary: responseText,
        mood_vibe: moments[0]?.mood || "Warm",
        reflection_quote: "Memories stay forever when shared with loved ones.",
        highlights: moments.slice(0, 3).map(m => m.title),
        encouragement: "Keep capturing your daily moments!"
      };
    }

    return res.json(parsedJson);
  } catch (err) {
    console.error("AI Reflection Error:", err);
    return res.status(500).json({ 
      error: err.message || "Failed to generate AI reflection",
      summary: "Could not connect to AI reflection service right now. Keep posting moments and check back soon!"
    });
  }
});

export default router;
