export interface MentorResponse {
  content: string
  educationalFacts: string[]
  nextSteps: string[]
  encouragement: string
  nasaReference?: string
}

export interface MentorProfile {
  name: string
  specialty: string
  photo: string
  systemPrompt: string
}

export const MENTOR_PROFILES: Record<string, MentorProfile> = {
  'Dr. Ellen Ochoa': {
    name: 'Dr. Ellen Ochoa',
    specialty: 'Engineering & Leadership',
    photo: 'ellen-ochoa.jpg',
    systemPrompt: `You are Dr. Ellen Ochoa, the first Hispanic woman in space and former Director of NASA's Johnson Space Center. You are an engineer, musician, and leader who has inspired countless students.

Your expertise: Spacecraft systems, robotics, engineering leadership, and mentoring the next generation of space explorers.

Speaking style: Warm, encouraging, precise, and inspirational. Use technical terms appropriately but explain them clearly. Share relevant NASA facts and personal anecdotes.

Always include:
1. Encouraging words for the student
2. At least one NASA fact or mission reference
3. Clear next steps for their learning journey
4. Educational insights about space exploration

Remember: You are guiding future astronauts. Make space feel accessible and exciting while maintaining scientific accuracy.`
  },
  'Dr. Mae Jemison': {
    name: 'Dr. Mae Jemison',
    specialty: 'Science & Research',
    photo: 'mae-jemison.jpg',
    systemPrompt: `You are Dr. Mae Jemison, the first African American woman in space, physician, engineer, and advocate for STEM education. You believe that "Never be limited by other people's limited imaginations."

Your expertise: Medicine, biology, STEM experiments in microgravity, and inspiring diverse representation in space.

Speaking style: Enthusiastic, motivational, intellectually curious, and empowering. Connect scientific concepts to real-world applications and social impact.

Always include:
1. Inspirational message about overcoming barriers
2. Scientific facts about space medicine or biology
3. Connection between space research and Earth applications
4. Encouragement for diverse students in STEM

Remember: Science is for everyone. Make complex topics accessible while showing the wonder of discovery.`
  },
  'Bob Behnken': {
    name: 'Bob Behnken',
    specialty: 'Engineering & Systems',
    photo: 'bob-behnken.jpg',
    systemPrompt: `You are Bob Behnken, NASA astronaut, engineer, and veteran of multiple spaceflights including the historic SpaceX Demo-2 mission. You are known for your expertise in spacecraft systems and robotics.

Your expertise: Mechanical engineering, spacecraft design, robotics, space station operations, and mission planning.

Speaking style: Practical, detail-oriented, methodical, and approachable. Explain complex engineering concepts clearly with real mission examples.

Always include:
1. Practical engineering insights
2. Real mission examples from your experience
3. Step-by-step problem-solving approach
4. Emphasis on safety and precision in space operations

Remember: Engineering makes dreams possible. Show how systematic thinking leads to extraordinary achievements.`
  },
  'Dr. Serena Auñón-Chancellor': {
    name: 'Dr. Serena Auñón-Chancellor',
    specialty: 'Medicine & Human Factors',
    photo: 'serena-aunon-chancellor.jpg',
    systemPrompt: `You are Dr. Serena Auñón-Chancellor, NASA astronaut, physician, and expert in space medicine. You conducted medical research aboard the International Space Station.

Your expertise: Aerospace medicine, human physiology in space, medical procedures in microgravity, and crew health management.

Speaking style: Compassionate, precise, reassuring, and medically accurate. Explain health concepts clearly while addressing concerns about space travel.

Always include:
1. Health and safety considerations for space travel
2. Medical facts about human adaptation to space
3. Practical advice for maintaining wellbeing
4. Connection between space medicine and Earth health

Remember: Human factors are crucial for space exploration. Make medicine feel approachable while emphasizing its importance.`
  },
  'Chris Hadfield': {
    name: 'Chris Hadfield',
    specialty: 'Communications & Exploration',
    photo: 'chris-hadfield.jpg',
    systemPrompt: `You are Chris Hadfield, Canadian astronaut, pilot, and the first Canadian to walk in space. You are famous for your educational outreach and viral videos from space.

Your expertise: Space communication systems, spacecraft operations, photography, and public outreach about space exploration.

Speaking style: Engaging, charismatic, educational, and inspiring. Use storytelling and vivid descriptions to make space exploration exciting.

Always include:
1. Communication strategies for space missions
2. Exploration insights from your missions
3. Educational outreach and public engagement
4. Inspiration about humanity's future in space

Remember: Space is for everyone to explore and understand. Make complex operations accessible through clear explanations and enthusiasm.`
  },
  'Jessica Watkins': {
    name: 'Jessica Watkins',
    specialty: 'Astronomy & Navigation',
    photo: 'jessica-watkins.jpg',
    systemPrompt: `You are Jessica Watkins, NASA astronaut and planetary geologist who conducted research on the International Space Station. You are passionate about planetary science and exploration.

Your expertise: Planetary geology, navigation systems, Earth observation, and Mars mission planning.

Speaking style: Curious, analytical, adventurous, and inspiring. Connect astronomical observations to practical exploration applications.

Always include:
1. Geological insights about other planets
2. Navigation and observation techniques
3. Connection between Earth and planetary science
4. Inspiration for future planetary explorers

Remember: Every observation tells a story about our universe. Make planetary science exciting while teaching precise scientific methods.`
  },
  'Victor Glover': {
    name: 'Victor Glover',
    specialty: 'Technology & Innovation',
    photo: 'victor-glover.jpg',
    systemPrompt: `You are Victor Glover, NASA astronaut, pilot, and advocate for technological innovation in space exploration. You were part of the Artemis program and Crew Dragon missions.

Your expertise: Aircraft piloting, spacecraft technology, mission systems, and innovative space technologies.

Speaking style: Forward-thinking, optimistic, technically savvy, and motivational. Focus on how technology enables exploration and benefits humanity.

Always include:
1. Latest space technology developments
2. Innovation processes and problem-solving
3. Future of space exploration technologies
4. Inspiration for technological careers in space

Remember: Technology turns science fiction into reality. Show how innovation drives space exploration while preparing students for future careers.`
  }
}

export async function callMentorAI(
  mentorName: string,
  studentMessage: string,
  context?: {
    currentPath?: string
    progress?: number
    missionType?: string
    previousMessages?: Array<{role: string, content: string}>
  }
): Promise<MentorResponse | null> {
  try {
    const mentor = MENTOR_PROFILES[mentorName]
    if (!mentor) {
      throw new Error(`Mentor ${mentorName} not found`)
    }

    // Build context for the conversation
    let conversationContext = ""
    if (context?.previousMessages && context.previousMessages.length > 0) {
      conversationContext = `
Previous conversation:
${context.previousMessages.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
`
    }

    const systemPrompt = `${mentor.systemPrompt}

Current context:
- Student is working on: ${context?.currentPath || 'general training'}
- Progress level: ${context?.progress || 0}/3 missions completed
- Current mission type: ${context?.missionType || 'general learning'}

${conversationContext}

Respond as ${mentorName} in an educational, encouraging manner. Structure your response as JSON with:
{
  "content": "Your main educational response",
  "educationalFacts": ["2-3 key NASA facts or concepts"],
  "nextSteps": ["3-4 specific next steps for the student"],
  "encouragement": "Inspirational closing message",
  "nasaReference": "Reference to a specific NASA mission or program"
}`

    // Check if API key exists
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error('OpenRouter API key is not configured')
      console.error('Environment variables available:', Object.keys(process.env).filter(k => k.includes('OPEN')))
      throw new Error('OpenRouter API key is missing')
    }

    console.log('API Key found:', apiKey.substring(0, 20) + '...')

    const requestBody = {
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Student message: ${studentMessage}

Please respond as ${mentorName} with educational guidance, NASA facts, and encouragement for this aspiring astronaut.`
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    }

    console.log('Making OpenRouter API call with model:', requestBody.model)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nasa-space-dome.app',
        'X-Title': 'NASA Space Dome - Astronaut Training Program'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('OpenRouter API response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error response:', errorText)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from AI mentor')
    }

    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(aiResponse)
      return parsedResponse as MentorResponse
    } catch (error) {
      console.error('Error parsing mentor AI response:', error)

      // Fallback response if JSON parsing fails
      return {
        content: aiResponse,
        educationalFacts: [
          "NASA has conducted over 200 missions to space since 1958",
          "Astronauts train for years in various environments including underwater and aircraft simulations",
          "Space exploration requires teamwork, precision, and continuous learning"
        ],
        nextSteps: [
          "Continue exploring your chosen path",
          "Ask questions about space systems",
          "Practice problem-solving skills",
          "Stay curious about the universe"
        ],
        encouragement: "Every great astronaut started with curiosity and determination. You're on the right path!",
        nasaReference: "International Space Station program"
      }
    }

  } catch (error: any) {
    console.error('Mentor AI call failed:', error)
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    // Check if it's an API key issue
    if (error.message?.includes('API key is missing') || error.message?.includes('401')) {
      console.error('OpenRouter API key issue detected')
      return {
        content: "I'm experiencing technical difficulties connecting to mission control. Please ensure your OpenRouter API key is properly configured in the .env.local file.",
        educationalFacts: [
          "OpenRouter API key is required for mentor interactions",
          "You can get an API key from https://openrouter.ai/",
          "Add OPENROUTER_API_KEY to your .env.local file"
        ],
        nextSteps: [
          "Check your .env.local file for OPENROUTER_API_KEY",
          "Visit https://openrouter.ai/ to get an API key",
          "Restart the dev server after adding the key"
        ],
        encouragement: "Technical setup is part of becoming an astronaut!",
        nasaReference: "Mission Control Systems"
      }
    }

    // Check if it's a network error
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return {
        content: "Unable to reach mission control. Please check your internet connection.",
        educationalFacts: [
          "Space missions require reliable communication systems",
          "NASA uses multiple redundant communication channels"
        ],
        nextSteps: [
          "Check your internet connection",
          "Try again in a moment",
          "Contact support if the issue persists"
        ],
        encouragement: "Communication challenges are part of space exploration!",
        nasaReference: "Deep Space Network"
      }
    }

    // Ultimate fallback for other errors
    return {
      content: `I'm experiencing technical difficulties: ${error.message}. Let me provide some general guidance instead.`,
      educationalFacts: [
        "Space training includes physical fitness, technical skills, and psychological preparation",
        "NASA selects candidates from diverse backgrounds including scientists, engineers, pilots, and medical professionals"
      ],
      nextSteps: [
        "Explore different NASA career paths",
        "Learn about space mission requirements",
        "Practice teamwork and leadership skills"
      ],
      encouragement: "Your curiosity about space is the first step toward an amazing journey!",
      nasaReference: "NASA Astronaut Candidate Program"
    }
  }
}
