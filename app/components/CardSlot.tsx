import { BoardSquareRules, Card } from '@/common/types';
import React, { useContext, useEffect, useState } from 'react'
import { CurrentSelectedCard, CardSelection } from './Board';
import CardComponent from './CardComponent';
import CardVisual from './CardVisual';

interface CardProps {
  disabled: boolean;
  startCard: Card | null;
  boardSquare: number;
  onPlaceCard: (newCard: Card | null, slotId: number) => void;
}

const SetCurrentCardOnCardSlot = (
  slotId: number,
  cardSelection: Card | null,   
  currentlySelectedCard: Card | null,
  setCurrrentlySelectedCard: (selectedCard: Card | null) => void,
  onPlaceCard: (card: Card | null, slotId: number) => void
) => {
  if(currentlySelectedCard != null) return;
  onPlaceCard(cardSelection, slotId);
}

const CardSlot: React.FC<CardProps> = ({ disabled, startCard, boardSquare, onPlaceCard }) => {
  const {selectedCard, setSelectedCard} = useContext<CardSelection>(CurrentSelectedCard);
  const [currentlySelectedCard, setCurrrentlySelectedCard] = useState<Card | null>(startCard);

  useEffect(() => {
    console.log("TO BE UPDATED WITH: " + startCard);
    setCurrrentlySelectedCard(startCard);
  }, [startCard]);

  return (
    <div className={`flex flex-col items-center ${disabled ? `opacity-25` : ``}`}>
      <div className='bg-purple-950 text-yellow-500'>+{BoardSquareRules[boardSquare].reward(0)}</div>
      <button 
      disabled={disabled}
      className={`border-white border-1 bg-black rounded-lg font-semibold ${!disabled ? ` hover:bg-blue-300 active:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500` : ``}`}
      onClick={() => {
        SetCurrentCardOnCardSlot(boardSquare, selectedCard, currentlySelectedCard, setCurrrentlySelectedCard, onPlaceCard);
      }}
      >
        <CardVisual card={currentlySelectedCard}/>
      </button>
    </div>    
  )
}

export default CardSlot