import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/common/types';

const CARD_DECK = `/cards/Card_Deck_01.webp`;
const CARD_BACKFACE = `/cards/Card_Back_01.webp`;

const RenderCard = (canvasRef: React.RefObject<HTMLCanvasElement | null>, card: Card | null) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (card == null) {
    return;
  }

  const cardValue = card.value;
  const image = new window.Image();
  image.src = card.isFrontFace ? CARD_DECK : CARD_BACKFACE; // Path to sprite sheet

  image.onload = () => {
    const cardWidth = 234;
    const cardHeight = 333;

    let saturation = 6; // Adjust saturation level (e.g., 1 = normal, 2 = double, 0.5 = half)
    let hueRotation = 0;
    switch (card.level) {
      case (0): {
        hueRotation = 0;
        saturation = 2;
        break
      }
      case (1): {
        hueRotation = -140;
        break
      }
      case (2): {
        hueRotation = 100;
        break
      }
      case (3): {
        hueRotation = -30;
        break
      }
      case (4): {
        hueRotation = 20;
        break;
      }
      default: {
        if (!card.isFrontFace) hueRotation = 20;
        break;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (card.isFrontFace) {
      const cardsPerColumn = 13;
      const widthOffset = 234;
      const x = (Math.floor(cardValue / cardsPerColumn) * cardWidth) + (widthOffset * card.suit);
      const y = (cardValue % cardsPerColumn) * cardHeight;

      ctx.drawImage(image, x, y, cardWidth, cardHeight, 0, 0, cardWidth, cardHeight);
    } else {
      saturation = 8;
      ctx.drawImage(image, 0, 0, cardWidth, cardHeight, 0, 0, cardWidth, cardHeight);
    }
    ctx.filter = `hue-rotate(${hueRotation}deg) saturate(${saturation})`;

    ctx.drawImage(canvas, 0, 0);

    // Reset filter
    ctx.filter = 'none';
  };
}

interface CardVisualizationProps {
  card: Card | null;
}

const CardVisual: React.FC<CardVisualizationProps> = ({ card }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log("CardVisual useEffect with card: " + JSON.stringify(card));
    RenderCard(canvasRef, card);
  }, [card]);

  return (
    <div>
      <canvas ref={canvasRef} width={234} height={333} className="container mx-auto" />
    </div>
  )
}

export default CardVisual