import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image';
import { Card } from '@/common/types';
import CardVisual from './CardVisual';

interface CardProps {
  card: Card | null;
  cardIndex: number;
  cardValue: number;
  onClick?: () => void;
  isSelected?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, cardIndex, cardValue, onClick, isSelected }) => {  
    return (
      <button
        className={`min-w-28 max-w-64 p-4 border-4 ${
          isSelected ? "border-yellow-500" : "border-transparent"
        }`}
        onClick={() => {
          if (onClick) onClick();
        }}
      >
        <CardVisual card={card}/>
      </button>
    );
}

export default CardComponent