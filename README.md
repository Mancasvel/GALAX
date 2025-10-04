# GALAX 🚀
### Guided Astronaut Learning And eXploration

*Your journey to the stars begins here.*

**GALAX** is an immersive, educational platform where students train to become astronauts through interactive missions guided by real NASA astronauts. Powered by AI mentors and realistic simulations, GALAX transforms space education into an engaging, hands-on experience.

---

## 🌟 THE MISSION

GALAX is not just a learning platform—it's a comprehensive astronaut training simulator. Through the ISS Cupola interface, students explore six specialized training paths, each mentored by actual NASA astronauts who guide them through missions, simulations, and real-world space challenges.

Every mission completed brings you closer to becoming a certified GALAX astronaut.

---

## 🛸 TRAINING PATHS

Your journey through space exploration follows six specialized paths, each representing a critical aspect of astronaut training:

### 🔬 **Science & Research**
> *Mentor: Dr. Mae Jemison*

Explore microgravity experiments, protein crystallization, and fluid physics. Learn how scientific research advances in the unique environment of space.

### ⚙️ **Engineering & Systems**
> *Mentor: Bob Behnken*

Master spacecraft thermal control, life support systems, and mechanical engineering. Understand the technology that keeps astronauts alive.

### 🏥 **Medicine & Human Factors**
> *Mentor: Dr. Serena Auñón-Chancellor*

Study bone density changes, cardiovascular adaptation, and psychological well-being in space. Learn how the human body adapts to extreme environments.

### 📡 **Communications & Exploration**
> *Mentor: Chris Hadfield*

Develop deep space communication skills and mission control coordination. Master the art of staying connected across vast distances.

### 🌟 **Astronomy & Navigation**
> *Mentor: Jessica Watkins*

Learn celestial navigation, planetary geology, and space orientation. Navigate using the stars like astronauts have for generations.

### 🤖 **Technology & Innovation**
> *Mentor: Victor Glover*

Explore space robotics, pilotage systems, and cutting-edge technology. Push the boundaries of what's possible in space.

---

## 🎮 FEATURES

### **The Cupola Interface**
- **Realistic ISS Design**: Train through an authentic recreation of the ISS Cupola
- **Interactive Windows**: Six hexagonal training paths plus a central hub
- **3D Depth Perception**: Experience the depth and structure of the actual Cupola
- **Progress Tracking**: Visual indicators show your advancement in each path

### **AI Mentor System**
- **Real NASA Astronauts**: Learn from actual space heroes
- **Contextual Guidance**: Mentors remember your conversations and progress
- **Educational Facts**: Receive NASA-verified information during training
- **Personalized Feedback**: Get encouragement and next steps tailored to you

### **NBL Training Simulation**
- **Neutral Buoyancy Lab**: Experience underwater spacewalk training
- **Realistic Physics**: Water resistance, buoyancy, and 3D movement
- **Task-Based Missions**: Complete authentic astronaut training exercises
- **Real-time Scoring**: Track oxygen, time, and mission completion

### **Mission System**
- **Progressive Difficulty**: Missions adapt to your skill level
- **Educational Content**: Learn real NASA procedures and facts
- **Interactive Challenges**: Quizzes, simulations, and exploration tasks
- **Achievement Tracking**: Earn points and unlock new paths

---

## 🏗️ TECHNICAL ARCHITECTURE

### **Core Technology Stack**
- **Framework**: Next.js 15 (App Router) with TypeScript
- **UI/UX**: React 18 with Framer Motion animations
- **Database**: MongoDB Atlas (Cloud-based progress storage)
- **AI System**: OpenRouter with Claude 3.5 Sonnet
- **Styling**: Tailwind CSS with custom space theme
- **Canvas Rendering**: HTML5 Canvas for 3D NBL simulation

### **Key Components**
- **SpaceBoard**: ISS Cupola interface with interactive paths
- **MentorModal**: AI-powered conversation system with context memory
- **NBLSimulation**: 3D underwater training game with physics
- **ProgressPanel**: Real-time tracking of achievements and points
- **MissionModal**: Interactive mission delivery system

### **AI Integration**
- **OpenRouter API**: Powers mentor conversations
- **Context Management**: Maintains conversation history per path
- **Prompt Engineering**: Each mentor has unique personality and expertise
- **Educational Focus**: Responses include NASA facts and guidance

---

## 🚀 GETTING STARTED

### **Prerequisites**
- Node.js 18+ 
- MongoDB Atlas account
- OpenRouter API key (for AI mentors)

### **Environment Variables**
```env
# Database Configuration
MONGODB_URI=your-mongodb-atlas-uri
MONGODB_DB_NAME=NASA_Space_Dome

# AI Configuration
OPENROUTER_API_KEY=your-openrouter-api-key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Installation**
```bash
# Clone the repository
git clone https://github.com/yourusername/galax.git
cd galax

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to begin your training!

### **Build for Production**
```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 📊 DATABASE STRUCTURE

### **Players Collection**
```javascript
{
  playerId: String,
  name: String,
  currentPath: String,
  mentor: String,
  progress: {
    'Science & Research': Number,
    'Engineering & Systems': Number,
    'Medicine & Human Factors': Number,
    'Communications & Exploration': Number,
    'Astronomy & Navigation': Number,
    'Technology & Innovation': Number
  },
  points: Number,
  astronautMode: Boolean,
  completedMissions: [String],
  currentMission: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎓 EDUCATIONAL VALUE

### **STEM Learning**
- Real NASA procedures and protocols
- Physics, engineering, and biology concepts
- Problem-solving and critical thinking
- Scientific method and experimentation

### **Career Exploration**
- Exposure to astronaut career paths
- Understanding of space industry roles
- Mentorship from real space professionals
- Inspiration for STEM careers

### **Skills Development**
- Sequential thinking and planning
- Resource management (oxygen, time)
- Spatial reasoning and navigation
- Communication and teamwork

---

## 🌌 GAME MECHANICS

### **Progression System**
- **Beginner** (0-250 points): Starting your journey
- **Intermediate** (250-500 points): Building expertise
- **Expert** (500-800 points): Advanced training
- **Astronaut** (800+ points): Mission-ready

### **Mission Types**
1. **Learning Missions**: Educational content and quizzes
2. **Simulation Missions**: NBL underwater training
3. **Exploration Missions**: Interactive space scenarios
4. **Challenge Missions**: Timed problem-solving tasks

### **Scoring System**
- Mission completion: 40-80 points (based on difficulty)
- Perfect execution: Bonus points
- Time efficiency: Additional rewards
- Path completion: Major achievements

---

## 🎨 DESIGN PHILOSOPHY

### **Visual Identity**
- **Colors**: Cyan, blue, and purple gradients representing space
- **Typography**: Modern, clean fonts with excellent readability
- **Animations**: Smooth Framer Motion transitions
- **Accessibility**: High contrast and clear visual hierarchy

### **User Experience**
- **Intuitive Navigation**: Clear paths and objectives
- **Immediate Feedback**: Real-time progress indicators
- **Engaging Interactions**: Hover effects and animations
- **Educational Focus**: Learning integrated into gameplay

---

## 🔮 FUTURE ENHANCEMENTS

### **Planned Features**
- [ ] Multiplayer missions and competitions
- [ ] Virtual reality Cupola experience
- [ ] More NASA astronaut mentors
- [ ] Advanced orbital mechanics simulations
- [ ] Certification system with digital badges
- [ ] Teacher dashboard for classroom use
- [ ] Mobile app for iOS and Android
- [ ] Integration with NASA APIs for real-time data

---

## 🤝 CONTRIBUTING

We welcome contributions that enhance the educational value and user experience of GALAX!

### **Areas for Contribution**
- Additional mission content
- New simulation scenarios
- Improved AI mentor responses
- Accessibility enhancements
- Performance optimizations
- Bug fixes and testing

### **How to Contribute**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📜 LICENSE

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 ACKNOWLEDGMENTS

- **NASA**: For inspiring generations to reach for the stars
- **Real NASA Astronauts**: Dr. Mae Jemison, Bob Behnken, Dr. Serena Auñón-Chancellor, Chris Hadfield, Jessica Watkins, Victor Glover, and Dr. Ellen Ochoa
- **OpenRouter**: For providing AI infrastructure
- **The Space Community**: For continuous inspiration

---

## 🌠 THE VISION

*"GALAX is more than an educational platform—it's a launchpad for the next generation of space explorers. Every student who trains here carries forward humanity's dream of reaching the stars."*

**Ready to begin your journey?**

🚀 **[Start Your Training](http://localhost:3000)** 🚀

---

*Built with 💙 for the future astronauts of tomorrow*