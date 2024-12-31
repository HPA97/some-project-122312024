import { BoardSquareRules, Card, CreateCard, CardSuit } from '@/common/types';
import React, { use, useContext, useState, useEffect } from 'react'
import { CurrentSelectedCard, CardSelection } from './Board';
import CardComponent from './CardComponent';
import CardVisual from './CardVisual';

interface CardProps {
  disabled: boolean;
  boardSquare: number;
  onStealCard: (slotId: number) => void;
  cardResult: Card | null;
}

const backFaceCard: Card = CreateCard(0, CardSuit.SPECIAL, false, 0);

const CardSlot: React.FC<CardProps> = ({ disabled, boardSquare, onStealCard, cardResult }) => {
  const {selectedCard, setSelectedCard} = useContext<CardSelection>(CurrentSelectedCard);
  const [currentlySelectedCard, setCurrrentlySelectedCard] = useState<Card | null>(backFaceCard);

  useEffect(() => {
    console.log("CardStealSlot useEffect(): " + JSON.stringify(cardResult));
    setCurrrentlySelectedCard(cardResult);
  }, [cardResult]);

  return (
    <div className={`flex flex-col items-center ${disabled ? `opacity-25` : ``}`}>
      <div className='bg-purple-950 text-yellow-500'>+{BoardSquareRules[boardSquare].reward(0)}</div>
      <button 
      disabled={disabled}
      className={`border-white border-1 bg-red-950 rounded-lg font-semibold ${!disabled ? ` hover:bg-blue-300 active:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500` : ``}`}
      onClick={() => {
        onStealCard(boardSquare);
      }}
      >
        <CardVisual card={currentlySelectedCard}/>
      </button>
    </div>    
  )
}

export default CardSlot