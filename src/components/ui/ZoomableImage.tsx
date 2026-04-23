"use client";

import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from './Button';

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export function ZoomableImage({ src, alt }: ZoomableImageProps) {
  return (
    <div className="relative w-full h-[500px] border border-muted-bg rounded-lg overflow-hidden bg-surface shadow-inner flex items-center justify-center">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
              <Button 
                variant="secondary"
                size="icon"
                onClick={() => zoomIn()}
                aria-label="Acercar"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="secondary"
                size="icon"
                onClick={() => zoomOut()}
                aria-label="Alejar"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="secondary"
                size="icon"
                onClick={() => resetTransform()}
                aria-label="Restablecer Zoom"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
