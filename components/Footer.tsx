'use client'

import { Divider } from '@heroui/react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">💌</span>
              </div>
              <span className="text-2xl font-bold text-white">Unsent</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              An augmented reality game with yourself. Process emotions through writing 
              unsent messages. Journey through 5 stages toward forgiveness and release.
            </p>
            <div className="flex gap-4 text-sm">
              <span className="text-slate-400">💭 Process</span>
              <span className="text-slate-400">🔥 Release</span>
              <span className="text-slate-400">🌅 Heal</span>
            </div>
          </div>

          {/* Journey */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Journey</h3>
            <div className="space-y-3">
              <a href="/conversations" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Conversations
              </a>
              <a href="/new-conversation" className="block text-slate-400 hover:text-white transition-colors text-sm">
                New Message
              </a>
              <a href="/people" className="block text-slate-400 hover:text-white transition-colors text-sm">
                People
              </a>
              <a href="/echoes" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Echoes
              </a>
              <a href="/demo-conversation" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Demo Experience
              </a>
            </div>
          </div>

          {/* Support & Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Support</h3>
            <div className="space-y-3">
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Help Center
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                How to Play
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Emotional Stages Guide
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Contact
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Blog
              </a>
            </div>
          </div>

          {/* Company & Community */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Company</h3>
            <div className="space-y-3">
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                About Us
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Mission & Values
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Team
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Join Us
              </a>
            </div>
            
            <div className="pt-4">
              <h4 className="font-medium mb-3 text-white">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  📸
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">YouTube</span>
                  📺
                </a>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-12 bg-slate-700" />

        {/* Footer bottom */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              Cookie Policy
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              Legal Notice
            </a>
          </div>
          
          <div className="text-sm text-slate-500 text-center lg:text-right">
            <p>© 2024 Unsent. All rights reserved.</p>
            <p className="text-xs mt-1">Made with ❤️ for emotional healing</p>
          </div>
        </div>
      </div>
    </footer>
  )
} 