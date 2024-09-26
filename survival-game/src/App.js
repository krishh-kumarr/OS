import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import './App.css';

// Constants for game settings
const GRID_SIZE = 8;
const GAME_DURATION = 120000; // 2 minutes in milliseconds

const App = () => {
  const { register, handleSubmit } = useForm();
  const [players, setPlayers] = useState([
    { id: 1, name: '', position: { x: 0, y: 0 }, food: 5, water: 5, wood: 5, icon: '' },
    { id: 2, name: '', position: { x: 7, y: 7 }, food: 5, water: 5, wood: 5, icon: '' },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [resources, setResources] = useState({
    water: { amount: 3, position: getRandomPosition() },
    food: { amount: 3, position: getRandomPosition() },
    wood: { amount: 3, position: getRandomPosition() },
  });
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(GAME_DURATION);

  // Function to generate random positions for resources
  function getRandomPosition() {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }

  // Function to reset resource position after collection
  const resetResource = (resourceName) => {
    setResources((prevResources) => ({
      ...prevResources,
      [resourceName]: {
        ...prevResources[resourceName],
        position: getRandomPosition(),
      },
    }));
  };

  // Keyboard movement controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;

      const newPlayers = [...players];
      const player = newPlayers[currentPlayerIndex];

      // Arrow key movements
      switch (e.key) {
        case 'ArrowLeft':
          if (player.position.y > 0) player.position.y -= 1;
          break;
        case 'ArrowRight':
          if (player.position.y < GRID_SIZE - 1) player.position.y += 1;
          break;
        case 'ArrowDown':
          if (player.position.x < GRID_SIZE - 1) player.position.x += 1;
          break;
        case 'ArrowUp':
          if (player.position.x > 0) player.position.x -= 1;
          break;
        default:
          break;
      }

      // Check for resource collection
      const resourceHere = Object.keys(resources).find(
        (r) =>
          resources[r].position.x === player.position.x &&
          resources[r].position.y === player.position.y
      );

      if (resourceHere && resources[resourceHere].amount > 0) {
        resources[resourceHere].amount -= 1;
        if (resourceHere === 'water') player.water += 1;
        if (resourceHere === 'food') player.food += 1;
        if (resourceHere === 'wood') player.wood += 1;

        resetResource(resourceHere);
      }

      // Check for game over conditions
      if (player.food <= 0 || player.water <= 0 || player.wood <= 0) {
        setGameOver(true);
        alert(`${player.name} ran out of resources! Game over.`);
        return;
      }

      setPlayers(newPlayers);
      setCurrentPlayerIndex((currentPlayerIndex + 1) % 2);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [players, resources, currentPlayerIndex, gameOver]);

  // Timer effect to end the game after 2 minutes
  useEffect(() => {
    if (timer <= 0) {
      setGameOver(true);
      const player1Score = players[0].food + players[0].water + players[0].wood;
      const player2Score = players[1].food + players[1].water + players[1].wood;
      const winner = player1Score > player2Score ? players[0].name : players[1].name;
      alert(`Time's up! ${winner} wins!`);
      return;
    }

    const intervalId = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1000);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timer, players]);

  // Handle form submission for player names and icons
  const onSubmit = (data) => {
    const player1Icon = URL.createObjectURL(data.icon1[0]);
    const player2Icon = URL.createObjectURL(data.icon2[0]);
    setPlayers([
      { ...players[0], name: data.player1, icon: player1Icon },
      { ...players[1], name: data.player2, icon: player2Icon },
    ]);
  };

  // Player name and icon input form with animations
  return (
    <div className="App">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        Resource Management Survival Game
      </motion.h1>
      {!players[0].name || !players[1].name ? (
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <label>
            Player 1 Name:
            <input {...register('player1')} required />
          </label>
          <br />
          <label>
            Player 1 Icon:
            <input type="file" {...register('icon1')} required accept="image/*" />
          </label>
          <br />
          <label>
            Player 2 Name:
            <input {...register('player2')} required />
          </label>
          <br />
          <label>
            Player 2 Icon:
            <input type="file" {...register('icon2')} required accept="image/*" />
          </label>
          <br />
          <motion.button type="submit" whileHover={{ scale: 1.1 }} className="start-button">
            Start Game
          </motion.button>
        </motion.form>
      ) : (
        <>
          <h2>Time Remaining: {Math.floor(timer / 1000)} seconds</h2>
          <GameGrid players={players} resources={resources} />
          <div className="player-info">
            <h2>Current Player: {players[currentPlayerIndex]?.name}</h2>
            {players.map((player) => (
              <p key={player.id}>
                <img src={player.icon} alt={player.name} className="player-icon" />
                {player.name}: Food = {player.food}, Water = {player.water}, Wood = {player.wood}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Game grid component for displaying players and resources
const GameGrid = ({ players, resources }) => {
  return (
    <div className="grid">
      {Array.from({ length: GRID_SIZE }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {Array.from({ length: GRID_SIZE }).map((_, colIndex) => {
            const playerHere = players.find(
              (p) => p.position.x === colIndex && p.position.y === rowIndex
            );
            const resourceHere = Object.keys(resources).find(
              (r) =>
                resources[r].position.x === colIndex &&
                resources[r].position.y === rowIndex
            );

            // Resource icons
            const resourceIcons = {
              water: '/public/water_drink_bottle_icon-icons.com_51087.png',
              food: '/public/image.png', // Path to your food icon image
              wood: '/public/1486071980-1_79325.png', // Path to your wood icon image
            };

            return (
              <motion.div
                key={colIndex}
                className={`grid-cell ${
                  playerHere ? `player-${playerHere.id}` : resourceHere ? `resource-${resourceHere}` : ''
                }`}
                animate={{ scale: playerHere ? 1.2 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {playerHere ? (
                  <img src={playerHere.icon} alt={playerHere.name} className="player-icon" />
                ) : resourceHere ? (
                  <img src={resourceIcons[resourceHere]} alt={resourceHere} className="resource-icon" />
                ) : (
                  ''
                )}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default App;
