import { useContext, useEffect, useState, createContext } from "react";
import React from 'react';
import { ConnectionInfoContext } from "./App";
import { Socket } from "socket.io-client";
import {
  BoardSquareRules, SquareRule, GameRules,
  RoundState, CardSuit, PlayerHand,
  Card,
  CreateCard
} from '../../common/types';
import { RoomContext } from "./Game";
import CardComponent from "./CardComponent";
import CardSlot from "./CardSlot";
import CardStealSlot from "./CardStealSlot";

let roomId = 0;
let playerId = "";

const SendSlotUpdateEventToServer = (socket: Socket | null, slotId: number, card: Card) => {
  if (!socket) return;
  socket.emit("slot-update-event", { playerId: playerId, roomId: roomId, slotId: slotId, card: card });
}

const SendStealSlotUpdateEventToServer = (socket: Socket | null, slotId: number, setStolenCards: React.Dispatch<React.SetStateAction<(Card | null)[]>>) => {
  if (!socket) return;
  socket.emit("steal-slot-update-event", { playerId: playerId, roomId: roomId, slotId: slotId });
  socket.on('steal-slot-result', ({ resultCard, slotId }: { resultCard: Card | null, slotId: number }) => {
    console.log("steal-slot-result" + JSON.stringify(resultCard));
    setStolenCards((prevResults) => {
      const updatedResults = [...prevResults];
      updatedResults[slotId] = resultCard;
      console.log("steal-slot-result after" + JSON.stringify(updatedResults));
      return updatedResults;
    });
  });
}

const backgroundColors = [
  "border-red-200",
  "border-cyan-200",
  "border-green-200",
  "border-yellow-200",
  "border-purple-200",
  "border-pink-200",
];

export type CardSelection = {
  selectedCard: Card | null;
  setSelectedCard: (selectedCard: Card | null) => void;
}

const DefaultCardSelection = {
  selectedCard: null,
  setSelectedCard: () => { }
}

export const CurrentSelectedCard = createContext<CardSelection>(DefaultCardSelection);

const createBackCards = (amount: number): Card[] => {
  const backCards: Card[] = [];
  for (let i = 0; i < amount; i++) {
    backCards.push(CreateCard(0, CardSuit.SPECIAL, false, 0));
  }
  return backCards;
}

const addBoardCardsBackToHand = (boardSlots: Array<Card | null>, hands: PlayerHand) => {
  const newHands = hands;
  boardSlots.forEach((card) => {
    if (card) {
      newHands.cards.push(card);
    }
  });
  return newHands;
}

const Board = () => {
  const { socket } = useContext(ConnectionInfoContext);
  const roomInfo = useContext(RoomContext);
  const matchState = roomInfo?.matchState;
  const isPlayerA = roomInfo?.matchState.isPlayerA;
  const points = isPlayerA ? matchState?.playerAHands : matchState?.playerBHands;
  const [selectedToken, setSelectedToken] = useState<Number>(0);
  const [roundState, setRoundState] = useState<RoundState>(0);
  const [myBoardEnabled, setMyBoardEnabled] = useState<Boolean>(false);
  const [myHands, setMyHands] = useState<Card[]>([]);
  const [mySlots, setMySlots] = useState<Array<Card | null>>([null, null, null, null, null, null]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [startCard, setStartCard] = useState<Array<Card | null>>([null, null, null, null, null, null]);
  const [stolenCards, setStolenCards] = useState<Array<Card | null>>(createBackCards(6));

  useEffect(() => {
    if (!roomInfo) return;
    console.log(roomInfo);
    roomId = +roomInfo.id;
    playerId = isPlayerA ? roomInfo.playerA.id.toString() : roomInfo.playerB.id.toString();
    const currentHand = isPlayerA ? matchState!.playerAHands : matchState!.playerBHands;
    const currentSlots: Array<Card | null> = isPlayerA ? matchState!.playerABoardSlots : matchState!.playerBBoardSlots;
    //addBoardCardsBackToHand(currentSlots, currentHand); TODO How to add board cards back to hand properly and with slot bonus?
    setMyHands(currentHand.cards);
    setMySlots(currentSlots);
    setRoundState(roomInfo!.matchState.roundState);
    setMyBoardEnabled(roomInfo!.matchState.roundState == RoundState.IS_PLACE_POINTS);
    setStolenCards(createBackCards(6));
    if (roomInfo!.matchState.roundState == RoundState.IS_ROUND_START) setSelectedToken(0);
  }, [roomInfo])

  useEffect(() => {
    setStartCard(mySlots);
  }, [mySlots])

  const handlePlaceCard = (newCard: Card | null, slotId: number) => {
    if (newCard == null || newCard.id == -1) return;
    setMyHands((prevHands) => prevHands.filter((card) => card.id !== newCard.id));
    setMySlots((prevSlots) => {
      const updatedSlots = [...prevSlots];
      updatedSlots[slotId] = newCard;
      return updatedSlots;
    });
    setCurrentCard(null);
    SendSlotUpdateEventToServer(socket, slotId, newCard);
  };

  const handleStealCard = (stealSlotId: number) => {
    if (stealSlotId == -1) return;
    SendStealSlotUpdateEventToServer(socket, stealSlotId, setStolenCards);
  };

  return (
    <CurrentSelectedCard.Provider value={{ selectedCard: currentCard, setSelectedCard: setCurrentCard }}>
      <div className="
    grid grid-rows-4
    min-h-board-min-height 
    max-h-board-max-height 
    min-w-board-min-width 
    max-w-board-max-width 
    bg-purple-800">
        <div>Top Board Player Hand</div>
        <div className={`grid grid-rows-1 grid-cols-6 min-w-board-min-width max-w-board-max-width bg-gray-800 ${!myBoardEnabled ? `opacity-100` : ``}`}>
          {stolenCards.map((card, index) => (
            <CardStealSlot key={index} disabled={roundState != RoundState.IS_STEAL_POINTS} boardSquare={index} onStealCard={handleStealCard} cardResult={card} />
          ))}
        </div>
        <div className={`grid grid-rows-1 grid-cols-6 min-w-board-min-width max-w-board-max-width bg-gray-800 ${!myBoardEnabled ? `opacity-100` : ``}`}>
          {mySlots.map((card, index) => (
            <CardSlot key={index} disabled={roundState != RoundState.IS_PLACE_POINTS} startCard={card} boardSquare={index} onPlaceCard={handlePlaceCard} />
          ))}
        </div>
        <div className="grid grid-rows-1 grid-flow-col min-w-board-min-width max-w-board-max-width bg-orange-950">
          {myHands.map((card, index) => (
            <CardComponent
              key={index}
              card={myHands[index]}
              cardValue={myHands[index].value ?? 99}
              cardIndex={+index}
              onClick={() => setCurrentCard(card)} // Set the current card when clicked
              isSelected={currentCard === card} // Highlight if the card is selected
            />
          ))}
        </div>
      </div>
    </CurrentSelectedCard.Provider>
  );

};

export default Board;
