#!/usr/bin/env node

/**
 * Script para inicializar la base de datos Unsent
 * Uso: node scripts/initDatabase.js [--reset]
 */

const { initializeUnsentDatabase, checkDatabaseHealth, resetDatabase } = require('../lib/initDatabase')

async function main() {
  const args = process.argv.slice(2)
  const shouldReset = args.includes('--reset')
  
  try {
    console.log('🔄 Conectando a la base de datos...')
    
    if (shouldReset) {
      console.log('⚠️  Reiniciando base de datos...')
      await resetDatabase()
    } else {
      console.log('🚀 Inicializando base de datos...')
      await initializeUnsentDatabase()
    }
    
    // Verificar salud de la base de datos
    console.log('\n🔍 Verificando salud de la base de datos...')
    const health = await checkDatabaseHealth()
    
    if (health.isHealthy) {
      console.log('✅ Base de datos saludable')
      console.log(`📊 Collections encontradas: ${health.collections.length}`)
      health.collections.forEach(col => console.log(`  - ${col}`))
    } else {
      console.log('❌ Problemas encontrados:')
      health.issues.forEach(issue => console.log(`  - ${issue}`))
    }
    
    console.log('\n🎉 ¡Proceso completado exitosamente!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main() 