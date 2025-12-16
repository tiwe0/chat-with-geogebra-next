"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Calculator, Sparkles, Globe } from "lucide-react"
import { useTranslation, type Locale } from "@/lib/i18n"

export default function HomePage() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [locale, setLocale] = useState<Locale>('zh-CN')
  const { t } = useTranslation(locale)

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsNavigating(true)
    setTimeout(() => {
      router.push("/chat")
    }, 300)
  }

  const toggleLocale = () => {
    setLocale(prev => prev === 'zh-CN' ? 'en-US' : 'zh-CN')
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background to-muted transition-opacity duration-300 ${isNavigating ? "opacity-0" : "opacity-100"}`}>
      {/* Header */}
      <header className="border-b animate-in fade-in slide-in-from-top duration-500">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('home.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleLocale}
              className="transition-all hover:scale-105"
              title={locale === 'zh-CN' ? 'Switch to English' : '切换到中文'}
            >
              <Globe className="h-5 w-5" />
            </Button>
            <Link href="/chat" onClick={handleNavigate}>
              <Button className="transition-all hover:scale-105">{t('home.header.startButton')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center animate-in fade-in slide-in-from-bottom duration-700 delay-150">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold tracking-tight">
            {t('home.hero.title')}
            <span className="text-primary"> {t('home.hero.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('home.hero.description')}
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/chat" onClick={handleNavigate}>
              <Button size="lg" className="gap-2 transition-all hover:scale-105 hover:shadow-lg">
                <MessageSquare className="h-5 w-5" />
                {t('home.hero.startButton')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="transition-all hover:scale-105 hover:shadow-xl">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-transform hover:rotate-12">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('home.features.smartChat.title')}</CardTitle>
              <CardDescription>
                {t('home.features.smartChat.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-all hover:scale-105 hover:shadow-xl">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-transform hover:rotate-12">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('home.features.geogebraIntegration.title')}</CardTitle>
              <CardDescription>
                {t('home.features.geogebraIntegration.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-all hover:scale-105 hover:shadow-xl">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-transform hover:rotate-12">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('home.features.multiModel.title')}</CardTitle>
              <CardDescription>
                {t('home.features.multiModel.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
        <Card className="bg-primary text-primary-foreground transition-all hover:shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold">{t('home.cta.title')}</h3>
              <p className="text-lg opacity-90">
                {t('home.cta.description')}
              </p>
              <Link href="/chat" onClick={handleNavigate}>
                <Button size="lg" variant="secondary" className="mt-4 transition-all hover:scale-105 hover:shadow-lg">
                  {t('home.cta.button')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 animate-in fade-in duration-700 delay-700">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>{t('home.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}


