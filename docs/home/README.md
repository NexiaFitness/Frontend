# Home Module - Documentación Completa

**Módulo:** Frontend - Landing Page  
**Versión:** v2.3.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📑 Índice

1. [Visión General](#visión-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Rutas y Navegación](#rutas-y-navegación)
4. [Componentes UI](#componentes-ui)
5. [Estado Actual](#estado-actual)

---

## 🎯 Visión General

El módulo **Home** es la landing page pública de NEXIA Fitness:

- **Hero Section** - Presentación principal con CTA
- **Problem Section** - Problema que resuelve la plataforma
- **Features Section** - Características principales
- **AI Section** - Roadmap de IA
- **FAQ Section** - Preguntas frecuentes
- **Contact Section** - Formulario de contacto

**Características principales:**
- ✅ Diseño responsive
- ✅ Gradientes mesh corporativos
- ✅ Animaciones y transiciones
- ✅ SEO optimizado
- ✅ Traducción completa al español

---

## 📁 Estructura de Archivos

### Páginas (Pages)

```
apps/web/src/pages/
└── Home.tsx                      # Página principal
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\Home.tsx`

### Componentes UI

```
apps/web/src/components/home/
├── HeroSection.tsx               # Sección hero principal
├── ProblemSection.tsx            # Sección de problema
├── FeaturesSection.tsx           # Sección de características
├── AISection.tsx                 # Sección de IA
├── FAQSection.tsx                # Sección de FAQ
├── ContactSection.tsx            # Sección de contacto
└── index.ts
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\home\HeroSection.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\home\ProblemSection.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\home\FeaturesSection.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\home\AISection.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\home\FAQSection.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\home\ContactSection.tsx`

---

## 🛣️ Rutas y Navegación

### Rutas Definidas

**Archivo de rutas:** `apps/web/src/App.tsx`

```typescript
<Route
    path="/"
    element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />
    }
/>
```

**Componente:** `Home.tsx`  
**Ruta completa:** `apps/web/src/pages/Home.tsx`

**Comportamiento:**
- Si el usuario está autenticado → Redirige a `/dashboard`
- Si el usuario no está autenticado → Muestra landing page

---

## 🎨 Componentes UI

### Home

**Ruta:** `apps/web/src/pages/Home.tsx`

**Responsabilidades:**
- Renderizar todas las secciones de la landing page
- Orden: Hero → Problem → Features → AI → FAQ → Contact
- Layout con PublicLayout (incluye PublicNavbar automáticamente)

**Secciones:**
1. **HeroSection** - Presentación principal
2. **ProblemSection** - Problema que resuelve
3. **FeaturesSection** - Características
4. **AISection** - Roadmap de IA
5. **FAQSection** - Preguntas frecuentes
6. **ContactSection** - Formulario de contacto

### HeroSection

**Ruta:** `apps/web/src/components/home/HeroSection.tsx`

**Responsabilidades:**
- Presentación principal de NEXIA
- Título, subtítulo, descripción
- CTAs (Call to Action): "Registrarse", "Iniciar Sesión"
- Fondo con gradiente mesh
- Diseño split screen

### ProblemSection

**Ruta:** `apps/web/src/components/home/ProblemSection.tsx`

**Responsabilidades:**
- Explicar el problema que resuelve NEXIA
- Fondo blanco con contraste emocional
- Lista de problemas comunes

### FeaturesSection

**Ruta:** `apps/web/src/components/home/FeaturesSection.tsx`

**Responsabilidades:**
- Grid de características principales
- Iconos y descripciones
- Fondo con gradiente mesh

### AISection

**Ruta:** `apps/web/src/components/home/AISection.tsx`

**Responsabilidades:**
- Roadmap de funcionalidades de IA
- Fondo con gradiente mesh invertido
- Timeline de implementación

### FAQSection

**Ruta:** `apps/web/src/components/home/FAQSection.tsx`

**Responsabilidades:**
- Accordion de preguntas frecuentes
- Fondo blanco
- Preguntas y respuestas expandibles

### ContactSection

**Ruta:** `apps/web/src/components/home/ContactSection.tsx`

**Responsabilidades:**
- Formulario de contacto
- Background image
- Campos: nombre, email, mensaje

---

## 📊 Estado Actual

### ✅ Implementado (v2.3.0)

#### Landing Page
- [x] Hero section con CTAs
- [x] Problem section
- [x] Features section
- [x] AI section con roadmap
- [x] FAQ section con accordion
- [x] Contact section con formulario
- [x] Diseño responsive
- [x] Gradientes mesh corporativos
- [x] Traducción completa al español

### 🚧 Pendiente

- [ ] Formulario de contacto funcional (backend)
- [ ] Analytics de conversión
- [ ] A/B testing de CTAs
- [ ] Video demo en hero section

---

## 🔗 Referencias Externas

### Documentación Relacionada
- [Auth](../auth/README.md)
- [UI Components](../ui/README.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Home v2.3.0

