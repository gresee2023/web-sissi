"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const dragOffsetRef = useRef(0);
  const touchStartXRef = useRef(0);

  const count = images.length;

  const goToPrevious = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === 0 ? count - 1 : prev - 1));
    },
    [count]
  );

  const goToNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === count - 1 ? 0 : prev + 1));
    },
    [count]
  );

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // Touch handlers for swipe gesture
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    dragOffsetRef.current = 0;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.touches[0].clientX - touchStartXRef.current;
      let offset = dx;
      // Rubber band effect at edges
      if (
        (currentIndex === 0 && dx > 0) ||
        (currentIndex === count - 1 && dx < 0)
      ) {
        offset = dx * 0.3;
      }
      dragOffsetRef.current = offset;
      setDragOffset(offset);
    },
    [currentIndex, count]
  );

  const handleTouchEnd = useCallback(() => {
    const threshold = 50;
    const offset = dragOffsetRef.current;

    setCurrentIndex((prev) => {
      if (offset < -threshold && prev < count - 1) return prev + 1;
      if (offset > threshold && prev > 0) return prev - 1;
      return prev;
    });

    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsSwiping(false);
  }, [count]);

  const resetTouch = useCallback(() => {
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsSwiping(false);
  }, []);

  if (count === 0) return null;

  // Single image — no carousel controls needed
  if (count === 1) {
    return (
      <div className="relative w-full aspect-[4/3] bg-muted rounded-2xl overflow-hidden">
        {!loadedImages.has(0) && <div className="absolute inset-0 image-loading" />}
        <Image
          src={images[0]}
          alt={alt}
          fill
          className={cn(
            "object-cover transition-opacity duration-300",
            loadedImages.has(0) ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => handleImageLoad(0)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-[4/3] bg-muted rounded-2xl overflow-hidden group touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetTouch}
    >
      {/* Sliding track — all images side by side, shifted via transform */}
      <div
        className={cn(
          "flex h-full will-change-transform",
          !isSwiping && "transition-transform duration-300 ease-out"
        )}
        style={{
          width: `${count * 100}%`,
          transform: `translateX(calc(${-(currentIndex * 100) / count}% + ${dragOffset}px))`,
        }}
      >
        {images.map((src, index) => (
          <div
            key={index}
            className="relative h-full"
            style={{ width: `${100 / count}%` }}
          >
            {!loadedImages.has(index) && (
              <div className="absolute inset-0 image-loading" />
            )}
            <Image
              src={src}
              alt={`${alt} - ${index + 1}`}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                loadedImages.has(index) ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => handleImageLoad(index)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index <= 1}
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows — visible on touch devices, hover-triggered on desktop */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center carousel-nav shadow-md active:scale-95"
        aria-label="上一张"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center carousel-nav shadow-md active:scale-95"
        aria-label="下一张"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              index === currentIndex
                ? "bg-white w-4"
                : "bg-white/60 hover:bg-white/80"
            )}
            aria-label={`第 ${index + 1} 张`}
          />
        ))}
      </div>

      {/* Image count badge */}
      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
        {currentIndex + 1}/{count}
      </div>
    </div>
  );
}
