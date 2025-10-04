import { NextRequest, NextResponse } from 'next/server'

interface Mission {
  id: string
  title: string
  description: string
  type: 'quiz' | 'simulation' | 'exploration' | 'analysis'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  content: {
    question?: string
    options?: string[]
    correctAnswer?: number
    explanation?: string
    facts?: string[]
    tasks?: string[]
  }
}

const missions: Record<string, Mission[]> = {
  'Science & Research': [
    {
      id: 'science-1',
      title: 'Microgravity Plant Growth',
      description: 'Learn about how plants grow differently in space',
      type: 'quiz',
      difficulty: 'easy',
      points: 50,
      content: {
        question: 'Why do plants grow differently in microgravity?',
        options: [
          'Lack of gravity affects cell division and growth direction',
          'Plants need soil which isn\'t available in space',
          'Space radiation kills plant cells',
          'Temperature differences affect photosynthesis'
        ],
        correctAnswer: 0,
        explanation: 'In microgravity, plants don\'t know which way is "up," so their roots and stems grow in unexpected directions. This is crucial for long-duration space missions where we need to grow food.'
      }
    },
    {
      id: 'science-2',
      title: 'Crystal Growth Experiment',
      description: 'Understanding protein crystal formation in space',
      type: 'analysis',
      difficulty: 'medium',
      points: 75,
      content: {
        facts: [
          'Crystals grown in space are often larger and more perfect than Earth-grown crystals',
          'This helps scientists understand protein structures for drug development',
          'The International Space Station has dedicated facilities for crystal growth experiments'
        ],
        tasks: [
          'Analyze how microgravity affects crystal formation',
          'Explain why space-grown crystals are better for research',
          'Design an experiment for growing crystals on Mars'
        ]
      }
    },
    {
      id: 'science-3',
      title: 'Fluid Physics in Space',
      description: 'Investigating how liquids behave without gravity',
      type: 'exploration',
      difficulty: 'hard',
      points: 100,
      content: {
        facts: [
          'Surface tension becomes the dominant force in microgravity',
          'Bubbles and droplets form perfect spheres in space',
          'This research improves materials processing and medical devices'
        ],
        tasks: [
          'Explain capillary action in microgravity',
          'Design a fluid experiment for the ISS',
          'Discuss applications for Earth technology'
        ]
      }
    }
  ],
  'Engineering & Systems': [
    {
      id: 'engineering-1',
      title: 'Spacecraft Thermal Control',
      description: 'Managing temperature extremes in space',
      type: 'quiz',
      difficulty: 'medium',
      points: 60,
      content: {
        question: 'What is the primary method spacecraft use to control temperature in space?',
        options: [
          'Radiators that emit heat as infrared radiation',
          'Active cooling systems like refrigerators',
          'Insulation blankets to trap heat',
          'Solar panels that convert heat to electricity'
        ],
        correctAnswer: 0,
        explanation: 'Spacecraft use radiators to reject excess heat as infrared radiation. In the vacuum of space, conduction and convection don\'t work, so radiation is the only way to cool down.'
      }
    },
    {
      id: 'engineering-2',
      title: 'Life Support Systems',
      description: 'Maintaining breathable air and water in space',
      type: 'simulation',
      difficulty: 'hard',
      points: 90,
      content: {
        facts: [
          'The ISS recycles 90% of its water from urine and sweat',
          'Carbon dioxide is removed using molecular sieves',
          'Oxygen is generated through electrolysis of water'
        ],
        tasks: [
          'Calculate oxygen requirements for a Mars mission',
          'Design a water recycling system',
          'Troubleshoot a CO2 scrubber failure'
        ]
      }
    }
  ],
  'Medicine & Human Factors': [
    {
      id: 'medicine-1',
      title: 'Bone Density in Space',
      description: 'Understanding how microgravity affects human bones',
      type: 'exploration',
      difficulty: 'medium',
      points: 70,
      content: {
        facts: [
          'Astronauts can lose up to 1-2% of bone density per month in space',
          'Exercise countermeasures include treadmills and resistance devices',
          'This research helps patients with osteoporosis on Earth'
        ],
        tasks: [
          'Research current countermeasures for bone loss',
          'Design an exercise program for a Mars mission',
          'Explain how this research benefits Earth medicine'
        ]
      }
    },
    {
      id: 'medicine-2',
      title: 'Space Psychology',
      description: 'Mental health challenges in isolated environments',
      type: 'analysis',
      difficulty: 'medium',
      points: 80,
      content: {
        facts: [
          'Long-duration missions can cause psychological stress',
          'Crew cohesion and conflict resolution are critical',
          'NASA uses virtual reality for psychological training'
        ],
        tasks: [
          'Identify psychological challenges of Mars missions',
          'Design communication protocols for crew mental health',
          'Develop strategies for maintaining morale'
        ]
      }
    }
  ],
  'Communications & Exploration': [
    {
      id: 'comm-1',
      title: 'Deep Space Communication',
      description: 'Communicating across vast distances in space',
      type: 'quiz',
      difficulty: 'easy',
      points: 45,
      content: {
        question: 'What is the primary challenge for communicating with spacecraft far from Earth?',
        options: [
          'Signal delay due to the speed of light',
          'Interference from solar radiation',
          'Limited power on spacecraft',
          'Antenna size restrictions'
        ],
        correctAnswer: 0,
        explanation: 'Light travels at about 300,000 km/s, so communicating with Mars can have delays up to 40 minutes round-trip. This makes real-time control impossible for distant missions.'
      }
    }
  ],
  'Astronomy & Navigation': [
    {
      id: 'astro-1',
      title: 'Celestial Navigation',
      description: 'Using stars to navigate in space',
      type: 'simulation',
      difficulty: 'medium',
      points: 65,
      content: {
        facts: [
          'Astronauts use star trackers for attitude determination',
          'The North Star is not visible from the southern hemisphere',
          'GPS doesn\'t work reliably in space'
        ],
        tasks: [
          'Practice identifying key navigation stars',
          'Calculate spacecraft orientation using star positions',
          'Design a backup navigation system'
        ]
      }
    }
  ],
  'Technology & Innovation': [
    {
      id: 'tech-1',
      title: 'Robotics in Space',
      description: 'Using robots for exploration and maintenance',
      type: 'analysis',
      difficulty: 'hard',
      points: 95,
      content: {
        facts: [
          'The Canadarm2 is a robotic arm used for ISS maintenance',
          'Robots can work in environments too dangerous for humans',
          'Autonomous systems reduce mission costs and risks'
        ],
        tasks: [
          'Design a robot for Mars sample collection',
          'Analyze benefits of robotic vs human exploration',
          'Develop control systems for space robotics'
        ]
      }
    }
  ],
  'general': [
    {
      id: 'general-1',
      title: 'Mission Control Communication',
      description: 'Learning how NASA communicates with spacecraft',
      type: 'simulation',
      difficulty: 'easy',
      points: 40,
      content: {
        facts: [
          'NASA uses the Deep Space Network with antennas around the world',
          'Communication delays can be up to 40 minutes for Mars missions',
          'Multiple communication protocols ensure reliable data transmission'
        ],
        tasks: [
          'Practice sending a message with communication delay',
          'Understand signal strength requirements',
          'Learn about emergency communication procedures'
        ]
      }
    },
    {
      id: 'general-2',
      title: 'Space Food Systems',
      description: 'Nutrition and food preparation in space',
      type: 'quiz',
      difficulty: 'easy',
      points: 35,
      content: {
        question: 'How do astronauts eat in microgravity?',
        options: [
          'Food is secured with Velcro and eaten with special utensils',
          'All food comes in liquid form through tubes',
          'Food is grown hydroponically in space',
          'Astronauts don\'t eat during spacewalks'
        ],
        correctAnswer: 0,
        explanation: 'In microgravity, food can float away, so it\'s secured with Velcro strips and eaten with utensils designed to keep food from floating. Liquids are consumed through straws from sealed containers.'
      }
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const missionId = searchParams.get('missionId')

    if (missionId) {
      // Return specific mission
      for (const pathMissions of Object.values(missions)) {
        const mission = pathMissions.find(m => m.id === missionId)
        if (mission) {
          return NextResponse.json({ mission })
        }
      }
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    if (path) {
      // Return missions for specific path
      const pathMissions = missions[path] || missions['general']
      return NextResponse.json({ missions: pathMissions })
    }

    // Return all missions
    return NextResponse.json({ missions })
  } catch (error) {
    console.error('Error fetching missions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, difficulty, type } = body

    // Generate a random mission based on filters
    let availableMissions = missions[path] || missions['general']

    if (difficulty) {
      availableMissions = availableMissions.filter(m => m.difficulty === difficulty)
    }

    if (type) {
      availableMissions = availableMissions.filter(m => m.type === type)
    }

    if (availableMissions.length === 0) {
      return NextResponse.json({ error: 'No missions found matching criteria' }, { status: 404 })
    }

    const randomMission = availableMissions[Math.floor(Math.random() * availableMissions.length)]
    return NextResponse.json({ mission: randomMission })
  } catch (error) {
    console.error('Error generating mission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

