"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Heart, Volume2 } from "lucide-react"

export default function Home() {
  const [hearts, setHearts] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      speed: number
      opacity: number
      clickBurst?: boolean
      buttonBurst?: boolean
      trailHeart?: boolean
      isEmoji?: boolean
      emoji?: string
    }>
  >([])
  const [heartCount, setHeartCount] = useState(0)
  const [lastAddedCount, setLastAddedCount] = useState(0)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [autoplayAttempted, setAutoplayAttempted] = useState(false)
  const cursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const trailIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element and attempt autoplay
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio()

    // Set audio source - this is a placeholder URL
    // In a real app, you would need to host this file or use a service
    audioRef.current.src = "/sexyback.mp3"
    audioRef.current.loop = true
    audioRef.current.volume = 0.7 // Set initial volume to 70%

    // Attempt to autoplay
    const attemptAutoplay = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play()
          setIsMusicPlaying(true)
          console.log("Autoplay successful")
        }
      } catch (error) {
        console.log("Autoplay prevented by browser:", error)
        // Keep the button visible as fallback
      } finally {
        setAutoplayAttempted(true)
      }
    }

    attemptAutoplay()

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  // Toggle music playback
  const toggleMusic = () => {
    if (!audioRef.current) return

    if (isMusicPlaying) {
      audioRef.current.pause()
      setIsMusicPlaying(false)
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error)
      })
      setIsMusicPlaying(true)
    }
  }

  // Set up cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Update cursor position as percentage of viewport
      cursorRef.current = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      }
    }

    // Create hearts at regular intervals
    const createTrailHeart = () => {
      if (cursorRef.current.x === 0 && cursorRef.current.y === 0) return

      const newHeart = {
        id: Date.now() + Math.random(),
        x: cursorRef.current.x,
        y: cursorRef.current.y,
        size: Math.random() * 1.2 + 0.8, // 0.8-2.0 size
        speed: Math.random() * 1.5 + 1.5, // 1.5-3s duration
        opacity: 0.8,
        trailHeart: true,
      }

      setHearts((prevHearts) => {
        const updatedHearts = [...prevHearts, newHeart]

        // Only limit trail hearts, not button hearts
        const trailHearts = updatedHearts.filter((h) => h.trailHeart)
        const buttonHearts = updatedHearts.filter((h) => !h.trailHeart)

        if (trailHearts.length > 200) {
          // Keep only the 200 most recent trail hearts
          const recentTrailHearts = trailHearts.slice(-200)
          // Combine with all button hearts (no limit)
          return [...buttonHearts, ...recentTrailHearts]
        }

        return updatedHearts
      })

      // Removed the line that increments heart count for trail hearts
    }

    // Start the interval to create trail hearts
    trailIntervalRef.current = setInterval(createTrailHeart, 100) // Create a heart every 100ms

    // Add mouse move listener
    window.addEventListener("mousemove", handleMouseMove)

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (trailIntervalRef.current) clearInterval(trailIntervalRef.current)
    }
  }, [])

  // Clean up only trail hearts, keep button hearts indefinitely
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setHearts((prevHearts) =>
        prevHearts.filter((heart) => {
          // Only clean up trail hearts, keep button hearts indefinitely
          if (heart.trailHeart) {
            return now - heart.id < heart.speed * 1000 + 500 // Add 500ms buffer
          }
          // Keep all button hearts (no cleanup)
          return true
        }),
      )
    }, 5000) // Check every 5 seconds

    return () => clearInterval(cleanupInterval)
  }, [])

  const addMoreLove = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the main click handler

    // Try to play music on first interaction if autoplay failed
    if (autoplayAttempted && !isMusicPlaying && audioRef.current) {
      audioRef.current.play().catch((e) => console.log("Still couldn't play audio:", e))
      setIsMusicPlaying(true)
    }

    // Generate a random number of hearts between 2 and 8
    const heartCount = Math.floor(Math.random() * 7) + 2 // Random integer from 2 to 8
    setLastAddedCount(heartCount)

    // Create the random number of hearts from random positions at the bottom of the screen
    const newHearts = Array.from({ length: heartCount }, (_, i) => {
      // Random position across the bottom of the screen
      const xPosition = Math.random() * 100 // 0-100% across the screen

      // Increased size range for emoji hearts
      const heartSize = Math.random() * 1.5 + 0.6 // 0.6-2.1 size range (bigger min and max)

      // Randomly select a heart emoji color
      const heartEmojis = ["❤️", "💖", "💗", "💓", "💕", "💞", "💘", "💝"]
      const randomEmoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)]

      return {
        id: Date.now() + i,
        x: xPosition,
        y: 95, // Start just above the bottom of the screen (95% from top)
        size: heartSize,
        speed: Math.random() * 4 + 8, // 8-12s range
        opacity: Math.random() * 0.3 + 0.7,
        buttonBurst: false, // Not using button burst animation
        isEmoji: true,
        emoji: randomEmoji,
      }
    })

    setHearts((prevHearts) => [...prevHearts, ...newHearts])
    setHeartCount((prevCount) => prevCount + heartCount)
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-pink-50 to-red-100 overflow-hidden">
      {/* Hearts background */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className={`absolute ${
            heart.clickBurst
              ? "animate-click-burst"
              : heart.buttonBurst
                ? "animate-button-burst"
                : heart.trailHeart
                  ? "animate-trail-heart"
                  : heart.isEmoji
                    ? "animate-button-float"
                    : "animate-float"
          }`}
          style={
            {
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              opacity: heart.opacity,
              "--heart-scale": heart.size,
              "--heart-opacity": heart.opacity,
              "--animation-duration": `${heart.speed}s`,
              animation: heart.clickBurst
                ? `click-burst ${heart.speed}s forwards ease-out`
                : heart.buttonBurst
                  ? `button-burst 3s forwards ease-out`
                  : heart.trailHeart
                    ? `trail-heart ${heart.speed}s forwards ease-out`
                    : heart.isEmoji
                      ? `button-float ${heart.speed}s forwards linear`
                      : undefined,
              pointerEvents: "none", // Prevent hearts from interfering with mouse events
              fontSize: heart.isEmoji ? `${Math.max(14, 20 * heart.size)}px` : undefined, // Increased base size
              lineHeight: 1,
            } as React.CSSProperties
          }
        >
          {heart.isEmoji ? (
            <span className="inline-block transform-gpu">{heart.emoji}</span>
          ) : (
            <Heart
              className={`${
                heart.clickBurst
                  ? "text-pink-600 fill-pink-600"
                  : heart.buttonBurst
                    ? "text-red-400 fill-red-400"
                    : heart.trailHeart
                      ? "text-pink-500 fill-pink-500"
                      : "text-red-500 fill-red-500"
              }`}
            />
          )}
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-red-600 mb-6 animate-pulse">
          Simulator de iubire Deliainatorul
        </h1>
        <p className="text-xl md:text-2xl text-red-800 max-w-md mb-8">
          ✨✨✨ O ploaie de inimi (de jos in sus) ce simbolizeaza dragostea mea pentru tine (f cringe) ✨✨✨
        </p>
        <div className="flex gap-4 animate-bounce">
          <span className="text-4xl">❤️</span>
          <span className="text-5xl">💖</span>
          <span className="text-4xl">💗</span>
        </div>

        {/* Heart Counter */}
        <div className="mt-6 bg-white/80 px-6 py-2 rounded-full shadow-md flex items-center gap-2">
          <span className="text-xl">❤️</span>
          <span className="text-lg font-bold text-red-600">{heartCount} Hearts</span>
        </div>

        <button
          onClick={addMoreLove}
          className="mt-8 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg transform transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
          aria-label="Add more love"
        >
          <span className="text-xl">❤️</span>
          <span>SEND MORE LOVE</span>
          <span className="text-xl">❤️</span>
        </button>

        {/* Music Control Button - only show if autoplay failed */}
        {autoplayAttempted && !isMusicPlaying && (
          <button
            onClick={toggleMusic}
            className="fixed bottom-4 right-4 p-3 bg-white/80 hover:bg-white/90 rounded-full shadow-md text-red-500 z-20 transition-transform hover:scale-110 active:scale-95"
            aria-label="Play music"
          >
            <Volume2 size={24} />
          </button>
        )}
      </div>
    </main>
  )
}
