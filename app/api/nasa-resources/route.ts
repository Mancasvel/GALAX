import { NextRequest, NextResponse } from 'next/server'

interface NASAResource {
  id: string
  title: string
  description: string
  type: 'image' | 'video' | 'article' | 'data' | 'mission'
  category: string
  url: string
  thumbnail?: string
  date: string
}

const nasaResources: Record<string, NASAResource[]> = {
  'Science & Research': [
    {
      id: 'apod-1',
      title: 'Astronomy Picture of the Day',
      description: 'Daily astronomy images with explanations',
      type: 'image',
      category: 'astronomy',
      url: 'https://apod.nasa.gov/apod/astropix.html',
      date: '2024-01-01'
    },
    {
      id: 'iss-research',
      title: 'ISS Research Overview',
      description: 'Current research being conducted on the International Space Station',
      type: 'article',
      category: 'space-station',
      url: 'https://www.nasa.gov/mission_pages/station/research/overview/',
      date: '2024-01-01'
    }
  ],
  'Engineering & Systems': [
    {
      id: 'spacecraft-design',
      title: 'Spacecraft Design Principles',
      description: 'Engineering fundamentals for spacecraft development',
      type: 'article',
      category: 'engineering',
      url: 'https://www.nasa.gov/audience/forstudents/5-8/features/nasa-knows/what-is-engineering-58.html',
      date: '2024-01-01'
    },
    {
      id: 'propulsion-systems',
      title: 'Rocket Propulsion',
      description: 'How rockets work and current propulsion technologies',
      type: 'article',
      category: 'propulsion',
      url: 'https://www.nasa.gov/audience/forstudents/5-8/features/nasa-knows/rocket-propulsion-58.html',
      date: '2024-01-01'
    }
  ],
  'Medicine & Human Factors': [
    {
      id: 'space-medicine',
      title: 'Space Medicine Overview',
      description: 'Medical challenges and solutions for space travel',
      type: 'article',
      category: 'medicine',
      url: 'https://www.nasa.gov/humans-in-space/space-medicine/',
      date: '2024-01-01'
    },
    {
      id: 'human-research',
      title: 'Human Research Program',
      description: 'NASA\'s research on human health in space',
      type: 'article',
      category: 'research',
      url: 'https://www.nasa.gov/humans-in-space/human-research-program/',
      date: '2024-01-01'
    }
  ],
  'Communications & Exploration': [
    {
      id: 'deep-space-network',
      title: 'Deep Space Network',
      description: 'NASA\'s global communication system for deep space missions',
      type: 'article',
      category: 'communication',
      url: 'https://www.nasa.gov/mission_pages/station/research/overview/',
      date: '2024-01-01'
    },
    {
      id: 'mars-communication',
      title: 'Communicating with Mars',
      description: 'Challenges and solutions for Mars mission communication',
      type: 'article',
      category: 'mars',
      url: 'https://mars.nasa.gov/news/communications/',
      date: '2024-01-01'
    }
  ],
  'Astronomy & Navigation': [
    {
      id: 'star-navigation',
      title: 'Celestial Navigation',
      description: 'Using stars for spacecraft navigation',
      type: 'article',
      category: 'navigation',
      url: 'https://www.nasa.gov/audience/forstudents/5-8/features/nasa-knows/celestial-navigation-58.html',
      date: '2024-01-01'
    },
    {
      id: 'hubble-telescope',
      title: 'Hubble Space Telescope',
      description: 'Images and discoveries from Hubble',
      type: 'image',
      category: 'telescope',
      url: 'https://hubblesite.org/',
      date: '2024-01-01'
    }
  ],
  'Technology & Innovation': [
    {
      id: 'robotics-nasa',
      title: 'NASA Robotics',
      description: 'Robotic systems used in space exploration',
      type: 'article',
      category: 'robotics',
      url: 'https://www.nasa.gov/audience/forstudents/5-8/features/nasa-knows/what-are-robots-58.html',
      date: '2024-01-01'
    },
    {
      id: 'space-technology',
      title: 'Space Technology Mission Directorate',
      description: 'NASA\'s technology development programs',
      type: 'article',
      category: 'technology',
      url: 'https://www.nasa.gov/directorates/spacetech/home/index.html',
      date: '2024-01-01'
    }
  ],
  'general': [
    {
      id: 'nasa-home',
      title: 'NASA Homepage',
      description: 'Official NASA website with latest news and information',
      type: 'article',
      category: 'general',
      url: 'https://www.nasa.gov/',
      date: '2024-01-01'
    },
    {
      id: 'mars-missions',
      title: 'Mars Missions',
      description: 'Current and past missions to Mars',
      type: 'mission',
      category: 'mars',
      url: 'https://mars.nasa.gov/',
      date: '2024-01-01'
    },
    {
      id: 'iss-missions',
      title: 'International Space Station',
      description: 'Information about the ISS and its missions',
      type: 'mission',
      category: 'space-station',
      url: 'https://www.nasa.gov/mission_pages/station/main/index.html',
      date: '2024-01-01'
    },
    {
      id: 'artemis-program',
      title: 'Artemis Program',
      description: 'NASA\'s program to return humans to the Moon',
      type: 'mission',
      category: 'moon',
      url: 'https://www.nasa.gov/specials/artemis/',
      date: '2024-01-01'
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')

    let resources: NASAResource[] = []

    if (category && category !== 'all') {
      // Get resources for specific category
      const categoryResources = nasaResources[category] || []
      resources = [...resources, ...categoryResources]
    } else {
      // Get resources from all categories
      for (const categoryResources of Object.values(nasaResources)) {
        resources = [...resources, ...categoryResources]
      }
    }

    // Filter by type if specified
    if (type && type !== 'all') {
      resources = resources.filter(resource => resource.type === type)
    }

    // Limit results
    resources = resources.slice(0, limit)

    // Sort by date (newest first)
    resources.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ resources })
  } catch (error) {
    console.error('Error fetching NASA resources:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, keywords } = body

    // This would typically search NASA's actual API or database
    // For demo purposes, we'll filter our static resources
    let resources: NASAResource[] = []

    if (category) {
      const categoryResources = nasaResources[category] || []
      resources = [...resources, ...categoryResources]
    } else {
      for (const categoryResources of Object.values(nasaResources)) {
        resources = [...resources, ...categoryResources]
      }
    }

    // Filter by keywords if provided
    if (keywords) {
      const searchTerms = keywords.toLowerCase().split(' ')
      resources = resources.filter(resource =>
        searchTerms.some(term =>
          resource.title.toLowerCase().includes(term) ||
          resource.description.toLowerCase().includes(term) ||
          resource.category.toLowerCase().includes(term)
        )
      )
    }

    // Limit to 20 results
    resources = resources.slice(0, 20)

    return NextResponse.json({ resources })
  } catch (error) {
    console.error('Error searching NASA resources:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

